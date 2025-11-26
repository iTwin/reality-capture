import * as fs from "fs";
import * as path from "path";
import { ContainerClient } from "@azure/storage-blob";
import type { AuthorizationClient } from "@itwin/core-common";
import { BentleyError } from "@itwin/core-bentley";
//TODO : ThreadPool type does not have native Node.js equivalent. Multi-thread for IO must be readapted (here, ploads and downloads are sequential.
//import { ThreadPool } from "some-threadpool-lib";
import { DetailedError } from "./error";
import { ITwinRealityData, RealityDataAccessClient, type RealityDataClientOptions } from "@itwin/reality-data-client";
import { Response } from "./response";
import { RealityCaptureService } from "./service";
import { BucketResponse } from "./bucket";


type ProgressHook = ((percent: number) => boolean) | null;

class _DataHandler {
    static _getFilesAndSizes(srcPath: string): Array<[string, number]> {
        if (fs.statSync(srcPath).isDirectory()) {
            const filesTuple: Array<[string, number]> = [];
            const walk = (dir: string) => {
                for (const item of fs.readdirSync(dir)) {
                    const fullPath = path.join(dir, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        walk(fullPath);
                    } else {
                        filesTuple.push([
                            path.relative(srcPath, fullPath),
                            fs.statSync(fullPath).size,
                        ]);
                    }
                }
            };
            walk(srcPath);
            return filesTuple;
        } else {
            return [[path.basename(srcPath), fs.statSync(srcPath).size]];
        }
    }

    static _getNbThreads(files: Array<[string, number]>): number {
        const sizeThreshold = 5 * 1024 * 1024; // 5mb
        const nbSmallFiles = files.filter(([_, size]) => size <= sizeThreshold).length;
        return Math.min(32, 4 + Math.floor(nbSmallFiles / 100));
    }

    static async downloadData(containerUrl: string, dst: string, src: string, progressHook: ProgressHook): Promise<Response<null>> {
        const client = new ContainerClient(containerUrl);
        const blobs = [];
        for await (const blob of client.listBlobsFlat()) {
            if (blob.name.startsWith(src)) blobs.push([blob.name, blob.properties.contentLength || 0]);
        }
        //const nbThreads = _DataHandler._getNbThreads(blobs);
        const totalSize = blobs.reduce((acc, [, size]) => acc + (size as number), 0);
        let proceed = true;
        const downloadedValues: { [k: string]: number } = {};

        const downloadBlob = async (blobTuple: [string, number]) => {
            const [blobName, blobSize] = blobTuple;
            const blockBlobClient = client.getBlobClient(blobName);
            let loaded = 0;
            const downloadResponse = await blockBlobClient.download();
            const chunks: Buffer[] = [];
            for await (const chunk of downloadResponse.readableStreamBody!) {
                loaded += chunk.length;
                chunks.push(chunk as Buffer);
                if (progressHook) {
                    downloadedValues[blobName] = loaded;
                    const percent =
            (Object.values(downloadedValues).reduce((a, b) => a + b, 0) / totalSize) * 100;
                    proceed = proceed && progressHook(percent);
                    if (!proceed) throw new Error("Download interrupted by callback function");
                }
            }
            // Write file
            let relPath = blobName === src ? path.basename(src) : blobName.substring(src.length);
            relPath = relPath.replace(/^\/+/, "");
            const filePath = path.join(dst, relPath);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, Buffer.concat(chunks));
            downloadedValues[blobName] = blobSize;
        };

        try {
            // TODO: Implement parallel downloads in Node.js. Here it's sequential for demo purposes.
            for (const blobTuple of blobs) {
                await downloadBlob([blobTuple[0] as string, blobTuple[1] as number]);
            }
        } catch (err: any) {
            if (err.message === "Download interrupted by callback function") {
                const de = { 
                    error : {code: "UploadInterrupted", message: "Upload was interrupted by user."}
                };
                return new Response(499, de, null);
            } else {
                const de = { 
                    error : {code: "UploadFailure", message: `Upload failed: ${err}.`}
                };
                return new Response(500, de, null);
            }
        }
        return new Response(200, null, null);
    }

    static async uploadData(containerUrl: string, src: string, realityDataDst: string, progressHook: ProgressHook): Promise<Response<null>> {
        const files = _DataHandler._getFilesAndSizes(src);
        const nbThreads = _DataHandler._getNbThreads(files);
        const totalSize = files.reduce((acc, [, size]) => acc + size, 0);
        let proceed = true;
        const uploadedValues: { [k: string]: number } = {};
        const client = new ContainerClient(containerUrl);

        const uploadFile = async (fileTuple: [string, number]) => {
            const [fileName, fileSize] = fileTuple;
            const filePath = fs.statSync(src).isDirectory() ? path.join(src, fileName) : src;
            const blockBlobClient = client.getBlockBlobClient(path.join(realityDataDst, fileName));
            let loaded = 0;
            const data = fs.readFileSync(filePath);
            // Simulate progress with one chunk for demo (implement chunked upload for real progress)
            await blockBlobClient.upload(data, data.length, {
                onProgress: (ev) => {
                    loaded = ev.loadedBytes;
                    if (progressHook) {
                        uploadedValues[fileName] = loaded;
                        const percent =
              (Object.values(uploadedValues).reduce((a, b) => a + b, 0) / totalSize) * 100;
                        proceed = proceed && progressHook(percent);
                        if (!proceed) throw new Error("Upload interrupted by callback function");
                    }
                },
                blobHTTPHeaders: { blobContentType: "application/octet-stream" },
            });
            uploadedValues[fileName] = fileSize;
        };

        try {
            for (const fileTuple of files) {
                await uploadFile(fileTuple);
            }
        } catch (err: any) {
            if (err.message === "Upload interrupted by callback function") {
                const de = { 
                    error : {code: "UploadInterrupted", message: "Upload was interrupted by user."}
                };
                return new Response(499, de, null);
            } else {
                const de = { 
                    error : {code: "UploadFailure", message: `Upload failed: ${err}.`}
                };
                return new Response(500, de, null);
            }
        }
        return new Response(200, null, null);
    }

    static async listData(containerUrl: string): Promise<Response<string[]>> {
        const client = new ContainerClient(containerUrl);
        const blobNames: string[] = [];
        for await (const blob of client.listBlobsFlat()) {
            blobNames.push(blob.name);
        }
        return new Response(200, null, blobNames);
    }

    static async deleteData(containerUrl: string, filesToDelete: string[]): Promise<Response<null>> {
        const client = new ContainerClient(containerUrl);
        const failed: string[] = [];
        for (const file of filesToDelete) {
            try {
                await client.deleteBlob(file);
            } catch (_e) {
                failed.push(file);
            }
        }
        const detailsArray = failed.map((fail) => ({
            code: "DeletionFailed",
            message: "Failed to delete a file",
            target: fail
        }));
        if (!failed.length) {
            return new Response(204, null, null);
        }
        const detailedError = {
            code: "DeletionFailed",
            message: "Failed to delete one or multiple files",
            details: detailsArray
        } as DetailedError;
        return new Response(400, { error: detailedError }, null);
    }
}

export class RealityDataHandler {
    private _realityDataClient: RealityDataAccessClient;
    private _progressHook: ProgressHook;

    constructor(authorizationClient: AuthorizationClient, kwargs?: any) {
        const env = kwargs?.env;
        let url = "";
        if(env === "dev" || env === "qa")
            url = "https://" + env + "-api.bentley.com/reality-management/reality-data";
        else
            url = "https://api.bentley.com/reality-management/reality-data";
        const realityDataClientOptions: RealityDataClientOptions = {
            authorizationClient: authorizationClient,
            baseUrl: url,
        };
        this._realityDataClient = new RealityDataAccessClient(realityDataClientOptions);
        this._progressHook = null;
    }

    private async _getContainerUrlFromRealityDataId(realityDataId: string, iTwinId?: string, writeAccess: boolean = false): Promise<Response<string>> {
        let realityData: ITwinRealityData;
        try {
            realityData = await this._realityDataClient.getRealityData("", iTwinId, realityDataId);
        }
        catch(error: any) {
            console.log("Cannot find reality data id " + realityDataId + " in iTwin " + iTwinId);
            if(error instanceof BentleyError)
                return new Response(error.errorNumber, { error : { code: error.name, message: error.message }}, "");
            else
                return new Response(520, { error : { code: "UnknownError", message: "Unknown error"}}, "");
        }
        const url = await realityData.getBlobUrl("", "", writeAccess);
        return new Response(200, null, url.toString());
    }

    async uploadData(realityDataId: string, src: string, realityDataDst = "", iTwinId?: string): Promise<Response<null>> {
        const urlResponse = await this._getContainerUrlFromRealityDataId(realityDataId, iTwinId, true);
        if(urlResponse.isError()) {
            return new Response<null>(urlResponse.status_code, urlResponse.error);
        }
        const resp = await _DataHandler.uploadData(urlResponse.value!, src, realityDataDst, this._progressHook);
        return resp;
    }

    async downloadData(realityDataId: string, dst: string, realityDataSrc = "", iTwinId?: string): Promise<Response<null>> {
        const urlResponse = await this._getContainerUrlFromRealityDataId(realityDataId, iTwinId, false);
        if(urlResponse.isError()) {
            return new Response<null>(urlResponse.status_code, urlResponse.error);
        }
        return await _DataHandler.downloadData(urlResponse.value!, dst, realityDataSrc, this._progressHook);
    }

    async listData(realityDataId: string, iTwinId?: string): Promise<Response<string[]>> {
        const urlResponse = await this._getContainerUrlFromRealityDataId(realityDataId, iTwinId, false);
        if(urlResponse.isError()) {
            return new Response<string[]>(urlResponse.status_code, urlResponse.error, []);
        }
        return await _DataHandler.listData(urlResponse.value!);
    }

    async deleteData(realityDataId: string, filesToDelete: string[], iTwinId?: string): Promise<Response<null>> {
        const urlResponse = await this._getContainerUrlFromRealityDataId(realityDataId, iTwinId, false);
        if(urlResponse.isError()) {
            return new Response<null>(urlResponse.status_code, urlResponse.error);
        }
        return await _DataHandler.deleteData(urlResponse.value!, filesToDelete);
    }

    setProgressHook(hook: ProgressHook): void {
        this._progressHook = hook;
    }
}

export class BucketDataHandler {
    private _service: RealityCaptureService;
    private _progressHook: ProgressHook;

    constructor(authorizationClient: AuthorizationClient, kwargs?: any) {
        this._service = new RealityCaptureService(authorizationClient, kwargs);
        this._progressHook = null;
    }

    private async _getBucket(itwinId: string): Promise<Response<BucketResponse>> {
        return await this._service.getBucket(itwinId);
    }

    async uploadData(itwinId: string, src: string, bucketDst = ""): Promise<Response<null>> {
        const r = await this._getBucket(itwinId);
        if (r.isError()) return new Response(r.status_code, r.error, null);
        return await _DataHandler.uploadData(r.value!._links.containerUrl.href, src, bucketDst, this._progressHook);
    }

    async downloadData(itwinId: string, dst: string, bucketSrc = ""): Promise<Response<null>> {
        const r = await this._getBucket(itwinId);
        if (r.isError()) return new Response(r.status_code, r.error, null);
        return await _DataHandler.downloadData(r.value!._links.containerUrl.href, dst, bucketSrc, this._progressHook);
    }

    async listData(itwinId: string): Promise<Response<string[]>> {
        const r = await this._getBucket(itwinId);
        if (r.isError()) return new Response<string[]>(r.status_code, r.error, null);
        return await _DataHandler.listData(r.value!._links.containerUrl.href);
    }

    async deleteData(itwinId: string, filesToDelete: string[]): Promise<Response<null>> {
        const r = await this._getBucket(itwinId);
        if (r.isError()) return new Response(r.status_code, r.error, null);
        return await _DataHandler.deleteData(r.value!._links.containerUrl.href, filesToDelete);
    }

    setProgressHook(hook: ProgressHook): void {
        this._progressHook = hook;
    }
}
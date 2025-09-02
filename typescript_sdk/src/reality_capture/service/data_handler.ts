import * as fs from "fs";
import * as path from "path";
import { ContainerClient } from "@azure/storage-blob";
// TODO : ThreadPool type does not have native Node.js equivalent : multi-thread for IO must be readapted (here, ploads and downloads are sequential.
//import { ThreadPool } from "some-threadpool-lib";
import {
  DetailedErrorResponse,
  DetailedError,
  Error as DetailedErrorType,
} from "./error";
import { Response } from "./response";
import { RealityCaptureService } from "./service";
import {
  RealityDataUpdate,
  RealityData,
  ContainerDetails,
} from "./reality_data";
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

  static async download_data(
    containerUrl: string,
    dst: string,
    src: string,
    progressHook: ProgressHook
  ): Promise<Response<null>> {
    const client = new ContainerClient(containerUrl);
    const blobs = [];
    for await (const blob of client.listBlobsFlat()) {
      if (blob.name.startsWith(src)) blobs.push([blob.name, blob.properties.contentLength || 0]);
    }
    const nbThreads = _DataHandler._getNbThreads(blobs);
    const totalSize = blobs.reduce((acc, [, size]) => acc + size, 0);
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
        chunks.push(chunk);
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
        await downloadBlob(blobTuple);
      }
    } catch (err: any) {
      if (err.message === "Download interrupted by callback function") {
        const de = new DetailedErrorResponse({
          code: "DownloadInterrupted",
          message: "Download was interrupted by user.",
        });
        return new Response(499, de, null);
      } else {
        const de = new DetailedErrorResponse({
          code: "DownloadFailure",
          message: `Download failed: ${err}.`,
        });
        return new Response(500, de, null);
      }
    }
    return new Response(200, null, null);
  }

  static async upload_data(
    containerUrl: string,
    src: string,
    realityDataDst: string,
    progressHook: ProgressHook
  ): Promise<Response<null>> {
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
        const de = new DetailedErrorResponse({
          code: "UploadInterrupted",
          message: "Upload was interrupted by user.",
        });
        return new Response(499, de, null);
      } else {
        const de = new DetailedErrorResponse({
          code: "UploadFailure",
          message: `Upload failed: ${err}.`,
        });
        return new Response(500, de, null);
      }
    }
    return new Response(200, null, null);
  }

  static async list_data(containerUrl: string): Promise<Response<string[]>> {
    const client = new ContainerClient(containerUrl);
    const blobNames: string[] = [];
    for await (const blob of client.listBlobsFlat()) {
      blobNames.push(blob.name);
    }
    return new Response(200, null, blobNames);
  }

  static async delete_data(
    containerUrl: string,
    filesToDelete: string[]
  ): Promise<Response<null>> {
    const client = new ContainerClient(containerUrl);
    const failed: string[] = [];
    for (const file of filesToDelete) {
      try {
        await client.deleteBlob(file);
      } catch (_e) {
        failed.push(file);
      }
    }
    if (!failed.length) {
      return new Response(204, null, null);
    }
    const detailedError = new DetailedError(
      "DeletionFailed",
      "Failed to delete one or multiple files",
      failed.map(
        (fail) =>
          new DetailedErrorType("DeletionFailed", "Failed to delete a file", fail)
      )
    );
    return new Response(400, new DetailedErrorResponse({ error: detailedError }), null);
  }
}

export class RealityDataHandler {
  private _service: RealityCaptureService;
  private _progressHook: ProgressHook;

  constructor(tokenFactory: any, kwargs?: any) {
    this._service = new RealityCaptureService(tokenFactory, kwargs);
    this._progressHook = null;
  }

  private async _getLink(
    rdId: string,
    itwinId: string | undefined,
    readOnly: boolean
  ): Promise<Response<ContainerDetails>> {
    if (!readOnly) {
      return await this._service.get_reality_data_write_access(rdId, itwinId);
    }
    return await this._service.get_reality_data_read_access(rdId, itwinId);
  }

  private async _setAuthoring(
    rdId: string,
    authoring: boolean
  ): Promise<Response<RealityData>> {
    const rdu = new RealityDataUpdate({ authoring });
    return await this._service.update_reality_data(rdu, rdId);
  }

  async upload_data(
    realityDataId: string,
    src: string,
    realityDataDst = "",
    itwinId?: string
  ): Promise<Response<null>> {
    const rlink = await this._getLink(realityDataId, itwinId, false);
    if (rlink.is_error()) return new Response(rlink.status_code, rlink.error, null);
    const r = await this._setAuthoring(realityDataId, true);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    const resp = await _DataHandler.upload_data(
      rlink.value.links.container_url.href,
      src,
      realityDataDst,
      this._progressHook
    );
    const r2 = await this._setAuthoring(realityDataId, false);
    if (r2.is_error()) return new Response(r2.status_code, r2.error, null);
    return resp;
  }

  async download_data(
    realityDataId: string,
    dst: string,
    realityDataSrc = "",
    itwinId?: string
  ): Promise<Response<null>> {
    const r = await this._getLink(realityDataId, itwinId, true);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.download_data(
      r.value.links.container_url.href,
      dst,
      realityDataSrc,
      this._progressHook
    );
  }

  async list_data(
    realityDataId: string,
    itwinId?: string
  ): Promise<Response<string[]>> {
    const r = await this._getLink(realityDataId, itwinId, true);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.list_data(r.value.links.container_url.href);
  }

  async delete_data(
    realityDataId: string,
    filesToDelete: string[],
    itwinId?: string
  ): Promise<Response<null>> {
    const r = await this._getLink(realityDataId, itwinId, false);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.delete_data(r.value.links.container_url.href, filesToDelete);
  }

  set_progress_hook(hook: ProgressHook): void {
    this._progressHook = hook;
  }
}

export class BucketDataHandler {
  private _service: RealityCaptureService;
  private _progressHook: ProgressHook;

  constructor(tokenFactory: any, kwargs?: any) {
    this._service = new RealityCaptureService(tokenFactory, kwargs);
    this._progressHook = null;
  }

  private async _getBucket(itwinId: string): Promise<Response<BucketResponse>> {
    return await this._service.get_bucket(itwinId);
  }

  async upload_data(
    itwinId: string,
    src: string,
    bucketDst = ""
  ): Promise<Response<null>> {
    const r = await this._getBucket(itwinId);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.upload_data(
      r.value.links.container_url.href,
      src,
      bucketDst,
      this._progressHook
    );
  }

  async download_data(
    itwinId: string,
    dst: string,
    bucketSrc = ""
  ): Promise<Response<null>> {
    const r = await this._getBucket(itwinId);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.download_data(
      r.value.links.container_url.href,
      dst,
      bucketSrc,
      this._progressHook
    );
  }

  async list_data(itwinId: string): Promise<Response<string[]>> {
    const r = await this._getBucket(itwinId);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.list_data(r.value.links.container_url.href);
  }

  async delete_data(
    itwinId: string,
    filesToDelete: string[]
  ): Promise<Response<null>> {
    const r = await this._getBucket(itwinId);
    if (r.is_error()) return new Response(r.status_code, r.error, null);
    return await _DataHandler.delete_data(r.value.links.container_url.href, filesToDelete);
  }

  set_progress_hook(hook: ProgressHook): void {
    this._progressHook = hook;
  }
}
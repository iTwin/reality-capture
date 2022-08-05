/*
 * Copyright © Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 */

"use strict";

import * as fs from "fs";
import * as path from "path";
import * as Utils from "./utils.js";
import { ContainerClient } from "@azure/storage-blob";
import { AccessToken } from "@itwin/core-bentley";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";


// taken from Microsoft's Azure sdk samples.
// https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/samples/typescript/src/basic.ts
// A helper method used to read a Node.js readable stream into a Buffer
export async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> 
{
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        readableStream.on("data", (data: Buffer | string) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

interface UploadInfo {
    filesToUpload: string[];
    totalSizeToUpload: number; // In bytes
    uploadedSize: number; // In bytes
    state: "Progress" | "Fail" | "Done";
}

export class RealityDataClientBase extends Utils.AppAccess
{
    private static uploadingFileConcurrency = 100;
    private uploadInfo: UploadInfo;

    constructor(accessToken : AccessToken) 
    {
        super(accessToken);
        this.uploadInfo = {
            filesToUpload: [],
            totalSizeToUpload: 0,
            uploadedSize: 0,
            state: "Done",
        };
    }

    public getRDSBase() : string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata/"; }

    /**
     * Get all files recursively from a direction.
     * @param root root folder.
     * @param currentFolder current explored folder.
     */
    public async getFiles(root: string, currentFolder?: string): Promise<void> {      
        const path = currentFolder ? root + "/" + currentFolder : root;
        const files = fs.readdirSync(path);

        files.forEach(async (file) => {
            const fileDirFromRoot = currentFolder ? currentFolder + "/" + file : file;
            if (fs.lstatSync(path + "/" + file).isDirectory()) {
                await this.getFiles(root, fileDirFromRoot);
            }
            else {
                const stats = fs.statSync(path + "/" + file);
                this.uploadInfo.filesToUpload.push(fileDirFromRoot);
                this.uploadInfo.totalSizeToUpload += stats.size;
            }
        });
    }

    /**
     * Upload a single reality data on RDS
     * @param dataPath file path.
     * @param fileName file name.
     * @param containerClient container client to upload the file.
     * @returns the filename, to handle it in case of error.
     */
    public async uploadSingleRealityData(dataPath: string, fileName: string, containerClient: ContainerClient): Promise<string> {
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        const uploadBlobResponse = await blockBlobClient.uploadFile(dataPath + "/" + fileName, {concurrency: 20});
        if (uploadBlobResponse.errorCode === undefined) {
            console.log(`Uploaded ${fileName} successfully`, uploadBlobResponse.requestId);
            const stats = fs.statSync(dataPath + "/" + fileName);
            this.uploadInfo.uploadedSize += stats.size;
            return fileName;
        }
        console.log(`Upload of ${fileName} failed: `, uploadBlobResponse.errorCode);
        throw new Error(fileName);
    }

    /**
     * Upload the entire @see {@link dataPath} folder in RDS at @see {@link realityDataId}.
     * @param realityDataId reality data where the data will be uploaded.
     * @param dataPath reality data to upload
     */
    async uploadRealityData(realityDataId: string, dataPath: string)
    {
        // TODO : support large file uploading (3SM, 3MX...) ? A single file may take 2 or 3 hours to be uploaded
        // TODO : make difference between old access token promise fail and other possible errors

        // Reset upload infos
        this.uploadInfo = {
            filesToUpload: [],
            totalSizeToUpload: 0,
            uploadedSize: 0,
            state: "Progress",
        };

        // Remove last "/" from the path
        dataPath = dataPath.replace(/\\/g, "/");
        if(dataPath[dataPath.length - 1] === "/")
            dataPath = dataPath.substring(0, dataPath.length - 1);

        // List the files to upload
        if (fs.lstatSync(dataPath).isDirectory())
        {
            await this.getFiles(dataPath);
        }
        else
        {
            const stats = fs.statSync(dataPath);
            this.uploadInfo.filesToUpload.push(path.basename(dataPath));
            this.uploadInfo.totalSizeToUpload = stats.size;
            dataPath = path.dirname(dataPath);
        }

        let rejectedFiles: string[] = [];
        while((this.uploadInfo.filesToUpload.length + rejectedFiles.length) > 0) {
            // Retry to upload rejected files.
            this.uploadInfo.filesToUpload.push(...rejectedFiles);
            rejectedFiles = [];

            // Create a new container client using the right access (refresh token)
            const azureBlobUrl = await this.getRealityDataUrl(realityDataId, "", true);
            const containerClient = new ContainerClient(azureBlobUrl);

            // Upload uploadingFileConcurrency at the same time.
            const currentPromises = [];
            let currentNumberOfUploadingFile = 0;
            for(let i = this.uploadInfo.filesToUpload.length - 1; i >= 0 && currentNumberOfUploadingFile < RealityDataClientBase.uploadingFileConcurrency; i--) {
                currentPromises.push(this.uploadSingleRealityData(dataPath, this.uploadInfo.filesToUpload[i], containerClient));
                currentNumberOfUploadingFile++;
            }
            const promiseRes = await Promise.allSettled(currentPromises);

            // Remove the uploaded files from the list
            promiseRes.forEach((result) => {
                if (result.status === "fulfilled") {
                    this.uploadInfo.filesToUpload.pop();
                }
                else if(result.status === "rejected") {
                    const rejectedFile = this.uploadInfo.filesToUpload.pop();
                    rejectedFiles.push(rejectedFile!);
                    // TODO : is it possible to retry to upload the file?
                    console.log(result.reason);
                }
            });
        }
        this.uploadInfo.state = "Done";
    }

    /**
     * Monitor upload. Display the progress in the browser.
     * @returns progress, send back to the frontend as progress request response. 
     */
    public async monitorUpload(): Promise<string> {
        await Utils.AppUtil.Sleep(1000);
        if(this.uploadInfo.state !== "Progress")
            return this.uploadInfo.state;
        
        const progress = (this.uploadInfo.uploadedSize / 1000000);
        const total = (this.uploadInfo.totalSizeToUpload / 1000000);
        return "Progress : " + progress + "MB / " + total + "MB"; 
    }

    /**
     * Download a single file @see {@link fileName} in @see {@link outDir}.
     * @param outDir where the data is downloaded.
     * @param fileName name of the file to download.
     * @param containerClient container client to download the file.
     * @returns 
     */
    async downloadSingleRealityData(outDir: string, fileName: string, containerClient: ContainerClient): Promise<string> {
        const dir = outDir + (outDir[outDir.length - 1] === "/" || outDir[outDir.length - 1] === "\\" ? "" : "/") + fileName.substring(0, fileName.lastIndexOf("/"));
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
        }
        
        const blobContent = await containerClient.getBlockBlobClient(fileName).download(0);
        const outPath = path.join(outDir, fileName);
        fs.writeFileSync(outPath, await streamToBuffer(blobContent.readableStreamBody!));
        console.log(`Downloaded blob content into file ${outPath}`);
        return fileName;
    }

    /**
     * Download or list a reality data to the specified local paths
     * @param realityDataId reality data to download.
     * @param outDir where the reality data is downloaded.
     * @returns names of downloaded files.
     */
    public async downloadRealityData(realityDataId : string, outDir : string|undefined = undefined) : Promise<boolean>
    {
        // TODO : support large file downloading (3SM, 3MX...) ? A single file may take 2 or 3 hours to be downloaded
        // TODO : make difference between old access token promise fail and other possible errors

        const azureBlobUrl = await this.getRealityDataUrl(realityDataId, "");
        const containerClient = new ContainerClient(azureBlobUrl);
        const blobNames:string[] = [];
        const iter = await containerClient.listBlobsFlat();
        let containsContextScene = false;
        for await (const blob of iter) 
        {
            blobNames.push(blob.name);
            if(blob.name === "ContextScene.xml")
            {
                containsContextScene = true;
            }
        }
        const filesToDownload = [...blobNames];

        if (outDir)
        {
            let rejectedFiles: string[] = [];
            while(filesToDownload.length > 0) {
                // Retry to download rejected files.
                filesToDownload.push(...rejectedFiles);
                rejectedFiles = [];

                // Create a new container client using the right access (refresh token)
                const azureBlobUrl = await this.getRealityDataUrl(realityDataId, "");
                const containerClient = new ContainerClient(azureBlobUrl);

                // Download uploadingFileConcurrency at the same time.
                const currentPromises = [];
                let currentNumberOfDownloadingFile = 0;
                for(let i = filesToDownload.length - 1; i >= 0 && currentNumberOfDownloadingFile < RealityDataClientBase.uploadingFileConcurrency; i--) {
                    currentPromises.push(this.downloadSingleRealityData(outDir, filesToDownload[i], containerClient));
                    currentNumberOfDownloadingFile++;
                }
                const promiseRes = await Promise.allSettled(currentPromises);
                promiseRes.forEach((result) => {
                    if (result.status === "fulfilled") {
                        filesToDownload.pop();                      
                    }
                    else if(result.status === "rejected") {
                        const rejectedFile = filesToDownload.pop();
                        rejectedFiles.push(rejectedFile!);
                        // TODO : is it possible to retry to download the file?
                        console.log(result.reason);
                    }
                });
            }
        }
        return containsContextScene;
    }

    /**
     * Get the reality data from its id.
     * @param realityDataId request reality data.
     * @returns reality data.
     */
    public async getRealityData(realityDataId: string): Promise<ITwinRealityData> {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        const iTwinRealityData: ITwinRealityData = await rdaClient.getRealityData(this.accessToken, process.env.IMJS_PROJECT_ID, realityDataId);
        return iTwinRealityData;
    }

    /**
     * Get the reality data url from its id.
     * @param realityDataId id of requested reality data.
     * @param subFilePath reality data sub file path.
     * @param access reality data write access (default : read)
     * @returns the url of request reality data.
     */
    public async getRealityDataUrl(realityDataId: string, subFilePath?: string, writeAccess = false): Promise<string> {
        const realityData = await this.getRealityData(realityDataId);

        let blobPath = "";
        if(subFilePath !== undefined)
            blobPath = subFilePath;
        else if(realityData.rootDocument)
            blobPath = realityData.rootDocument;
        
        const url = await realityData.getBlobUrl(this.accessToken, blobPath, writeAccess);
        return await url.toString();
    }
    
    /**
     * Create an item on RDS.
     * @param displayName item display name.
     * @param dataType item data type, see https://dev.azure.com/bentleycs/Reality%20Modeling/_wiki/wikis/Reality-Modeling.wiki/23512/RDS-RealityData-types
     * @param dataDescr item description.
     * @param rootDocument root document. Need to be provided for Cesium3dTiles.
     * @returns created reality data.
     */
    public async createItemRDS(displayName: string, dataType: string, dataDescr : string, rootDocument?: string): Promise<ITwinRealityData>
    {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);

        const realityData = new ITwinRealityData(rdaClient, undefined, process.env.IMJS_PROJECT_ID);
        realityData.displayName = displayName;
        realityData.classification = "Undefined";
        realityData.type = dataType;
        realityData.description = dataDescr;
        realityData.rootDocument = rootDocument ?? "";
        const iTwinRealityData = await rdaClient.createRealityData(this.accessToken, process.env.IMJS_PROJECT_ID, realityData);
        realityData.id = iTwinRealityData.id;
        return realityData;
    }
}


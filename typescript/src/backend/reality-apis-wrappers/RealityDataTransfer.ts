/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContainerClient } from "@azure/storage-blob";
import * as fs from "fs";
import * as path from "path";
import { ApiUtils } from "./ApiUtils";
import { RealityDataClientBase, streamToBuffer } from "./Rds";


interface UploadInfo {
    filesToUpload: string[];
    totalSizeToUpload: number; // In bytes
    uploadedSize: number; // In bytes
    state: "Progress" | "Fail" | "Done";
}

export class RealityDataTransfer {
    private static _instance: RealityDataTransfer;
    private uploadingFileConcurrency = 100;
    private uploadInfo: UploadInfo;

    private constructor() 
    {
        this.uploadInfo = {
            filesToUpload: [],
            totalSizeToUpload: 0,
            uploadedSize: 0,
            state: "Done",
        };
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    /**
     * Get all files recursively from a direction.
     * @param root root folder.
     * @param currentFolder current explored folder.
     */
    public async getFiles(root: string, currentFolder?: string): Promise<void> {      
        const exploredPath = currentFolder ? path.join(root, currentFolder) : root;
        const files = fs.readdirSync(exploredPath);
        for(let i = 0; i < files.length; i++) {
            const fileDirFromRoot = currentFolder ? path.join(currentFolder, files[i]) : files[i];
            const stats = fs.lstatSync(path.join(exploredPath, files[i]));
            if (stats.isDirectory()) {
                await this.getFiles(root, fileDirFromRoot);
            }
            else {
                this.uploadInfo.filesToUpload.push(fileDirFromRoot);
                this.uploadInfo.totalSizeToUpload += stats.size;
            }
        }
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
    async uploadRealityData(realityDataId: string, dataPath: string, realityDataClient: RealityDataClientBase)
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
            const azureBlobUrl = await realityDataClient.getRealityDataUrl(realityDataId, "", true);
            const containerClient = new ContainerClient(azureBlobUrl);

            // Upload uploadingFileConcurrency at the same time.
            const currentPromises = [];
            let currentNumberOfUploadingFile = 0;
            for(let i = this.uploadInfo.filesToUpload.length - 1; i >= 0 && currentNumberOfUploadingFile < this.uploadingFileConcurrency; i--) {
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
        await ApiUtils.Sleep(1000);
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
            fs.mkdirSync(path.normalize(dir), {recursive: true});
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
    public async downloadRealityData(realityDataId : string, realityDataClient: RealityDataClientBase, outDir : string|undefined = undefined) : Promise<boolean>
    {
        // TODO : support large file downloading (3SM, 3MX...) ? A single file may take 2 or 3 hours to be downloaded
        // TODO : make difference between old access token promise fail and other possible errors

        const azureBlobUrl = await realityDataClient.getRealityDataUrl(realityDataId, "");
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
                const azureBlobUrl = await realityDataClient.getRealityDataUrl(realityDataId, "");
                const containerClient = new ContainerClient(azureBlobUrl);

                // Download uploadingFileConcurrency at the same time.
                const currentPromises = [];
                let currentNumberOfDownloadingFile = 0;
                for(let i = filesToDownload.length - 1; i >= 0 && currentNumberOfDownloadingFile < this.uploadingFileConcurrency; i--) {
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
}
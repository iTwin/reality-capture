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
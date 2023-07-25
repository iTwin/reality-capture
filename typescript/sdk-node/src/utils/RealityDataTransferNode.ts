/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BlobDownloadOptions, BlockBlobClient, BlockBlobParallelUploadOptions, ContainerClient } from "@azure/storage-blob";
import { AbortController } from "@azure/abort-controller";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import * as fs from "fs";
import * as os from "os";
import path = require("path");
import { v4 as uuidv4 } from "uuid";
import { ReferenceTableNode } from "../utils/ReferenceTableNode";
import { CommonData } from "@itwin/reality-capture";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { AuthorizationClient, BentleyError, BentleyStatus } from "@itwin/core-common";

let FILE_GROUP_CONCURRENCY = 16; // How much file are uploaded at the same time.
let FILE_CONCURRENCY = 8; // Parallel uploading for a single file.
let MAX_SINGLE_SHOT_SIZE = 128 * 1024 * 1024; // 128 MB. Blob size threshold in bytes to start concurrency uploading.
let BLOCK_SIZE = 1 * 1024 * 1024; // 1MB. Size of uploaded blocks.

// taken from Microsoft's Azure sdk samples.
// https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/samples/typescript/src/basic.ts
// A helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
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

async function listFiles(root: string, currentFolder?: string): Promise<string[]> {
    const allSubFiles: string[] = [];
    const path = currentFolder ? root + "/" + currentFolder : root;
    const subFiles = await fs.promises.readdir(path);
    for (let i = 0; i < subFiles.length; i++) {
        const fileDirFromRoot = currentFolder ? currentFolder + "/" + subFiles[i] : subFiles[i];
        if ((await fs.promises.lstat(path + "/" + subFiles[i])).isDirectory()) {
            allSubFiles.push(...await listFiles(root, fileDirFromRoot));
        }
        else
            allSubFiles.push(fileDirFromRoot);
    }
    return allSubFiles;
}

async function getUploadFilesInfo(uploadInfo: DataTransferInfo, root: string, currentFolder?: string): Promise<void> {
    const path = currentFolder ? root + "/" + currentFolder : root;
    const subFiles = await fs.promises.readdir(path);
    for (let i = 0; i < subFiles.length; i++) {
        const fileDirFromRoot = currentFolder ? currentFolder + "/" + subFiles[i] : subFiles[i];
        if ((await fs.promises.lstat(path + "/" + subFiles[i])).isDirectory()) {
            await getUploadFilesInfo(uploadInfo, root, fileDirFromRoot);
        }
        else {
            const stats = fs.statSync(path + "/" + subFiles[i]);
            uploadInfo.files.push(fileDirFromRoot);
            uploadInfo.totalFilesSize += stats.size;
        }
    }
}

async function getUniqueTmpDir(): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), "Bentley/ContextCapture Internal/", uuidv4());
    await fs.promises.mkdir(tmpDir, { recursive: true });
    return tmpDir;
}

async function createTempScene(scenePath: string): Promise<string> {
    let newScenePath = scenePath;
    const localTmpPath = await getUniqueTmpDir();
    const files = await listFiles(path.dirname(scenePath));
    for (let i = 0; i < files.length; i++) {
        try {
            await fs.promises.access(path.dirname(path.join(localTmpPath, files[i])), fs.constants.W_OK);
        }
        catch (error: any) {
            await fs.promises.mkdir(path.dirname(path.join(localTmpPath, files[i])), { recursive: true });
        }
        await fs.promises.copyFile(path.join(path.dirname(scenePath), files[i]), path.join(localTmpPath, files[i]));
    }
    newScenePath = path.join(localTmpPath, path.basename(scenePath));
    return newScenePath;
}

async function replaceXMLScene(scenePath: string, outputPath: string, references: ReferenceTableNode, localToCloud: boolean): Promise<void> {
    const data = await fs.promises.readFile(scenePath);
    const text = data.toString();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const sceneReferences = xmlDoc.getElementsByTagName("Reference");
    for (let i = 0; i < sceneReferences.length; i++) {
        const referencePath = sceneReferences[i].getElementsByTagName("Path");
        if (!referencePath.length)
            return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                "Invalid context scene" + scenePath + ", the reference " + sceneReferences[i] + " has no path."));

        let pathValue = referencePath[0].textContent;
        if (!pathValue)
            return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                "Invalid context scene" + scenePath + ", the reference " + sceneReferences[i] + " has no path content."));

        pathValue = pathValue.replace(/\\/g, "/");
        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(pathValue);
            if (!cloudId)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, "Can't replace local path with cloud id "));

            referencePath[0].textContent = "rds:" + cloudId;
        }
        else {
            if (pathValue.substring(0, 4) !== "rds:")
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Invalid context scene" + scenePath + ", the reference " + pathValue + "doesn't start with 'rds:'."));

            const cloudId = pathValue.substring(4);
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Can't replace cloud id " + cloudId + "path with local path, does not exist in references"));

            referencePath[0].textContent = localPath;
        }
    }

    await fs.promises.unlink(outputPath);
    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    await fs.promises.writeFile(outputPath, newXmlStr);
}

async function replaceJSONScene(scenePath: string, outputPath: string, references:
    ReferenceTableNode, localToCloud: boolean): Promise<void> {
    const data = await fs.promises.readFile(scenePath);
    const text = data.toString();
    const json = JSON.parse(text);
    for (const referenceId in json.References) {
        let referencePath = json.References[referenceId].Path;
        referencePath = referencePath.replace(/\\/g, "/");
        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(referencePath);
            if (!cloudId)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, "Can't replace local path " + referencePath + " with cloud id "));

            json.References[referenceId].Path = "rds:" + cloudId;
        }
        else {
            if (referencePath.substring(0, 4) !== "rds:")
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Invalid context scene" + scenePath + ", the reference " + referencePath + "doesn't start with 'rds:'."));

            const id = referencePath.substring(4);
            const localPath = references.getLocalPathFromCloudId(id);
            if (!localPath)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, "Can't replace cloud id path with local path"));

            json.References[referenceId].Path = localPath;
        }
    }

    await fs.promises.unlink(outputPath);
    await fs.promises.writeFile(outputPath, JSON.stringify(json, undefined, 4));
}

async function replaceCCOrientationsReferences(ccOrientationPath: string, outputPath: string, references: ReferenceTableNode,
    localToCloud: boolean): Promise<void> {
    const data = await fs.promises.readFile(ccOrientationPath);
    const text = data.toString();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const photos = xmlDoc.getElementsByTagName("Photo");
    for (let i = 0; i < photos.length; i++) {
        const imagePath = photos[i].getElementsByTagName("ImagePath");
        const maskPath = photos[i].getElementsByTagName("MaskPath");
        if (!imagePath.length)
            return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                "Invalid cc orientations " + ccOrientationPath + ", the image " + photos[i] + " has no path."));

        let pathValue = imagePath[0].textContent;
        if (!pathValue)
            return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                "Invalid cc orientations" + ccOrientationPath + ", the image " + photos[i] + " has no path content."));

        pathValue = pathValue.replace(/\\/g, "/");

        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(path.dirname(pathValue));
            const fileName = path.basename(pathValue);
            if (!cloudId)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Can't replace local path " + pathValue + " with cloud id : does not exist in reference table"));

            imagePath[0].textContent = path.join(cloudId, fileName);
            if (maskPath.length) {
                let maskPathValue = maskPath[0].textContent;
                if (!maskPathValue)
                    return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                        "Invalid cc orientations" + ccOrientationPath + ", the mask " + photos[i] + " has no path content."));

                maskPathValue = maskPathValue.replace(/\\/g, "/");
                const maskCloudId = references.getCloudIdFromLocalPath(path.dirname(maskPathValue));
                if (!maskCloudId)
                    return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                        "Can't replace local path " + maskPathValue + " with mask cloud id."));

                maskPath[0].textContent = path.join(maskCloudId, path.basename(pathValue));
            }
        }
        else {
            const splittedImagePath = pathValue.split("/");
            if (!splittedImagePath.length)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Invalid image path, the reference " + pathValue + " is not a path."));

            const cloudId = splittedImagePath[0];
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Can't replace cloud id " + cloudId + " path with local path, does not exist in references"));

            imagePath[0].textContent = localPath + "/" + splittedImagePath[splittedImagePath.length - 1];
            if (maskPath.length) {
                let maskPathValue = maskPath[0].textContent;
                if (!maskPathValue)
                    return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                        "Invalid cc orientations " + ccOrientationPath + ", the mask " + photos[i] + " has no path content."));

                maskPathValue = maskPathValue.replace(/\\/g, "/");
                const splittedMaskPath = maskPathValue.split("/");
                if (!splittedMaskPath.length)
                    return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                        "Invalid image path, the reference " + maskPathValue + " is not a path."));

                const maskCloudId = splittedMaskPath[0];
                const maskLocalPath = references.getLocalPathFromCloudId(maskCloudId);
                if (!maskLocalPath)
                    return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                        "Can't replace cloud id " + maskCloudId + "path with local path, does not exist in references"));

                maskPath[0].textContent = maskLocalPath;
            }
        }
    }

    await fs.promises.unlink(outputPath);
    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    await fs.promises.writeFile(outputPath, newXmlStr);
}

async function replaceContextSceneReferences(scenePath: string, outputPath: string, references: ReferenceTableNode,
    localToCloud: boolean): Promise<void> {
    if (scenePath.endsWith("json"))
        await replaceJSONScene(scenePath, outputPath, references, localToCloud);
    else
        await replaceXMLScene(scenePath, outputPath, references, localToCloud);
}

interface DataTransferInfo {
    files: string[];
    totalFilesSize: number; // In bytes
    processedFilesSize: number; // In bytes
}

/**
 * Utility class to upload and download reality data in ContextShare.
 */
export class RealityDataTransferNode {
    /** Authorization client to generate access token. */
    private authorizationClient: AuthorizationClient;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/realitydata";

    /** Abort controller to stop the upload when it has been cancelled. */
    private abortController: AbortController;

    private dataTransferInfo: DataTransferInfo;

    /** Store amount of processed data for each current uploading files. */
    private currentProcessedFiles: Array<number>;

    /** 
     * On upload progress hook. Displays the upload progress and returns false when the upload is cancelled.
     * Create your own function or use {@link defaultProgressHook}.
     * @param {number} progress upload progress, usually a percentage.
     */
    private onUploadProgress?: (progress: number) => boolean;

    /** 
     * On download progress hook. Displays the download progress and returns false when the download is cancelled.
     * Create your own function or use {@link defaultProgressHook}.
     * @param {number} progress download progress, usually a percentage.
     */
    private onDownloadProgress?: (progress: number) => boolean;

    /**
     * Set upload progress hook.
     * @param onProgress function to display the progress, should returns a boolean (is cancelled/running).
     */
    public setUploadHook(onProgress: (progress: number) => boolean): void {
        this.onUploadProgress = onProgress;
    }

    /**
     * Set download progress hook.
     * @param progress function to display the progress, should returns a boolean (is cancelled/running).
     */
    public setDownloadHook(onProgress: (progress: number) => boolean): void {
        this.onDownloadProgress = onProgress;
    }

    /**
     * Create a new RealityDataTransferService.
     * @param {AuthorizationClient} authorizationClient Authorization client to generate access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(authorizationClient: AuthorizationClient, env?: string) {
        this.authorizationClient = authorizationClient;
        if(env)
            this.serviceUrl = "https://" + env + "api.bentley.com/realitydata";
        
        this.abortController = new AbortController();
        this.dataTransferInfo = {
            files: [],
            totalFilesSize: 0,
            processedFilesSize: 0
        };
        this.currentProcessedFiles = new Array(FILE_GROUP_CONCURRENCY).fill(0);
    }

    /**
     * Get scopes required for this service.
     * @returns {Set<string>} Set of required minimal scopes.
     */
    public static getScopes(): Set<string> {
        return new Set(["realitydata:modify", "realitydata:read"]);
    }

    private async createRealityData(type: string, name: string, iTwinId: string, rootFile?: string): Promise<ITwinRealityData> {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: this.serviceUrl,
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        const realityData = new ITwinRealityData(rdaClient, undefined, iTwinId);
        realityData.displayName = name;
        realityData.type = type;
        realityData.description = "";
        realityData.classification = "Undefined";
        realityData.rootDocument = rootFile;
        const iTwinRealityData: ITwinRealityData = await rdaClient.createRealityData(
            await this.authorizationClient.getAccessToken(), iTwinId, realityData);
        return iTwinRealityData;
    }

    private async uploadSingleFileToAzureBlob(fileToUpload: string, blockBlobClient: BlockBlobClient, options: BlockBlobParallelUploadOptions, fileIndex: number) {
        await blockBlobClient.uploadFile(fileToUpload, options);
        const stats = fs.statSync(fileToUpload);
        this.dataTransferInfo.processedFilesSize += stats.size;
        this.currentProcessedFiles[fileIndex] = 0;
    }

    private async uploadToAzureBlob(dataToUpload: string, iTwinRealityData: ITwinRealityData, container = ""): Promise<void> {
        try {
            this.dataTransferInfo = {
                files: [],
                totalFilesSize: 0,
                processedFilesSize: 0
            };

            const azureBlobUrl: URL = await iTwinRealityData.getBlobUrl(await this.authorizationClient.getAccessToken(), "", true);
            const containerClient = new ContainerClient(azureBlobUrl.toString());

            let isSingleFile = false;
            if ((await fs.promises.lstat(dataToUpload)).isDirectory()) {
                await getUploadFilesInfo(this.dataTransferInfo, dataToUpload);
            }
            else {
                isSingleFile = true;
                const stats = fs.statSync(dataToUpload);
                this.dataTransferInfo.files.push(path.join(path.basename(path.dirname(dataToUpload)), path.basename(dataToUpload)));
                this.dataTransferInfo.totalFilesSize += stats.size;
            }

            const promises = [];
            let currentPercentage = -1;
            let uploadedFiles = 0;
            while (uploadedFiles < this.dataTransferInfo.files.length) {
                for (let i = 0; i < FILE_GROUP_CONCURRENCY && uploadedFiles + i < this.dataTransferInfo.files.length; i++) {
                    const blockBlobClient = containerClient.getBlockBlobClient(container === "" ? this.dataTransferInfo.files[i + uploadedFiles] : 
                        path.join(container, this.dataTransferInfo.files[i + uploadedFiles]));
                    const options: BlockBlobParallelUploadOptions = {
                        abortSignal: this.abortController.signal,
                        maxSingleShotSize: MAX_SINGLE_SHOT_SIZE,
                        concurrency: FILE_CONCURRENCY,
                        blockSize: BLOCK_SIZE,
                        onProgress: async (env) => {
                            if (this.abortController.signal.aborted)
                                return;

                            ((currentFileIndex) => {
                                this.currentProcessedFiles[currentFileIndex] = env.loadedBytes;
                            })(i); // Capture the value of i
                            const currentlyUploaded = this.currentProcessedFiles.reduce((a, b) => a + b, 0);
                            const newPercentage = Math.round(((currentlyUploaded + this.dataTransferInfo.processedFilesSize) / this.dataTransferInfo.totalFilesSize * 100));
                            if (newPercentage > currentPercentage) {
                                currentPercentage = newPercentage;
                                if (this.onUploadProgress) {
                                    const isCancelled = !this.onUploadProgress(currentPercentage);
                                    if (isCancelled)
                                        this.abortController.abort();
                                }
                            }
                        }
                    };
                    let fileToUpload = path.join(dataToUpload, this.dataTransferInfo.files[i + uploadedFiles]);
                    if (isSingleFile)
                        fileToUpload = dataToUpload;

                    promises.push(this.uploadSingleFileToAzureBlob(fileToUpload, blockBlobClient, options, i));
                }
                try {
                    await Promise.all(promises);
                    uploadedFiles += FILE_GROUP_CONCURRENCY;
                    this.currentProcessedFiles = new Array(FILE_GROUP_CONCURRENCY).fill(0);
                }
                catch(error: any) {
                    return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                        "Can't upload reality data : " + iTwinRealityData + ", error : " + error));
                }
            }
        }
        catch (error: any) {
            if(error.name === "AbortError")
                return;
            
            return Promise.reject(error);
        }
    }

    /**
     * Upload reality data to ProjectWise ContextShare. Creates a new reality data.
     * This function should not be used for ContextScenes or CCOrientations that contain dependencies to other data
     * unless those dependencies are already uploaded and the file you want to upload points to their id. 
     * Use uploadContextScene or uploadCCOrientation instead.
     * @param {string} dataToUpload Local directory containing the relevant data.
     * @param {string} name Name of the created entry on ProjectWise ContextShare.
     * @param {RealityDataType} type RealityDataType of the data.
     * @param {string} iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the 
     * data center where the reality data is stored.
     * @param {string} rootFile (optional) Used to indicate the root document of the reality data. The root document can be in a 
     * subfolder and is then specified as “Tile_Root.json” or “Folder1/SubFolder1/File.json” for example, with 
     * a relative path to the root folder of the data.
     * @returns {string} The ID of the uploaded data.
     */
    public async uploadRealityData(dataToUpload: string, name: string, type: CommonData.RealityDataType,
        iTwinId: string, rootFile?: string): Promise<string> {
        const iTwinRealityData = await this.createRealityData(type, name, iTwinId, rootFile);
        await this.uploadToAzureBlob(dataToUpload, iTwinRealityData);
        return iTwinRealityData.id;
    }

    /**
     *  Upload .json files to an already existent workspace.
     * Convenience function to upload specific settings to ContextCapture Service jobs. Files are uploaded to the
     * workspace passed in argument in the folder job_id/data/ so that the service can find the files when the job is submitted.
     * This function will upload *all* json files present at the path given in argument but not recursively (it won't
     * upload json files in subdirectories).
     * @param dataPath Local directory containing .json files
     * @param iTwinId ID of the iTwin project the workspace is linked to.
     * @param workspaceId ID of the workspace the job is linked to.
     * @param jobId The ID of the job the files are to be linked to.
     */
    public async uploadJsonToWorkspace(dataPath: string, iTwinId: string, workspaceId: string, jobId: string): Promise<void> {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: this.serviceUrl,
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        // TODO call uploadToAzureBlob and add new arguments so it's uploaded in /job_id/data?
        const iTwinRealityData = await rdaClient.getRealityData(await this.authorizationClient.getAccessToken(), iTwinId, workspaceId);
        await this.uploadToAzureBlob(dataPath, iTwinRealityData, path.join(jobId, "data"));
    }

    /**
     * Upload a ContextScene to ProjectWise ContextShare.
     * Convenience function that replaces references if a reference table is provided and upload the ContextScene.
     * All local dependencies should have been uploaded before, and their IDs provided in the reference table.
     * @param {string} sceneFolderPath Local directory containing the relevant ContextScene. The file must be called "ContextScene".
     * @param {string} name Name of the created entry on ProjectWise ContextShare.
     * @param {string} iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the
     * data center where the reality data is stored.
     * @param {ReferenceTableNode} references (optional) A table mapping local path of dependencies to their ID.
     * @returns {string} The ID of the uploaded ContextScene.
     */
    public async uploadContextScene(sceneFolderPath: string, name: string, iTwinId: string,
        references?: ReferenceTableNode): Promise<string> {
        try {
            const orientationFiles = await listFiles(sceneFolderPath);
            if (!orientationFiles[0].includes("ContextScene"))
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "The folder to upload doesn't contain any file named 'ContextScene'."));

            const scenePath = path.join(sceneFolderPath, orientationFiles[0]);
            const newScenePath = await createTempScene(scenePath);
            if (references)
                await replaceContextSceneReferences(scenePath, newScenePath, references, true);

            return await this.uploadRealityData(path.dirname(newScenePath), name, CommonData.RealityDataType.CONTEXT_SCENE, iTwinId);
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Upload a CCOrientation to ProjectWise ContextShare.
     * Convenience function that replaces references if a reference table is provided and upload the file.
     * All local dependencies should have been uploaded before, and their IDs provided in the reference table.
     * @param {string} orientationFolderPath Local directory containing the relevant CCOrientation. The file must be called
     * @param {string} name Name of the created entry on ProjectWise ContextShare.
     * @param {string} iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the 
     * data center where the reality data is stored.
     * @param {ReferenceTableNode} references (optional): A table mapping local path of dependencies to their ID.
     * @returns {string} The ID of the uploaded CCOrientation.
     */
    public async uploadCCOrientations(orientationFolderPath: string, name: string, iTwinId: string,
        references?: ReferenceTableNode): Promise<string> {
        try {
            const orientationFiles = await listFiles(orientationFolderPath);
            if (!orientationFiles.includes("Orientations.xml"))
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "The folder to upload doesn't contain any file named 'Orientations.xml'."));

            const orientationPath = path.join(orientationFolderPath, "Orientations.xml");
            const newOrientationPath = await createTempScene(orientationPath);
            if (references)
                await replaceCCOrientationsReferences(orientationPath, newOrientationPath, references, true);

            return await this.uploadRealityData(path.dirname(newOrientationPath), name, CommonData.RealityDataType.CC_ORIENTATIONS, iTwinId);
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    private async downloadSingleFileFromAzureBlob(fileToDownload: string, blockBlobClient: BlockBlobClient, options: BlobDownloadOptions, fileIndex: number) {
        const blobContent = await blockBlobClient.download(0, undefined, options);
        await fs.promises.writeFile(fileToDownload, await streamToBuffer(blobContent.readableStreamBody!));
        const stats = fs.statSync(fileToDownload);
        this.dataTransferInfo.processedFilesSize += stats.size;
        this.currentProcessedFiles[fileIndex] = 0;
    }

    /**
     * Download reality data from ProjectWise ContextShare.
     * This function should not be used for ContextScenes that contain dependencies to data you have locally as the
     * paths will point to ids in the ProjectWise ContextShare.
     * Use downloadContextScene instead.
     * @param {string} realityDataId The ID of the data to download.
     * @param {string} downloadPath The path where downloaded data should be saved.
     * @param {string} iTwinId ID of the iTwin project the reality data is linked to.
     */
    public async downloadRealityData(realityDataId: string, downloadPath: string, iTwinId: string): Promise<void> {
        try {
            this.dataTransferInfo = {
                files: [],
                totalFilesSize: 0,
                processedFilesSize: 0
            };

            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: this.serviceUrl,
            };
            const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
            const iTwinRealityData: ITwinRealityData = await rdaClient.getRealityData(await this.authorizationClient.getAccessToken(), 
                iTwinId, realityDataId);
            const azureBlobUrl = await iTwinRealityData.getBlobUrl(await this.authorizationClient.getAccessToken(), "", false);
            const containerClient = new ContainerClient(azureBlobUrl.toString());
            const iter = await containerClient.listBlobsFlat();

            for await (const blob of iter) {
                this.dataTransferInfo.totalFilesSize += blob.properties.contentLength ?? 0;
                this.dataTransferInfo.files.push(blob.name);
            }

            const promises = [];
            let currentPercentage = -1;
            let downloadedFiles = 0;
            while (downloadedFiles < this.dataTransferInfo.files.length) {
                for (let i = 0; i < FILE_GROUP_CONCURRENCY && downloadedFiles + i < this.dataTransferInfo.files.length; i++) {
                    const filePath = path.join(downloadPath, this.dataTransferInfo.files[i + downloadedFiles]);
                    await fs.promises.access(path.dirname(filePath), fs.constants.W_OK);
                    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                    const options: BlobDownloadOptions = {
                        abortSignal: this.abortController.signal,
                        onProgress: async (env) => {
                            if (this.abortController.signal.aborted)
                                return;

                            ((currentFileIndex) => {
                                this.currentProcessedFiles[currentFileIndex] = env.loadedBytes;
                            })(i); // Capture the value of i
                            const currentlyUploaded = this.currentProcessedFiles.reduce((a, b) => a + b, 0);
                            const newPercentage = Math.round(((currentlyUploaded + this.dataTransferInfo.processedFilesSize) / this.dataTransferInfo.totalFilesSize * 100));
                            if(newPercentage > currentPercentage) {
                                currentPercentage = newPercentage;
                                if(this.onDownloadProgress) {
                                    const isCancelled = !this.onDownloadProgress(currentPercentage);
                                    if(isCancelled)
                                        this.abortController.abort();                                
                                }
                            }
                        }
                    };
                    const blockBlobClient = await containerClient.getBlockBlobClient(this.dataTransferInfo.files[i])
                    promises.push(this.downloadSingleFileFromAzureBlob(filePath, blockBlobClient, options, i));
                }
                await Promise.all(promises);
                downloadedFiles += FILE_GROUP_CONCURRENCY;
                this.currentProcessedFiles = new Array(FILE_GROUP_CONCURRENCY).fill(0);
            }
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Download a ContextScene from ProjectWise ContextShare.
     * Convenience function that downloads the ContextScene and replaces references if a reference table is provided.
     * All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
     * paths should be provided in the reference table.
     * @param {string} realityDataId The ID of the ContextScene to download.
     * @param {string} downloadPath The path where downloaded ContextScene should be saved.
     * @param {string} iTwinId ID of the iTwin project the reality data is linked to.
     * @param {ReferenceTableNode} references (optional): A table mapping local path of dependencies to their ID.
     */
    public async downloadContextScene(realityDataId: string, downloadPath: string, iTwinId: string,
        references?: ReferenceTableNode): Promise<void> {
        try {
            await this.downloadRealityData(realityDataId, downloadPath, iTwinId);
            if (references) {
                const scenePath = path.join(downloadPath, "ContextScene.xml");
                if (!fs.existsSync(scenePath))
                    await replaceContextSceneReferences(path.join(downloadPath, "ContextScene.json"),
                        path.join(downloadPath, "ContextScene.json"), references, false);
                else
                    await replaceContextSceneReferences(scenePath, scenePath, references, false);
            }
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Download a CCOrientation from ProjectWise ContextShare.
     * Convenience function that downloads the CCOrientation and replaces references if a reference table is provided.
     * All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
     * paths should be provided in the reference table.
     * @param {string} realityDataId The ID of the CCOrientation to download.
     * @param {string} downloadPath The path where downloaded file should be saved.
     * @param {string} iTwinId ID of the iTwin project the reality data is linked to.
     * @param {ReferenceTableNode} references (optional): A table mapping local path of dependencies to their ID.
     */
    public async downloadCCorientations(realityDataId: string, downloadPath: string, iTwinId: string,
        references?: ReferenceTableNode): Promise<void> {
        try {
            await this.downloadRealityData(realityDataId, downloadPath, iTwinId);
            if (references) {
                const scenePath = path.join(downloadPath, "Orientations.xml");
                await replaceCCOrientationsReferences(scenePath, scenePath, references, false);
            }
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }
}
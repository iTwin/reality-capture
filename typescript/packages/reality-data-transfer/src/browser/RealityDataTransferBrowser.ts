import { ContainerClient, BlobDownloadOptions, BlockBlobParallelUploadOptions, BlobUploadCommonResponse } from "@azure/storage-blob";
import { RealityDataClientOptions, RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";
import { RealityDataType } from "@itwin/reality-capture-common";
import { ReferenceTableBrowser } from "./ReferenceTableBrowser";

interface FileInfo {
    name: string;
    size: number;
}

interface DataTransferInfo {
    files: FileInfo[];
    totalFilesSize: number; // In bytes
    processedFilesSize: number; // In bytes
}

async function replaceXMLScene(file: File | Blob, references: ReferenceTableBrowser, localToCloud: boolean): Promise<void> {
    const text = await file.text();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const sceneReferences = xmlDoc.getElementsByTagName("Reference");
    for (let i = 0; i < sceneReferences.length; i++) {
        const referencePath = sceneReferences[i].getElementsByTagName("Path");
        if (!referencePath.length)
            return Promise.reject(new Error("Invalid context scene, the reference " + sceneReferences[i] + " has no path."));

        let pathValue = referencePath[0].textContent;
        if (!pathValue)
            return Promise.reject(new Error("Invalid context scene, the reference " + sceneReferences[i] + " has no path content."));

        pathValue = pathValue.replace(/\\/g, "/");
        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(pathValue);
            if (!cloudId)
                return Promise.reject(new Error("Can't replace local path with cloud id "));

            referencePath[0].textContent = "rds:" + cloudId;
        }
        else {
            if (pathValue.substring(0, 4) !== "rds:")
                return Promise.reject(new Error("Invalid context scene, the reference " + pathValue + "doesn't start with 'rds:'."));

            const cloudId = pathValue.substring(4);
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return Promise.reject(new Error("Can't replace cloud id " + cloudId + "path with local path, does not exist in references"));

            referencePath[0].textContent = localPath;
        }
    }

    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    localStorage.setItem("tmpPatchedFile", newXmlStr);
}

async function replaceJSONScene(file: File | Blob, references: ReferenceTableBrowser, localToCloud: boolean): Promise<void> {
    const text = await file.text();
    const json = JSON.parse(text);
    for (const referenceId in json.References) {
        let referencePath = json.References[referenceId].Path;
        referencePath = referencePath.replace(/\\/g, "/");

        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(referencePath);
            if (!cloudId)
                return Promise.reject(new Error("Can't replace local path " + referencePath + " with cloud id "));

            json.References[referenceId].Path = "rds:" + cloudId;
        }
        else {
            if (referencePath.substring(0, 4) !== "rds:")
                return Promise.reject(new Error("Invalid context scene, the reference " + referencePath + "doesn't start with 'rds:'."));

            const id = referencePath.substring(4);
            const localPath = references.getLocalPathFromCloudId(id);
            if (!localPath)
                return Promise.reject(new Error("Can't replace cloud id path with local path"));

            json.References[referenceId].Path = localPath;
        }
    }

    localStorage.setItem("tmpPatchedFile", JSON.stringify(json));
}

async function replaceContextSceneReferences(file: File | Blob, references: ReferenceTableBrowser, localToCloud: boolean, isJson: boolean): Promise<void> {
    if (isJson)
        await replaceJSONScene(file, references, localToCloud);
    else
        await replaceXMLScene(file, references, localToCloud);
}

async function replaceCCOrientationsReferences(file: File | Blob, references: ReferenceTableBrowser, localToCloud: boolean): Promise<void> {
    const text = await file.text();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const photos = xmlDoc.getElementsByTagName("Photo");
    for (let i = 0; i < photos.length; i++) {
        const imagePath = photos[i].getElementsByTagName("ImagePath");
        const maskPath = photos[i].getElementsByTagName("MaskPath");
        if (!imagePath.length)
            continue;

        let pathValue = imagePath[0].textContent;
        if (!pathValue)
            continue;

        pathValue = pathValue.replace(/\\/g, "/");
        const dirName = pathValue.substring(0, pathValue.lastIndexOf("/"));
        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(dirName);
            const fileName = pathValue.split("/").pop();
            if (!cloudId)
                continue;

            imagePath[0].textContent = cloudId + "/" + fileName;
            if (maskPath.length) {
                let maskPathValue = maskPath[0].textContent;
                if (!maskPathValue)
                    continue;

                maskPathValue = maskPathValue.replace(/\\/g, "/");
                const maskDirName = maskPathValue.substring(0, maskPathValue.lastIndexOf("/"));
                const maskFileName = maskPathValue.split("/").pop();
                const maskCloudId = references.getCloudIdFromLocalPath(maskDirName);
                if (!maskCloudId)
                    continue;

                maskPath[0].textContent = maskCloudId + "/" + maskFileName;
            }
        }
        else {
            const splittedImagePath = pathValue.split("/");
            if (!splittedImagePath.length)
                return Promise.reject(new Error("Invalid image path, the reference " + pathValue + " is not a path."));

            const cloudId = splittedImagePath[0];
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return Promise.reject(new Error("Can't replace cloud id " + cloudId + "path with local path, does not exist in references"));

            imagePath[0].textContent = localPath + "/" + splittedImagePath[splittedImagePath.length - 1];
            if (maskPath.length) {
                let maskPathValue = maskPath[0].textContent;
                if (!maskPathValue)
                    return Promise.reject(new Error("Invalid cc orientations, the mask " + photos[i] + " has no path content."));

                maskPathValue = maskPathValue.replace(/\\/g, "/");
                const splittedMaskPath = maskPathValue.split("/");
                if (!splittedMaskPath.length)
                    return Promise.reject(new Error("Invalid image path, the reference " + maskPathValue + " is not a path."));

                const maskCloudId = splittedMaskPath[0];
                const maskLocalPath = references.getLocalPathFromCloudId(maskCloudId);
                if (!maskLocalPath)
                    return Promise.reject(new Error(
                        "Can't replace cloud id " + maskCloudId + "path with local path, does not exist in references"));

                maskPath[0].textContent = maskLocalPath;
            }
        }
    }

    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    localStorage.setItem("tmpPatchedFile", newXmlStr);
}

/**
 * Default hook to display progress.
 * @param {number} progress current progress (percentage).
 * @returns {boolean} false if the upload/download has been cancelled.
 */
export function defaultProgressHook(progress: number): boolean {
    console.log("Current progress : " + progress + "%.");
    return true;
}

/**
 * Utility class to upload and download reality data in ContextShare.
 */
export class RealityDataTransferBrowser {
    /** Callback to get an access token */
    private getAccessToken: () => Promise<string>;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/reality-management/reality-data";
    
    /** Abort controller to stop the upload when the upload has been cancelled. */
    private abortController: AbortController;

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
     * Set the upload progress hook.
     * @param {number} onProgress function to display the progress, should returns a boolean (cancelled).
     */
    public setUploadHook(onProgress: (progress: number) => boolean): void {
        this.onUploadProgress = onProgress;
    }

    /**
     * Set the download progress hook.
     * @param {number} onProgress function to display the progress, should returns a boolean (cancelled).
     */
    public setDownloadHook(onProgress: (progress: number) => boolean): void {
        this.onDownloadProgress = onProgress;
    }

    /**
     * Create a new RealityDataTransferService.
     * @param {() => Promise<string>} getAccessToken Callback to get the access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(getAccessToken: () => Promise<string>, env?: string) {
        this.getAccessToken = getAccessToken;
        if(env)
            this.serviceUrl = "https://" + env + "api.bentley.com/reality-management/reality-data";
        
        this.abortController = new AbortController();
    }

    /**
     * Get scopes required for this service.
     * @returns {Set<string>} Set of required minimal scopes.
     */
    public static getScopes(): Set<string> {
        return new Set(["itwin-platform"]);
    }

    /**
     * Download reality data from ProjectWise ContextShare.
     * @param {string} realityDataId The ID of the reality data to download.
     * @param {string} iTwinId iTwin project associated to the reality data.
     * @param {ReferenceTableBrowser} referenceTable (optional) A table mapping local path of dependencies to their ID.
     */
    public async downloadRealityDataBrowser(realityDataId: string, iTwinId: string, referenceTable?: ReferenceTableBrowser): Promise<void> {
        try {
            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: this.serviceUrl,
            };
            const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
            const iTwinRealityData: ITwinRealityData = await rdaClient.getRealityData(await this.getAccessToken(),
                iTwinId, realityDataId);
            const azureBlobUrl = await iTwinRealityData.getBlobUrl(await this.getAccessToken(), "", false);
            const containerClient = new ContainerClient(azureBlobUrl.toString());
            let iter = await containerClient.listBlobsFlat();

            const downloadInfo: DataTransferInfo = {
                files: [],
                totalFilesSize: 0,
                processedFilesSize: 0
            };

            for await (const blob of iter) {
                downloadInfo.totalFilesSize += blob.properties.contentLength ?? 0;
                downloadInfo.files.push({ name: blob.name, size: blob.properties.contentLength ?? 0 });
            }

            const dirHandle = await window.showDirectoryPicker({ writable: true });
            let currentPercentage = -1;
            iter = await containerClient.listBlobsFlat(); // rewind iterator
            for (let i = 0; i < downloadInfo.files.length; i++) {
                const filehandle = await dirHandle.getFileHandle(downloadInfo.files[i].name, { create: true });
                const writableStream = await filehandle.createWritable();

                const options: BlobDownloadOptions = {
                    abortSignal: this.abortController.signal,
                    onProgress: async (env) => {
                        if (this.abortController.signal.aborted)
                            return;

                        const newPercentage = Math.round(((env.loadedBytes + downloadInfo.processedFilesSize)
                            / downloadInfo.totalFilesSize * 100));
                        if (newPercentage !== currentPercentage) {
                            currentPercentage = newPercentage;
                            if (this.onDownloadProgress) {
                                const isCancelled = !this.onDownloadProgress(currentPercentage);
                                if (isCancelled)
                                    this.abortController.abort();
                            }
                        }
                    }
                };

                const blobContent = await containerClient.getBlockBlobClient(downloadInfo.files[i].name).download(0, undefined, options);
                const blobBody = await blobContent.blobBody;

                if (referenceTable) {
                    if (downloadInfo.files[i].name === "ContextScene.xml")
                        await replaceContextSceneReferences(blobBody!, referenceTable, false, downloadInfo.files[i].name.endsWith(".json"));
                    else if (downloadInfo.files[i].name === "Orientations.xml")
                        await replaceCCOrientationsReferences(blobBody!, referenceTable, false);

                    const text = localStorage.getItem("tmpPatchedFile")!;
                    const byteArray = new TextEncoder().encode(text);
                    const buffer = byteArray.buffer;
                    await writableStream.write(buffer);
                }
                else {
                    const buffer = await blobBody!.arrayBuffer();
                    await writableStream.write(buffer);
                }

                downloadInfo.processedFilesSize += downloadInfo.files[i].size;
                await writableStream.close();
            }
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    private async createRealityData(type: string, name: string, iTwinId: string, rootFile?: string): Promise<ITwinRealityData> {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: this.serviceUrl,
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        const realityData = new ITwinRealityData(rdaClient, undefined, iTwinId);
        realityData.displayName = name;
        realityData.type = type;
        if(rootFile)
            realityData.rootDocument = rootFile;

        const iTwinRealityData: ITwinRealityData = await rdaClient.createRealityData(
            await this.getAccessToken(), iTwinId, realityData);
        return iTwinRealityData;
    }

    /**
     * Upload reality data to ProjectWise ContextShare.
     * @param {File[]} files Files to upload.
     * @param {RealityDataType} type RealityDataType of the data.
     * @param {string} name Name of the created entry on ProjectWise ContextShare.
     * @param {string} iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the 
     * data center where the reality data is stored.
     * @param {string} rootFile (optional) Used to indicate the root document of the reality data. The root document can be in a 
     * subfolder and is then specified as “Tile_Root.json” or “Folder1/SubFolder1/File.json” for example, with 
     * a relative path to the root folder of the data.
     * @returns {string} The ID of the uploaded data.
     */
    public async uploadRealityDataBrowser(files: File[], type: string, name: string, iTwinId: string, rootFile?: string,
        referenceTable?: ReferenceTableBrowser): Promise<string> {
        try {
            if(referenceTable) {
                if (type === RealityDataType.CONTEXT_SCENE)
                    await replaceContextSceneReferences(files[0], referenceTable, true, files[0].name.endsWith(".json"));

                if (type === RealityDataType.CC_ORIENTATIONS)
                    await replaceCCOrientationsReferences(files[0], referenceTable, true);
            }

            const iTwinRealityData = await this.createRealityData(type, name, iTwinId, rootFile);
            const azureBlobUrl: URL = await iTwinRealityData.getBlobUrl(await this.getAccessToken(), "", true);
            const containerClient = new ContainerClient(azureBlobUrl.toString());
            const uploadInfo: DataTransferInfo = {
                files: [],
                totalFilesSize: 0,
                processedFilesSize: 0
            };

            for (let i = 0; i < files.length; i++) {
                uploadInfo.totalFilesSize += files[i].size;
                uploadInfo.files.push({ name: files[i].webkitRelativePath.substring(files[i].webkitRelativePath.indexOf("/") + 1), size: files[i].size });
            }

            let currentPercentage = -1;
            for (let i = 0; i < uploadInfo.files.length; i++) {
                const blockBlobClient = containerClient.getBlockBlobClient(uploadInfo.files[i].name);
                const options: BlockBlobParallelUploadOptions = {
                    abortSignal: this.abortController.signal,
                    maxSingleShotSize: 100 * 1024 * 1024, // 100MB
                    concurrency: 20,
                    onProgress: async (env) => {
                        if (this.abortController.signal.aborted)
                            return;

                        const newPercentage = Math.round(((env.loadedBytes + uploadInfo.processedFilesSize)
                            / uploadInfo.totalFilesSize * 100));
                        if (newPercentage !== currentPercentage) {
                            currentPercentage = newPercentage;
                            if (this.onUploadProgress) {
                                const isCancelled = !this.onUploadProgress(currentPercentage);
                                if (isCancelled)
                                    this.abortController.abort();
                            }
                        }
                    }
                };
                let uploadBlobResponse: BlobUploadCommonResponse;
                if (referenceTable && (type === RealityDataType.CONTEXT_SCENE || type === RealityDataType.CC_ORIENTATIONS))
                    uploadBlobResponse = await blockBlobClient.uploadData(new TextEncoder().encode(localStorage.getItem("tmpPatchedFile")!), options);
                else
                    uploadBlobResponse = await blockBlobClient.uploadData(files[i], options);

                uploadInfo.processedFilesSize += uploadInfo.files[i].size;
                if (uploadBlobResponse.errorCode)
                    return Promise.reject(new Error(
                        "Can't upload reality data : " + iTwinRealityData + ", error : " + uploadBlobResponse.errorCode));
            }
            return iTwinRealityData.id;
        }
        catch (error: any) {
            if (error.name === "AbortError")
                return "";

            return Promise.reject(error);
        }
    }
}
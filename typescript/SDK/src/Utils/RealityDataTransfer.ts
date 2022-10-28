import { ContainerClient } from "@azure/storage-blob";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import * as fs from "fs";
import * as os from "os";
import path = require("path");
import { ReferenceTable } from "./ReferenceTable";
import { v4 as uuidv4 } from "uuid";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { ClientInfo, RealityDataType } from "../CommonData";
import { Service } from "../Service";

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

async function getUniqueTmpDir(): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), "Bentley/ContextCapture Internal/", uuidv4());
    await fs.promises.mkdir(tmpDir);
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
            await fs.promises.mkdir(path.dirname(path.join(localTmpPath, files[i])));
        }
        await fs.promises.copyFile(path.join(path.dirname(scenePath), files[i]), path.join(localTmpPath, files[i]));
    };
    newScenePath = path.join(localTmpPath, path.basename(scenePath));
    return newScenePath;
}

async function replaceXMLScene(scenePath: string, outputPath: string, references: ReferenceTable, localToCloud: boolean): Promise<void> {
    const data = await fs.promises.readFile(scenePath);
    const text = data.toString();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const sceneReferences = xmlDoc.getElementsByTagName("Reference");
    for (let i = 0; i < sceneReferences.length; i++) {
        const referencePath = sceneReferences[i].getElementsByTagName("Path");
        if (!referencePath.length)
            return Promise.reject(Error(
                "Invalid context scene" + scenePath + ", the reference " + sceneReferences[i] + " has no path."));

        const pathValue = referencePath[0].textContent;
        if (!pathValue)
            return Promise.reject(Error(
                "Invalid context scene" + scenePath + ", the reference " + sceneReferences[i] + " has no path content."));

        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(pathValue);
            if (!cloudId)
                return Promise.reject(Error("Can't replace local path with cloud id "));

            referencePath[0].textContent = "rds:" + cloudId;
        }
        else {
            if (pathValue.substring(0, 4) !== "rds:")
                return Promise.reject(Error(
                    "Invalid context scene" + scenePath + ", the reference " + pathValue + "doesn't start with 'rds:'."));

            const cloudId = pathValue.substring(4);
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return Promise.reject(Error(
                    "Can't replace cloud id " + cloudId + "path with local path, does not exist in references"));

            referencePath[0].textContent = localPath;
        }
    }

    await fs.promises.unlink(outputPath);
    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    await fs.promises.writeFile(outputPath, newXmlStr);
}

async function replaceJSONScene(scenePath: string, outputPath: string, references:
    ReferenceTable, localToCloud: boolean): Promise<void> {
    const data = await fs.promises.readFile(scenePath);
    const text = data.toString();
    const json = JSON.parse(text);
    for (const referenceId in json.References) {
        let referencePath = json.References[referenceId].Path;
        referencePath = referencePath.replace(/\//g, "\\");
        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(referencePath);
            if (!cloudId)
                return Promise.reject(Error("Can't replace local path " + referencePath + " with cloud id "));

            json.References[referenceId].Path = "rds:" + cloudId;
        }
        else {
            if (referencePath.substring(0, 4) !== "rds:")
                return Promise.reject(Error(
                    "Invalid context scene" + scenePath + ", the reference " + path + "doesn't start with 'rds:'."));

            const id = referencePath.substring(4);
            const localPath = references.getLocalPathFromCloudId(id);
            referencePath = referencePath.replace(/\//g, "\\");
            if (!localPath)
                return Promise.reject(Error("Can't replace cloud id path with local path"));

            json.References[referenceId].Path = localPath;
        }
    }

    await fs.promises.unlink(outputPath);
    await fs.promises.writeFile(outputPath, JSON.stringify(json, undefined, 4));
}

/**
 * Replaces references on the given CCOrientation by the ones on the reference table.
 * This function can either replace local paths for reality data IDs or the contrary, according to the value of
 * localToCloud.
 * @param {string} ccOrientationPath Path to the CCOrientation.
 * @param {string} outputPath Path to the new CCOrientation. You can pass the same path twice if you want to replace the file.
 * @param {ReferenceTable} references A table mapping local path of dependencies to their ID.
 * @param {boolean} localToCloud  If true, searches for local paths and replaces them for reality data ids, if false does the opposite.
 */
export async function replaceCCOrientationsReferences(ccOrientationPath: string, outputPath: string, references: ReferenceTable,
    localToCloud: boolean): Promise<void> {
    const data = await fs.promises.readFile(ccOrientationPath);
    const text = data.toString();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const photos = xmlDoc.getElementsByTagName("Photo");
    for (let i = 0; i < photos.length; i++) {
        const imagePath = photos[i].getElementsByTagName("ImagePath");
        const maskPath = photos[i].getElementsByTagName("MaskPath");
        if (!imagePath.length)
            return Promise.reject(Error(
                "Invalid cc orientations " + ccOrientationPath + ", the image " + photos[i] + " has no path."));

        const pathValue = imagePath[0].textContent;
        if (!pathValue)
            return Promise.reject(Error(
                "Invalid cc orientations" + ccOrientationPath + ", the image " + photos[i] + " has no path content."));

        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(path.dirname(pathValue));
            const fileName = path.basename(pathValue);
            if (!cloudId)
                return Promise.reject(Error(
                    "Can't replace local path " + pathValue + " with cloud id : does not exist in reference table"));

            imagePath[0].textContent = path.join(cloudId, fileName);
            if (maskPath.length) {
                const maskPathValue = maskPath[0].textContent;
                if (!maskPathValue)
                    return Promise.reject(Error(
                        "Invalid cc orientations" + ccOrientationPath + ", the mask " + photos[i] + " has no path content."));

                const maskCloudId = references.getCloudIdFromLocalPath(path.dirname(maskPathValue));
                if (!maskCloudId)
                    return Promise.reject(Error(
                        "Can't replace local path " + maskPathValue + " with mask cloud id."));

                maskPath[0].textContent = path.join(maskCloudId, path.basename(pathValue));
            }
        }
        else {
            const splittedImagePath = pathValue.split(/(\/\\)+/);
            if (!splittedImagePath.length)
                return Promise.reject(Error(
                    "Invalid image path, the reference " + pathValue + " is not a path."));

            const cloudId = splittedImagePath[0];
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return Promise.reject(Error(
                    "Can't replace cloud id " + cloudId + "path with local path, does not exist in references"));

            imagePath[0].textContent = localPath;
            if (maskPath.length) {
                const maskPathValue = maskPath[0].textContent;
                if (!maskPathValue)
                    return Promise.reject(Error(
                        "Invalid cc orientations " + ccOrientationPath + ", the mask " + photos[i] + " has no path content."));

                const splittedMaskPath = maskPathValue.split(/(\/\\)+/);
                if (!splittedMaskPath.length)
                    return Promise.reject(Error(
                        "Invalid image path, the reference " + maskPathValue + " is not a path."));

                const maskCloudId = splittedMaskPath[0];
                const maskLocalPath = references.getLocalPathFromCloudId(maskCloudId);
                if (!maskLocalPath)
                    return Promise.reject(Error(
                        "Can't replace cloud id " + maskCloudId + "path with local path, does not exist in references"));

                maskPath[0].textContent = maskLocalPath;
            }
        }
    }

    await fs.promises.unlink(outputPath);
    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    await fs.promises.writeFile(outputPath, newXmlStr);
}

/**
 * Replaces references on the given ContextScene by the ones on the reference table.
 * This function can either replace local paths for reality data IDs or the contrary, according to the value of localToCloud.
 * @param {string} scenePath Path to the ContextScene.
 * @param {string} outputPath Path to the new ContextScene. You can pass the same path twice if you want to replace the file.
 * @param {ReferenceTable} references A table mapping local path of dependencies to their ID.
 * @param {boolean} localToCloud If true, searches for local paths and replaces them for reality data ids, if false does the opposite.
 */
export async function replaceContextSceneReferences(scenePath: string, outputPath: string, references: ReferenceTable,
    localToCloud: boolean): Promise<void> {
    if (scenePath.endsWith("json"))
        await replaceJSONScene(scenePath, outputPath, references, localToCloud);
    else
        await replaceXMLScene(scenePath, outputPath, references, localToCloud);
}

/**
 * Utility class to upload and download reality data in ContextShare.
 */
export class RealityDataTransfer extends Service {
    /**
     * Create a new RealityDataTransferService from provided iTwin application infos.
     * @param clientInfo iTwin application infos.
     * @param url (optional) Url of the RealityData Analysis Service. Default : "https://qa-api.bentley.com/realitydata/" .
     */
    constructor(clientInfo: ClientInfo, url?: string) {
        super(clientInfo, url ?? "https://qa-api.bentley.com/realitydata/");
    }

    /**
     * @protected
     * Get scopes required for this service.
     * @returns required minimal scopes.
     */
    protected getScopes(): string {
        return "realitydata:modify realitydata:read";
    }

    /**
     * Upload reality data to ProjectWise ContextShare.
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
    public async uploadRealityData(dataToUpload: string, name: string, type: RealityDataType,
        iTwinId: string, rootFile?: string): Promise<string> {
        // TODO: parallelize
        try {
            await this.connect();

            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: this.url,
                authorizationClient: this.authorizationClient,
            };
            const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
            const realityData = new ITwinRealityData(rdaClient, undefined, iTwinId);
            realityData.displayName = name;
            realityData.type = type;
            realityData.description = "";
            realityData.classification = "Undefined";
            realityData.rootDocument = rootFile;

            const iTwinRealityData: ITwinRealityData = await rdaClient.createRealityData(
                "", iTwinId, realityData);
            // Then, get the files to upload
            const azureBlobUrl: URL = await iTwinRealityData.getBlobUrl("", "", true);
            const containerClient = new ContainerClient(azureBlobUrl.toString());

            const files = await listFiles(dataToUpload);
            for (let i = 0; i < files.length; i++) {
                const blockBlobClient = containerClient.getBlockBlobClient(files[i]);
                const uploadBlobResponse = await blockBlobClient.uploadFile(path.join(dataToUpload, files[i]));
                if (uploadBlobResponse.errorCode)
                    return Promise.reject(Error(
                        "Can't upload reality data : " + realityData + ", error : " + uploadBlobResponse.errorCode));
            }
            return iTwinRealityData.id;
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Upload a ContextScene to ProjectWise ContextShare.
     * Convenience function that replaces references if a reference table is provided and upload the ContextScene.
     * All local dependencies should have been uploaded before, and their IDs provided in the reference table.
     * @param {string} sceneFolderPath Local directory containing the relevant ContextScene. The file must be called "ContextScene".
     * @param {string} name Name of the created entry on ProjectWise ContextShare.
     * @param {string} iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the
     * data center where the reality data is stored.
     * @param {ReferenceTable} references (optional) A table mapping local path of dependencies to their ID.
     * @returns {string} The ID of the uploaded ContextScene.
     */
    public async uploadContextScene(sceneFolderPath: string, name: string, iTwinId: string,
        references?: ReferenceTable): Promise<string> {
        try {
            const orientationFiles = await listFiles(sceneFolderPath);
            if (!orientationFiles[0].includes("ContextScene"))
                return Promise.reject(Error(
                    "The folder to upload doesn't contain any file named 'ContextScene'."));

            let scenePath = path.join(sceneFolderPath, orientationFiles[0]);
            let newScenePath = await createTempScene(scenePath);
            if (references)
                await replaceContextSceneReferences(scenePath, newScenePath, references, true);

            return await this.uploadRealityData(path.dirname(newScenePath), name, RealityDataType.CONTEXT_SCENE, iTwinId);
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
     * @param {ReferenceTable} references (optional): A table mapping local path of dependencies to their ID.
     * @returns {string} The ID of the uploaded CCOrientation.
     */
    public async uploadCCOrientations(orientationFolderPath: string, name: string, iTwinId: string,
        references?: ReferenceTable): Promise<string> {
        try {
            const orientationFiles = await listFiles(orientationFolderPath);
            if (!orientationFiles[0].includes("Orientations"))
                return Promise.reject(Error(
                    "The folder to upload doesn't contain any file named 'Orientations'."));

            let orientationPath = path.join(orientationFolderPath, orientationFiles[0]);
            let newOrientationPath = await createTempScene(orientationPath);
            if (references)
                await replaceCCOrientationsReferences(orientationPath, newOrientationPath, references, true);

            return await this.uploadRealityData(path.dirname(newOrientationPath), name, RealityDataType.CC_ORIENTATIONS, iTwinId);
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Download reality data from ProjectWise ContextShare.
     * This function should not be used for ContextScenes that contain dependencies to data you have locally as the
     * paths will point to ids in the ProjectWise ContextShare.
     * Use downloadContextScene instead.
     * @param {string} realityDataId The ID of the data to download.
     * @param {string} downloadPath The path where downloaded data should be saved.
     */
    public async downloadRealityData(realityDataId: string, downloadPath: string): Promise<void> {
        // TODO: parallelize
        try {
            await this.connect();

            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: this.url,
                authorizationClient: this.authorizationClient,
            };
            const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
            const iTwinRealityData: ITwinRealityData = await rdaClient.getRealityData("", undefined, realityDataId);
            const azureBlobUrl = await iTwinRealityData.getBlobUrl("", "", false);
            const containerClient = new ContainerClient(azureBlobUrl.toString());
            const blobNames: string[] = [];
            const iter = await containerClient.listBlobsFlat();
            for await (const blob of iter) {
                blobNames.push(blob.name);
            }
            const filesToDownload = [...blobNames];

            for (let i = 0; i < filesToDownload.length; i++) {
                const filePath = path.join(downloadPath, filesToDownload[i]);
                try {
                    await fs.promises.access(path.dirname(filePath), fs.constants.W_OK);
                }
                catch (error: any) {
                    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                }

                const blobContent = await containerClient.getBlockBlobClient(filesToDownload[i]).download(0);
                await fs.promises.writeFile(filePath, await streamToBuffer(blobContent.readableStreamBody!));
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
     * @param {ReferenceTable} references (optional): A table mapping local path of dependencies to their ID.
     */
    public async downloadContextScene(realityDataId: string, downloadPath: string,
        references?: ReferenceTable): Promise<void> {
        try {
            await this.downloadRealityData(realityDataId, downloadPath);
            if (references) {
                const scenePath = path.join(downloadPath, "ContextScene.xml");
                if (!fs.existsSync(path.dirname(scenePath)))
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
     * @param {ReferenceTable} references (optional): A table mapping local path of dependencies to their ID.
     */
    public async downloadCCorientations(realityDataId: string, downloadPath: string,
        references?: ReferenceTable): Promise<void> {
        try {
            await this.downloadRealityData(realityDataId, downloadPath);
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
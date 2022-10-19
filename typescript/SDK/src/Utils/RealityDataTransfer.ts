import { ContainerClient } from "@azure/storage-blob";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import * as fs from "fs";
import * as os from "os";
import path = require("path");
import { ReferenceTable } from "./ReferenceTable";
import { v4 as uuidv4 } from "uuid";
import { IModelHost } from "@itwin/core-backend";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { RealityDataType } from "./CommonData";

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

function listFiles(root: string, currentFolder ?: string): string[] {
    const allSubFiles: string[] = [];
    const path = currentFolder ? root + "/" + currentFolder : root;
    try {
        const subFiles = fs.readdirSync(path);

        for (let i = 0; i < subFiles.length; i++) {
            const fileDirFromRoot = currentFolder ? currentFolder + "/" + subFiles[i] : subFiles[i];
            if (fs.lstatSync(path + "/" + subFiles[i]).isDirectory()) {
                allSubFiles.push(...listFiles(root, fileDirFromRoot));
            }
            else
                allSubFiles.push(fileDirFromRoot);
        }
    }
    catch (error: any) {
        throw new Error("Can't list files to upload in " + root + ". " + error);
    }
    return allSubFiles;
}

function getUniqueTmpDir(): string {
    const tmpDir = path.join(os.tmpdir(), "Bentley/ContextCapture Internal/", uuidv4());
    try {
        fs.mkdirSync(tmpDir);
    }
    catch (error: any) {
        throw new Error("Can't create unique dir : " + tmpDir + " for temporary scene. " + error);
    }
    return tmpDir;
}

function createTempScene(scenePath: string): string {
    let newScenePath = scenePath;
    const localTmpPath = getUniqueTmpDir();
    if (!localTmpPath)
        return "";

    try {
        const files = listFiles(path.dirname(scenePath));
        files.forEach((file) => {
            if (!fs.existsSync(path.dirname(path.join(localTmpPath, file)))) {
                fs.mkdirSync(path.dirname(path.join(localTmpPath, file)));
            }

            fs.copyFileSync(path.join(path.dirname(scenePath), file), path.join(localTmpPath, file));
        });
        newScenePath = path.join(localTmpPath, path.basename(scenePath));
        return newScenePath;
    }
    catch (error: any) {
        throw new Error("Can't create a temporary scene from " + scenePath + ". " + error);
    }
}

function replaceXMLScene(scenePath: string, outputPath: string, references: ReferenceTable, localToCloud: boolean): void | Error {
    try {
        const data = fs.readFileSync(scenePath);
        const text = data.toString();
        const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
        const sceneReferences = xmlDoc.getElementsByTagName("Reference");
        for (let i = 0; i < sceneReferences.length; i++) {
            const referencePath = sceneReferences[i].getElementsByTagName("Path");
            if (!referencePath.length)
                return new Error("Invalid context scene, the reference " + sceneReferences[i] + " has no path.");

            const pathValue = referencePath[0].textContent;
            if (!pathValue)
                return new Error("Invalid context scene, the reference " + sceneReferences[i] + " has no path content.");

            if (localToCloud) {
                const cloudId = references.getCloudIdFromLocalPath(pathValue);
                if (!cloudId)
                    return new Error("Can't replace local path with cloud id ");

                referencePath[0].textContent = "rds:" + cloudId;
            }
            else {
                if (pathValue.substring(0, 4) !== "rds:")
                    return new Error("Invalid context scene, the reference " + pathValue + "doesn't start with 'rds:'.");

                const cloudId = pathValue.substring(4);
                const localPath = references.getLocalPathFromCloudId(cloudId);
                if (!localPath)
                    return new Error("Can't replace cloud id " + cloudId + "path with local path, does not exist in references");

                referencePath[0].textContent = localPath;
            }
        }

        fs.unlinkSync(outputPath);
        const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
        fs.writeFileSync(outputPath, newXmlStr);
    }
    catch (error: any) {
        return new Error("Can't replace references in xml context scene : " + scenePath + ". " + error);
    }
}

function replaceJSONScene(scenePath: string, outputPath: string, references: ReferenceTable, localToCloud: boolean): void | Error {
    try {
        const data = fs.readFileSync(scenePath);
        const text = data.toString();
        const json = JSON.parse(text);
        for (const referenceId in json.References) {
            let referencePath = json.References[referenceId].Path;
            referencePath = referencePath.replace(/\//g, "\\");
            if (localToCloud) {
                const cloudId = references.getCloudIdFromLocalPath(referencePath);
                if (!cloudId)
                    return new Error("Can't replace local path with cloud id ");

                json.References[referenceId].Path = "rds:" + cloudId;
            }
            else {
                if (referencePath.substring(0, 4) !== "rds:")
                    return new Error("Invalid context scene, the reference " + path + "doesn't start with 'rds:'.");

                const id = referencePath.substring(4);
                const localPath = references.getLocalPathFromCloudId(id);
                referencePath = referencePath.replace(/\//g, "\\");
                if (!localPath)
                    return new Error("Can't replace cloud id path with local path");

                json.References[referenceId].Path = localPath;
            }
        }

        fs.unlinkSync(outputPath);
        fs.writeFileSync(outputPath, JSON.stringify(json, undefined, 4));
    }
    catch (error: any) {
        return new Error("Can't references in json context scene : " + scenePath + ". " + error);
    }
}

export function replaceCCOrientationsReferences(scenePath: string, outputPath: string, references: ReferenceTable, localToCloud: boolean): void | Error {
    const data = fs.readFileSync(scenePath);
    const text = data.toString();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const photos = xmlDoc.getElementsByTagName("Photo");
    for (let i = 0; i < photos.length; i++) {
        const imagePath = photos[i].getElementsByTagName("ImagePath");
        const maskPath = photos[i].getElementsByTagName("MaskPath");
        if (!imagePath.length)
            return new Error("Invalid cc orientations, the image " + photos[i] + " has no path.");

        const pathValue = imagePath[0].textContent;
        if(!pathValue)
            return new Error("Invalid cc orientations, the image " + photos[i] + " has no path content.");
        
        if (localToCloud) {
            const cloudId = references.getCloudIdFromLocalPath(path.dirname(pathValue));
            const fileName = path.basename(pathValue);
            if (!cloudId)
                return new Error("Can't replace local path with cloud id ");

            imagePath[0].textContent = path.join(cloudId, fileName);
            if(maskPath.length) {
                const maskPathValue = maskPath[0].textContent;
                if(!maskPathValue)
                    return new Error("Invalid cc orientations, the mask " + photos[i] + " has no path content.");

                const maskCloudId = references.getCloudIdFromLocalPath(path.dirname(maskPathValue));
                if (!maskCloudId)
                    return new Error("Can't replace local path with mask cloud id ");

                maskPath[0].textContent = path.join(maskCloudId, path.basename(pathValue));
            }
        }
        else {
            const splittedImagePath = pathValue.split(/(\/\\)+/);
            if(!splittedImagePath.length)
                return new Error("Invalid image path, the reference " + pathValue + " is not a path.");

            const cloudId = splittedImagePath[0];
            const localPath = references.getLocalPathFromCloudId(cloudId);
            if (!localPath)
                return new Error("Can't replace cloud id " + cloudId + "path with local path, does not exist in references");

            imagePath[0].textContent = localPath;
            if(maskPath.length) {
                const maskPathValue = maskPath[0].textContent;
                if(!maskPathValue)
                    return new Error("Invalid cc orientations, the mask " + photos[i] + " has no path content.");

                const splittedMaskPath = maskPathValue.split(/(\/\\)+/);
                if(!splittedMaskPath.length)
                    return new Error("Invalid image path, the reference " + maskPathValue + " is not a path.");
        
                const maskCloudId = splittedMaskPath[0];
                const maskLocalPath = references.getLocalPathFromCloudId(maskCloudId);
                if (!maskLocalPath)
                    return new Error("Can't replace cloud id " + maskCloudId + "path with local path, does not exist in references");
        
                maskPath[0].textContent = maskLocalPath;
            }
        }
    }

    fs.unlinkSync(outputPath);
    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    fs.writeFileSync(outputPath, newXmlStr);
}

export function replaceContextSceneReferences(scenePath: string, outputPath: string, references: ReferenceTable, localToCloud: boolean): void | Error {
    if (scenePath.endsWith("json")) {
        const res = replaceJSONScene(scenePath, outputPath, references, localToCloud);
        if (res)
            return res;
    }
    else {
        const res = replaceXMLScene(scenePath, outputPath, references, localToCloud);
        if (res)
            return res;
    }

    return;
}

/**
 * Utility class to upload and download reality data in ContextShare.
 */
export class RealityDataTransfer {
    /** Url of the RealityData Analysis Service. */
    private url: string;

    /** A client id with realitydata and realitydataanalysis scopes. */
    private clientId: string;
    
    /** Service application secret. */
    private secret: string;
    
    /** Authorization client to generate the access token, automatically refreshed if necessary.*/
    private authorizationClient?: ServiceAuthorizationClient;

    constructor(url: string, clientId: string, secret: string) {
        this.url = url;
        this.clientId = clientId;
        this.secret = secret;
    }

    /**
     * Connects to the Reality data analysis service.
     * @returns A potential error message.
     */
    public async connect(): Promise<void | Error> {
        try {
            await IModelHost.startup();
            this.authorizationClient = new ServiceAuthorizationClient ({
                clientId: this.clientId,
                clientSecret : this.secret,
                scope: "realitydata:modify realitydata:read realitydataanalysis:read realitydataanalysis:modify",
                authority: "https://qa-ims.bentley.com",
            });
        }
        catch(error: any) {
            return error;
        }
    }

    /**
     * Upload reality data to ProjectWise ContextShare.
     * This function should not be used for ContextScenes or CCOrientations that contain dependencies to other data
     * unless those dependencies are already uploaded and the file you want to upload points to their id. 
     * Use upload_context_scene or upload_ccorientation instead.
     * @param dataToUpload Local directory containing the relevant data.
     * @param name Name of the created entry on ProjectWise ContextShare.
     * @param type RealityDataType of the data.
     * @param iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the 
     * data center where the reality data is stored.
     * @param rootFile Used to indicate the root document of the reality data. The root document can be in a 
     * subfolder and is then specified as “Tile_Root.json” or “Folder1/SubFolder1/File.json” for example, with 
     * a relative path to the root folder of the data.
     * @returns The ID of the uploaded data, and a potential error message.
     */
    public async uploadRealityData(dataToUpload: string, name: string, type: RealityDataType, 
        iTwinId: string, rootFile?: string): Promise<string | Error> {
        // TODO: parallelize
        try {
            if(!this.authorizationClient) {
                const err = await this.connect();
                if(err)
                    return err;
            }

            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: this.url,
            };
            const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
            const realityData = new ITwinRealityData(rdaClient, undefined, iTwinId);
            realityData.displayName = name;
            realityData.type = type;
            realityData.description = "";
            realityData.classification = "Undefined";
            realityData.rootDocument = rootFile;

            const iTwinRealityData: ITwinRealityData = await rdaClient.createRealityData(await this.authorizationClient!.getAccessToken(), iTwinId, realityData);
            // Then, get the files to upload
            const azureBlobUrl: URL = await iTwinRealityData.getBlobUrl(await this.authorizationClient!.getAccessToken(), "", true);
            const containerClient = new ContainerClient(azureBlobUrl.toString());

            const files = listFiles(dataToUpload);
            for(let i = 0; i < files.length; i++) {
                const blockBlobClient = containerClient.getBlockBlobClient(files[i]);
                const uploadBlobResponse = await blockBlobClient.uploadFile(path.join(dataToUpload, files[i]));
                if(uploadBlobResponse.errorCode)
                    return Error("Can't upload reality data : " + realityData + ", error : " + uploadBlobResponse.errorCode);
            }
            return iTwinRealityData.id;
        }
        catch(error: any) {
            return error;
        }
    }

    /**
     * Upload a ContextScene to ProjectWise ContextShare.
     * Convenience function that replaces references if a reference table is provided and upload the ContextScene.
     * All local dependencies should have been uploaded before, and their IDs provided in the reference table.
     * @param sceneFolderPath Local directory containing the relevant ContextScene. The file must be called "ContextScene".
     * @param name Name of the created entry on ProjectWise ContextShare.
     * @param iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the
     * data center where the reality data is stored.
     * @param references (optional) A table mapping local path of dependencies to their ID.
     * @returns The ID of the uploaded ContextScene, and a potential error message.
     */
    public async uploadContextScene(sceneFolderPath: string, name: string, iTwinId: string, 
        references?: ReferenceTable): Promise<string | Error> {
        const orientationFiles = listFiles(sceneFolderPath);
        if(!orientationFiles.length)
            return new Error("The folder to upload doesn't contain any file.");

        if(!orientationFiles[0].includes("ContextScene")) // TODO ask Renaud
            return new Error("The folder to upload doesn't contain any file named 'ContextScene'.");
        
        let scenePath = path.join(sceneFolderPath, orientationFiles[0]);
        let newScenePath = createTempScene(scenePath);
        if(references) {
            const res = replaceContextSceneReferences(scenePath, newScenePath, references, true);
            if(res instanceof Error)
                return res;
        }

        return await this.uploadRealityData(path.dirname(newScenePath), name, RealityDataType.CONTEXT_SCENE, iTwinId);
    }

    /**
     * Upload a CCOrientation to ProjectWise ContextShare.
     * Convenience function that replaces references if a reference table is provided and upload the file.
     * All local dependencies should have been uploaded before, and their IDs provided in the reference table.
     * @param orientationFolderPath Local directory containing the relevant CCOrientation. The file must be called
     * @param name Name of the created entry on ProjectWise ContextShare.
     * @param iTwinId ID of the iTwin project the reality data will be linked to. It is also used to choose the 
     * data center where the reality data is stored.
     * @param references (optional): A table mapping local path of dependencies to their ID.
     * @returns The ID of the uploaded CCOrientation, and a potential error message.
     */
    public async uploadCCOrientations(orientationFolderPath: string, name: string, iTwinId: string, references?: ReferenceTable): Promise<string | Error> {
        const orientationFiles = listFiles(orientationFolderPath);
        if(!orientationFiles.length)
            return new Error("The folder to upload doesn't contain any file.");

        if(!orientationFiles[0].includes("Orientations")) // TODO ask Renaud
            return new Error("The folder to upload doesn't contain any file named 'Orientations'.");
        
        let orientationPath = path.join(orientationFolderPath, orientationFiles[0]);
        let newOrientationPath = createTempScene(orientationPath);
        if(references) {
            const res = replaceCCOrientationsReferences(orientationPath, newOrientationPath, references, true);
            if(res instanceof Error)
                return res;
        }

        return await this.uploadRealityData(path.dirname(newOrientationPath), name, RealityDataType.CC_ORIENTATIONS, iTwinId);
    }

    /**
     * Download reality data from ProjectWise ContextShare.
     * This function should not be used for ContextScenes that contain dependencies to data you have locally as the
     * paths will point to ids in the ProjectWise ContextShare.
     * Use download_context_scene instead.
     * @param realityDataId The ID of the data to download.
     * @param downloadPath The path where downloaded data should be saved.
     * @returns 
     */
    public async downloadRealityData(realityDataId: string, downloadPath: string): Promise<void | Error> {
        // TODO: parallelize
        try {
            if(!this.authorizationClient) {
                const err = await this.connect();
                if(err)
                    return err;
            }

            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: this.url,
            };
            const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
            const iTwinRealityData: ITwinRealityData = await rdaClient.getRealityData(await this.authorizationClient!.getAccessToken(), undefined, realityDataId);
            const azureBlobUrl = await iTwinRealityData.getBlobUrl(await this.authorizationClient!.getAccessToken(), "", false);
            const containerClient = new ContainerClient(azureBlobUrl.toString());
            const blobNames: string[] = [];
            const iter = await containerClient.listBlobsFlat();
            for await (const blob of iter) 
            {
                blobNames.push(blob.name);
            }
            const filesToDownload = [...blobNames];
        
            for(let i = 0; i < filesToDownload.length; i++) {
                const filePath = path.join(downloadPath, filesToDownload[i]);
                if (!fs.existsSync(path.dirname(filePath)))
                    fs.mkdirSync(path.dirname(filePath), {recursive: true});
                    
                const blobContent = await containerClient.getBlockBlobClient(filesToDownload[i]).download(0);
                fs.writeFileSync(filePath, await streamToBuffer(blobContent.readableStreamBody!));
            }
        }
        catch(error: any) {
            return new Error("Can't download " + realityDataId + ". " + error);
        }
    }

    /**
     * Download a ContextScene from ProjectWise ContextShare.
     * Convenience function that downloads the ContextScene and replaces references if a reference table is provided.
     * All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
     * paths should be provided in the reference table.
     * @param realityDataId The ID of the ContextScene to download.
     * @param downloadPath The path where downloaded ContextScene should be saved.
     * @param references (optional): A table mapping local path of dependencies to their ID.
     * @returns True if download was successful, and a potential error message.
     */
    public async downloadContextScene(realityDataId: string, downloadPath: string, 
        references?: ReferenceTable): Promise<void | Error> {
        const res = await this.downloadRealityData(realityDataId, downloadPath);
        if(res)
            return res;
        
        if(references) {
            const scenePath = path.join(downloadPath, "ContextScene.xml");
            let res;
            if (!fs.existsSync(path.dirname(scenePath)))
                res = replaceContextSceneReferences(path.join(downloadPath, "ContextScene.json"), 
                    path.join(downloadPath, "ContextScene.json"), references, false);
            else
                res = replaceContextSceneReferences(scenePath, scenePath, references, false);
            
            if(res instanceof Error)
                return res;
        }
    }

    /**
     * Download a CCOrientation from ProjectWise ContextShare.
     * Convenience function that downloads the CCOrientation and replaces references if a reference table is provided.
     * All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
     * paths should be provided in the reference table.
     * @param realityDataId The ID of the CCOrientation to download.
     * @param downloadPath The path where downloaded file should be saved.
     * @param references (optional): A table mapping local path of dependencies to their ID.
     * @returns True if download was successful, and a potential error message.
     */
    public async downloadCCorientations(realityDataId: string, downloadPath: string, 
        references?: ReferenceTable): Promise<void | Error> {
        const res = await this.downloadRealityData(realityDataId, downloadPath);
        if(res)
            return res;
        
        if(references) {
            const scenePath = path.join(downloadPath, "Orientations.xml");
            const res = replaceCCOrientationsReferences(scenePath, scenePath, references, false);
            
            if(res instanceof Error)
                return res;
        }
    }
}
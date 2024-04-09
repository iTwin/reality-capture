/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContainerClient } from "@azure/storage-blob";
import { RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";

interface Object2D {
    labelId : number;
    xmin : number;
    ymin : number;
    xmax : number;
    ymax : number;
}

interface Segmentation2D {
    id : number;
    path : string;
}

interface AnnotatedPhoto {
    path: string;
    name: string;
    objects2D: Object2D[];
    segmentation2D: Segmentation2D;
}

interface Reference {
    collectionId: string;
    collectionStorageUrl: string;
}

interface Color {
    r: number;
    g: number;
    b: number;
}

export interface ContextScene {
    photos: Map<number, AnnotatedPhoto>;
    lines3D: string;
    references: Map<number, Reference>;
    labels: Map<number, Color>;
}

/**
 * Create a temporary context scene from the image collection url.
 * @param id image collection id.
 * @param collectionUrl image collection url on azure storage.
 */
export async function writeTempSceneFromImageCollection(id: string, collectionUrl: string): Promise<void> {
    const containerClient = new ContainerClient(collectionUrl);
    const iter = containerClient.listBlobsFlat();

    let tmpFileContent = "";
    tmpFileContent += "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
    tmpFileContent += "<ContextScene version=\"3.0\">\n";
    tmpFileContent += "\t<PhotoCollection>\n";
    tmpFileContent += "\t\t<Photos>\n";
    let i = 0;
    for await (const blob of iter) 
    {
        if(blob.name.toLowerCase().endsWith("jpg") || blob.name.toLowerCase().endsWith("png")) {
            tmpFileContent += "\t\t\t<Photo id=\"" + i + "\">\n";
            tmpFileContent += "\t\t\t\t<ImagePath>0:" + blob.name + "</ImagePath>\n";
            tmpFileContent += "\t\t\t</Photo>\n";
            i++;
        }
    }
    tmpFileContent += "\t\t</Photos>\n";
    tmpFileContent += "\t</PhotoCollection>\n";
    tmpFileContent += "\t<References>\n";
    tmpFileContent += "\t\t<Reference id=\"0\">\n";
    tmpFileContent += "\t\t\t<Path>rds:" + id + "</Path>\n";
    tmpFileContent += "\t\t</Reference>\n";
    tmpFileContent += "\t</References>\n";
    tmpFileContent += "</ContextScene>\n";
    localStorage.setItem("tmpContextSceneFromImages", tmpFileContent);
}

/**
 * Parse references in @see {@link xmlDoc}.
 * @param xmlDoc context scene to parse.
 * @param contextScene parsed context scene.
 * @param accessToken access token to allow the app to access the API.
 */
async function parseReferences(xmlDoc: XMLDocument, contextScene: ContextScene, realityDataAccessClient: RealityDataAccessClient) {
    // Not safe because tags "Reference" may exist elsewhere
    const references = xmlDoc.getElementsByTagName("Reference");
    for (let i = 0; i < references.length; i++) {
        const id = references[i].getAttribute("id");
        if(!id)
            continue; // Attribute id doesn't exist

        const path = references[i].getElementsByTagName("Path");
        if(path.length === 0)
            continue; // No path in reference

        let pathValue = path[0].textContent;
        if(!pathValue)
            continue; // No text content in reference path
        
        pathValue = pathValue.replace("rds:", "");
        const realityData: ITwinRealityData = await realityDataAccessClient.getRealityData("", 
            process.env.IMJS_PROJECT_ID, pathValue);
        const azureBlobUrl = await realityData.getBlobUrl("", "");
        contextScene.references.set(parseInt(id), {collectionId: pathValue, collectionStorageUrl: azureBlobUrl.toString()});
    }
}

async function parseReferencesJson(json: any, contextScene: ContextScene, realityDataAccessClient: RealityDataAccessClient) {
    for (const referenceId in json.References) {
        let referencePath = json.References[referenceId].Path;
        referencePath = referencePath.replace(/\\/g, "/");
        referencePath = referencePath.replace("rds:", "");
        const realityData: ITwinRealityData = await realityDataAccessClient.getRealityData("", 
            process.env.IMJS_PROJECT_ID, referencePath);
        const azureBlobUrl = await realityData.getBlobUrl("", "");
        contextScene.references.set(parseInt(referenceId), {collectionId: referencePath, collectionStorageUrl: azureBlobUrl.toString()});
    }
}

/**
 * Parse image collection in @see {@link xmlDoc}.
 * @param xmlDoc context scene to parse.
 * @param contextScene access token to allow the app to access the API.
 */
function parsePhotoCollection(xmlDoc: XMLDocument, contextScene: ContextScene) {
    // Not safe because tags "photo" may exist elsewhere
    const photos = xmlDoc.getElementsByTagName("Photo");
    for (let i = 0; i < photos.length; i++) {
        const id = photos[i].getAttribute("id");
        if(id === null)
            continue; // Attribute id doesn't exist

        const imagePath = photos[i].getElementsByTagName("ImagePath");
        if(imagePath.length === 0)
            continue; // No path in photo

        const imagePathValue = imagePath[0].textContent!;
        const imagePathParts = imagePathValue.split(":");
        if(imagePathParts.length === 2) {
            const referenceId = parseInt(imagePathParts[0]);
            const reference = contextScene.references.get(referenceId);
            if(reference === undefined)
                continue; // Reference doesn't exist.
            
            // Add the image name in the full azure storage image collection url so it can be displayed in the frontend.
            const referenceParts = reference.collectionStorageUrl.split(reference.collectionId);
            if(referenceParts.length < 2)
                continue; // The reference is supposed to be split in two parts : azure storage url and the file access.

            let access = referenceParts[1];
            if(access[0] === "/")
                access = access.substring(1);
            
            const imageStorageUrl = referenceParts[0] + reference.collectionId + "/" + imagePathParts[1] + access;

            contextScene.photos.set(parseInt(id), { path: imageStorageUrl, name: imagePathParts[1], objects2D: [], segmentation2D: {id: -1, path: ""} });
        }
        else {
            const imagePathParts = imagePathValue.split("/");
            const imageName = imagePathParts.length === 0 ? imagePathValue : imagePathParts[imagePathParts.length - 1];
            contextScene.photos.set(parseInt(id), { path: imagePathValue, name : imageName, objects2D: [], segmentation2D: {id: -1, path: ""} });
        }
    }
}

function parsePhotoCollectionJson(jsonDoc: any, contextScene: ContextScene) {
    for (const photoId in jsonDoc.PhotoCollection.Photos) {
        const imagePath = jsonDoc.PhotoCollection.Photos[photoId].ImagePath;
        const imagePathParts = imagePath.split(":");
        if(imagePathParts.length === 2) {
            const referenceId = parseInt(imagePathParts[0]);
            const reference = contextScene.references.get(referenceId);
            if(reference === undefined)
                continue; // Reference doesn't exist.

            // Add the image name in the full azure storage image collection url so it can be displayed in the frontend.
            const referenceParts = reference.collectionStorageUrl.split(reference.collectionId);
            if(referenceParts.length < 2)
                continue; // The reference is supposed to be split in two parts : azure storage url and the file access.

            let access = referenceParts[1];
            if(access[0] === "/")
                access = access.substring(1);

            const imageStorageUrl = referenceParts[0] + reference.collectionId + "/" + imagePathParts[1] + access;

            contextScene.photos.set(parseInt(photoId), { path: imageStorageUrl, name: imagePathParts[1], objects2D: [], segmentation2D: {id: -1, path: ""} });
        }
        else {
            const imagePathParts = imagePath.split("/");
            const imageName = imagePathParts.length === 0 ? imagePath : imagePathParts[imagePathParts.length - 1];
            contextScene.photos.set(parseInt(photoId), { path: imagePath, name : imageName, objects2D: [], segmentation2D: {id: -1, path: ""} });
        }
    }
}

/**
 * Parse 2D objects in @see {@link xmlDoc}.
 * @param xmlDoc context scene to parse.
 * @param contextScene access token to allow the app to access the API.
 */
function parseObjects2D(xmlDoc: XMLDocument, contextScene: ContextScene) {
    // Not safe because tags "photo" may exist elsewhere
    const objectsInPhoto = xmlDoc.getElementsByTagName("ObjectsInPhoto");
    for (let i = 0; i < objectsInPhoto.length; i++) {
        const photoIdElement = objectsInPhoto[i].getElementsByTagName("PhotoId");
        if(photoIdElement.length === 0)
            continue; // Element PhotoId doesn't exist

        const photoId = parseInt(photoIdElement[0].textContent!);
        if(contextScene.photos.get(photoId) === null)
            continue; // Element PhotoId doesn't exist in Objects

        const objects2D = objectsInPhoto[i].getElementsByTagName("Object2D");
        for (let j = 0; j < objects2D.length; j++) {
            const labelIdString = objects2D[j].getElementsByTagName("LabelId");
            if(labelIdString.length === 0)
                continue; // Element LabelId doesn't exist
            
            const labelId = parseInt(labelIdString[0].textContent!);
            const box2D = objects2D[j].getElementsByTagName("Box2D");
            if(box2D.length === 0 || box2D[0].childNodes.length < 8)
                continue; // Element Box2D doesn't exist
            
            const xmin = parseFloat(box2D[0].childNodes[1].textContent!);
            const ymin = parseFloat(box2D[0].childNodes[3].textContent!);
            const xmax = parseFloat(box2D[0].childNodes[5].textContent!);
            const ymax = parseFloat(box2D[0].childNodes[7].textContent!);
            
            contextScene.photos.get(photoId)!.objects2D.push({
                labelId: labelId,
                xmin,
                ymin,
                xmax,
                ymax,
            });
        }
    }
}

function parseObjects2DJson(jsonDoc: any, contextScene: ContextScene) {
    for (const photoId in jsonDoc.Annotations.Objects2D) {
        const objects = jsonDoc.Annotations.Objects2D[photoId];
        for (const object2DId in objects) {
            const object2D = jsonDoc.Annotations.Objects2D[photoId][object2DId];
            const labelId = parseInt((object2D as any).LabelInfo.LabelId);
            const box2D = (object2D as any).Box2D;

            const xmin = parseFloat(box2D.xmin);
            const ymin = parseFloat(box2D.ymin);
            const xmax = parseFloat(box2D.xmax);
            const ymax = parseFloat(box2D.ymax);

            contextScene.photos.get(parseInt(photoId))!.objects2D.push({
                labelId: labelId,
                xmin,
                ymin,
                xmax,
                ymax,
            });
        }
    }
}

/**
 * Parse labels in @see {@link xmlDoc}.
 * @param xmlDoc context scene to parse.
 * @param contextScene access token to allow the app to access the API.
 */
function parseLabels(xmlDoc: XMLDocument, contextScene: ContextScene) {
    const colors: Color[] = [
        {r: 102, g: 102, b: 0},
        {r: 0, g: 255, b: 255}, // cyan for Id=1 (usually the first created label)
        {r: 127, g: 0, b: 255},
        {r: 0, g: 128, b: 255},
        {r: 0, g: 255, b: 128},
        {r: 128, g: 255, b: 0},
        {r: 255, g: 128, b: 0},
        {r: 0, g: 153, b: 153},
        {r: 0, g: 153, b: 0},
        {r: 153, g: 153, b: 0},
        {r: 0, g: 76, b: 153},
        {r: 0, g: 153, b: 76},
        {r: 76, g: 153, b: 0},
        {r: 153, g: 76, b: 0},
        {r: 102, g: 255, b: 255},
        {r: 102, g: 255, b: 102},
        {r: 255, g: 255, b: 102},
        {r: 178, g: 102, b: 255},
        {r: 102, g:  178, b: 255},
        {r: 102, g: 255, b: 178},
        {r: 178, g: 255, b: 102},
        {r: 255, g: 178, b: 102},
    ];
    
    const labels = xmlDoc.getElementsByTagName("Label");
    for (let i = 0; i < labels.length; i++) {
        const labelIdString = labels[i].getAttribute("id");
        if(labelIdString === null)
            continue; // Attribute id doesn't exist

        const labelId = parseInt(labelIdString);
        const color = labelId ? colors[labelId % colors.length] : {r: 0, g: 0, b: 0};
        contextScene.labels.set(labelId, color);
    }
}

function parseLabelsJson(jsonDoc: any, contextScene: ContextScene) {
    const colors: Color[] = [
        {r: 102, g: 102, b: 0},
        {r: 0, g: 255, b: 255}, // cyan for Id=1 (usually the first created label)
        {r: 127, g: 0, b: 255},
        {r: 0, g: 128, b: 255},
        {r: 0, g: 255, b: 128},
        {r: 128, g: 255, b: 0},
        {r: 255, g: 128, b: 0},
        {r: 0, g: 153, b: 153},
        {r: 0, g: 153, b: 0},
        {r: 153, g: 153, b: 0},
        {r: 0, g: 76, b: 153},
        {r: 0, g: 153, b: 76},
        {r: 76, g: 153, b: 0},
        {r: 153, g: 76, b: 0},
        {r: 102, g: 255, b: 255},
        {r: 102, g: 255, b: 102},
        {r: 255, g: 255, b: 102},
        {r: 178, g: 102, b: 255},
        {r: 102, g:  178, b: 255},
        {r: 102, g: 255, b: 178},
        {r: 178, g: 255, b: 102},
        {r: 255, g: 178, b: 102},
    ];

    if(!jsonDoc.Annotations || !jsonDoc.Annotations.Labels)
        return;

    for (const labelIdString in jsonDoc.Annotations.Labels) {
        const labelId = parseInt(labelIdString);
        const color = labelId ? colors[labelId % colors.length] : {r: 0, g: 0, b: 0};
        contextScene.labels.set(labelId, color);
    }
}

/**
 * Parse 2D segmentation in @see {@link xmlDoc}.
 * @param xmlDoc context scene to parse.
 * @param contextScene access token to allow the app to access the API.
 * @param docUrl
 */
function parseSegmentation2D(xmlDoc: XMLDocument, contextScene: ContextScene, docUrl:string) {
    const segmentation2D = xmlDoc.getElementsByTagName("PhotoSegmentation");

    for (let i = 0; i < segmentation2D.length; i++) {
        const photoIdElement = segmentation2D[i].getElementsByTagName("PhotoId");
        const photoId = parseInt(photoIdElement[0].textContent!);
        if(contextScene.photos.get(photoId) === null)
            continue;
        
        const pathElement = segmentation2D[i].getElementsByTagName("Path");
        if(pathElement.length === 0)
            continue;

        const imagePathValue = pathElement[0].textContent!;
        const imagePathParts = imagePathValue.split(":");
        if(imagePathParts.length === 2) {
            const referenceId = parseInt(imagePathParts[0]);
            const reference = contextScene.references.get(referenceId);
            if(reference === undefined)
                continue; // Reference doesn't exist.
            
            // Add the image name in the full azure storage image collection url so it can be displayed in the frontend.
            const referenceParts = reference.collectionStorageUrl.split(reference.collectionId);
            if(referenceParts.length < 2)
                continue; // The reference is supposed to be split in two parts : azure storage url and the file access.

            let access = referenceParts[1];
            if(access[0] === "/")
                access = access.substring(1);
            
            const imageStorageUrl = referenceParts[0] + reference.collectionId + imagePathParts[1] + access;
            contextScene.photos.get(photoId)!.segmentation2D = {
                id : photoId,
                path: imageStorageUrl
            };
        }
        else {
            const splitUrl = docUrl.split("?skoid");
            if(splitUrl.length < 2)
                return;

            const imageStorageUrl = splitUrl[0] + imagePathValue + "?skoid" + splitUrl[1];
            contextScene.photos.get(photoId)!.segmentation2D = {
                id : photoId,
                path: imageStorageUrl
            };
        }
    }
}

function parseSegmentation2DJson(jsonDoc: any, contextScene: ContextScene, docUrl:string) {
    for (const photoId in jsonDoc.Annotations.Segmentation2D) {
        const photoIdNumber = parseInt(photoId);
        const segPath = jsonDoc.Annotations.Segmentation2D[photoId].Path;
        const imagePathParts = segPath.split(":");
        if(imagePathParts.length === 2) {
            const referenceId = parseInt(imagePathParts[0]);
            const reference = contextScene.references.get(referenceId);
            if(reference === undefined)
                continue; // Reference doesn't exist.

            // Add the image name in the full azure storage image collection url so it can be displayed in the frontend.
            const referenceParts = reference.collectionStorageUrl.split(reference.collectionId);
            if(referenceParts.length < 2)
                continue; // The reference is supposed to be split in two parts : azure storage url and the file access.

            let access = referenceParts[1];
            if(access[0] === "/")
                access = access.substring(1);

            const imageStorageUrl = referenceParts[0] + reference.collectionId + "/" + imagePathParts[1] + access;
            contextScene.photos.get(photoIdNumber)!.segmentation2D = {
                id : photoIdNumber,
                path: imageStorageUrl
            };
        }
        else {
            const splitUrl = docUrl.split("?skoid");
            if(splitUrl.length < 2)
                return;

            const imageStorageUrl = splitUrl[0] + segPath + "?skoid" + splitUrl[1];
            contextScene.photos.get(photoIdNumber)!.segmentation2D = {
                id : photoIdNumber,
                path: imageStorageUrl
            };
        }
    }
}

export async function parseContextScene(realityDataAccessClient: RealityDataAccessClient, sceneId: string, isFile = true): Promise<ContextScene> {
    const contextScene: ContextScene = {
        photos: new Map(),
        lines3D: "",
        references: new Map(),
        labels: new Map(),
    };

    let xmlDoc: Document | undefined = undefined;
    let jsonDoc: any | undefined = undefined;
    const realityData: ITwinRealityData = await realityDataAccessClient.getRealityData("", 
        process.env.IMJS_PROJECT_ID, sceneId);
    const azureBlobUrl = await realityData.getBlobUrl("", "");
    if(!isFile) {
        await writeTempSceneFromImageCollection(sceneId, azureBlobUrl.toString());
        const content = localStorage.getItem("tmpContextSceneFromImages");
        if(!content)
            throw new Error("Can't find any scene to parse.");

        xmlDoc = new DOMParser().parseFromString(content, "text/xml");
    }
    else {
        const containerClient = new ContainerClient(azureBlobUrl.toString());
        const iter = await containerClient.listBlobsFlat();
        for await (const blob of iter) 
        {
            if(blob.name === "ContextScene.xml") {
                const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
                const blobBody = await blobContent.blobBody;
                const text = await blobBody!.text();
                xmlDoc = new DOMParser().parseFromString(text, "text/xml");
            }
            else if(blob.name === "ContextScene.json") {
                const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
                const blobBody = await blobContent.blobBody;
                const text = await blobBody!.text();
                jsonDoc = JSON.parse(text);
            }
        }
    }

    if(xmlDoc) {
        await parseReferences(xmlDoc, contextScene, realityDataAccessClient);
        parsePhotoCollection(xmlDoc, contextScene);
        parseLabels(xmlDoc, contextScene);
        parseObjects2D(xmlDoc, contextScene);
        parseSegmentation2D(xmlDoc, contextScene, azureBlobUrl.toString());
    }
    else if(jsonDoc) {
        await parseReferencesJson(jsonDoc, contextScene, realityDataAccessClient);
        parsePhotoCollectionJson(jsonDoc, contextScene);
        parseLabelsJson(jsonDoc, contextScene);
        parseObjects2DJson(jsonDoc, contextScene);
        parseSegmentation2DJson(jsonDoc, contextScene, azureBlobUrl.toString());

    }
    return contextScene;
}

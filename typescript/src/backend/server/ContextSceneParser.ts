/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import { ContainerClient } from "@azure/storage-blob";
import { Color, ContextScene } from "../../common/models";
import { serverRdsSample } from "./RealityDataApi";
import { DOMParser } from "@xmldom/xmldom";


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

/**
 * Parse scene references.
 * @param xmlDoc scene to parse.
 * @param contextScene parsed scene.
 */
async function parseReferences(xmlDoc: XMLDocument, contextScene: ContextScene): Promise<void> {
    if(!serverRdsSample)
        return;
    
    const references = xmlDoc.getElementsByTagName("Reference");
    for (let i = 0; i < references.length; i++) {
        const idString = references[i].getAttribute("id");
        if(!idString) {
            console.log("Parse references : attribute 'id' does not exist in element 'Reference'.");
            continue;
        }

        const id = parseInt(idString);
        if(isNaN(id)) {
            console.log("Parse references : 'id' in 'Reference' is not a number : ", id);
            continue;
        }

        const path = references[i].getElementsByTagName("Path");
        if(path.length === 0) {
            console.log("Parse references : element 'Path' does not exist in Reference of id : ", id);
            continue;
        }

        let pathValue = path[0].textContent;
        if(!pathValue) {
            console.log("Parse references : element 'Path' is empty in 'Reference of id : ", id);
            continue;
        }
        
        pathValue = pathValue.replace("rds:", "");

        const azureBlobUrl = await serverRdsSample.getRealityDataUrl(pathValue);
        contextScene.references.set(id, {collectionId: pathValue, collectionStorageUrl: azureBlobUrl});
    }
}

/**
 * Parse scene photo collection.
 * @param xmlDoc scene to parse.
 * @param contextScene parsed scene.
 */
function parsePhotoCollection(xmlDoc: XMLDocument, contextScene: ContextScene): void {
    const photos = xmlDoc.getElementsByTagName("Photo");
    for (let i = 0; i < photos.length; i++) {
        const id = photos[i].getAttribute("id");
        if(!id) {
            console.log("Parse photo collection : attribute 'id' does not exist in element 'Photo'.");
            continue;
        }

        const imagePath = photos[i].getElementsByTagName("ImagePath");
        if(imagePath.length === 0) {
            console.log("Parse photo collection : element 'ImagePath' does not exist in element 'Photo' of id : ", id);
            continue;
        }

        const imagePathValue = imagePath[0].textContent;
        if(!imagePathValue) {
            console.log("Parse photo collection : element 'ImagePath' is empty in 'Photo' of id : ", id);
            continue;
        }

        const imagePathParts = imagePathValue.split(":");
        if(imagePathParts.length === 2) {
            const referenceId = parseInt(imagePathParts[0]);
            if(isNaN(referenceId)) {
                console.log("Parse photo collection : 'ImagePath' reference id is not a number : ", referenceId, " in 'Photo' of id : ", id);
                continue;
            }

            const reference = contextScene.references.get(referenceId);
            if(!reference) {
                console.log("Parse photo collection : 'ImagePath' reference id : ", referenceId, ", in 'Photo' of id : ", id,  " does not exist in references.");
                continue;
            }
            
            // Add the image name in the full azure storage image collection url so it can be displayed in the frontend.
            const referenceParts = reference.collectionStorageUrl.split(reference.collectionId);
            if(referenceParts.length < 2) {
                continue; // The reference is supposed to be split in two parts : azure storage url and the file access.
            }

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

/**
 * Parse scene 2D objects.
 * @param xmlDoc scene to parse.
 * @param contextScene parsed scene.
 */
function parseObjects2D(xmlDoc: XMLDocument, contextScene: ContextScene): void {
    const objectsInPhoto = xmlDoc.getElementsByTagName("ObjectsInPhoto");
    for (let i = 0; i < objectsInPhoto.length; i++) {
        const photoIdElement = objectsInPhoto[i].getElementsByTagName("PhotoId");
        if(photoIdElement.length === 0) {
            console.log("Parse 2D objects : element 'PhotoId' does not exist in element 'ObjectsInPhoto'");
            continue;
        }

        if(!photoIdElement[0].textContent) {
            console.log("Parse 2D objects : element 'PhotoId' is empty.");
            continue;
        }

        const photoId = parseInt(photoIdElement[0].textContent);
        if(isNaN(photoId)) {
            console.log("Parse 2D objects : element 'PhotoId' is not a number : ", photoIdElement);
            continue;
        }

        const photo = contextScene.photos.get(photoId);
        if(!photo) {
            console.log("Parse 2D objects : photo of id : ", photoId, " does not exist in photo collection.");
            continue;
        }

        const objects2D = objectsInPhoto[i].getElementsByTagName("Object2D");
        for (let j = 0; j < objects2D.length; j++) {
            const labelIdString = objects2D[j].getElementsByTagName("LabelId");
            if(labelIdString.length === 0) {
                console.log("Parse 2D objects : 'LabelId' does not exist in 'Object2D'.");
                continue;
            }
            
            const labelId = parseInt(labelIdString[0].textContent!);
            if(isNaN(labelId)) {
                console.log("Parse 2D objects : 'LabelId' is not a number  : ", labelId);
                continue;
            }

            const box2D = objects2D[j].getElementsByTagName("Box2D");
            if(box2D.length === 0 || box2D[0].childNodes.length < 8) {
                console.log("Parse 2D objects : 'Box2D' does not exist in 'Object2D'.");
                continue;
            }
            
            const xmin = parseFloat(box2D[0].childNodes[1].textContent!);
            const ymin = parseFloat(box2D[0].childNodes[3].textContent!);
            const xmax = parseFloat(box2D[0].childNodes[5].textContent!);
            const ymax = parseFloat(box2D[0].childNodes[7].textContent!);
            
            photo.objects2D.push({ labelId: labelId, xmin, ymin, xmax, ymax });
        }
    }
}

/**
 * Parse scene labels.
 * @param xmlDoc scene to parse.
 * @param contextScene parsed scene.
 */
function parseLabels(xmlDoc: XMLDocument, contextScene: ContextScene): void {
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
        if(!labelIdString) {
            console.log("Parse labels : attribute 'id' does not exist.");
            continue;
        }

        const labelId = parseInt(labelIdString);
        if(isNaN(labelId)) {
            console.log("Parse labels : 'id' in 'Label' is not a number");
            continue;
        }

        const color = labelId ? colors[labelId % colors.length] : {r: 0, g: 0, b: 0};
        contextScene.labels.set(labelId, color);
    }
}

/**
 * Parse 2D segmentation.
 * @param xmlDoc scene to parse.
 * @param contextScene parsed scene.
 * @param docUrl context scene url.
 */
function parseSegmentation2D(xmlDoc: XMLDocument, contextScene: ContextScene, docUrl:string): void {
    const segmentation2D = xmlDoc.getElementsByTagName("PhotoSegmentation");

    for (let i = 0; i < segmentation2D.length; i++) {
        // TODO : photoId already exist in Objects 2D : do something to avoid issues in scene containing O2D and S2D
        const photoIdElement = segmentation2D[i].getElementsByTagName("PhotoId");
        if(photoIdElement.length === 0) {
            console.log("Parse 2D segmentation : element 'PhotoId' does not exist in element 'PhotoSegmentation'");
            continue;
        }

        if(!photoIdElement[0].textContent) {
            console.log("Parse 2D segmentation : element 'PhotoId' is empty.");
            continue;
        }

        const photoId = parseInt(photoIdElement[0].textContent);
        if(isNaN(photoId)) {
            console.log("Parse 2D segmentation : element 'PhotoId' is not a number : ", photoIdElement);
            continue;
        }

        const photo = contextScene.photos.get(photoId);
        if(!photo) {
            console.log("Parse 2D segmentation : photo of id : ", photoId, " does not exist in photo collection.");
            continue;
        }
        
        const pathElement = segmentation2D[i].getElementsByTagName("Path");
        if(pathElement.length === 0) {
            console.log("'Path' does not exist in 'PhotoSegmentation' of id : ", photoId)
            continue;
        }

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
            photo.segmentation2D = { 
                id : photoId,
                path: imageStorageUrl
            };
        }
        else {
            // The segmentation path is relative to the scene. We can get the segmentation url using the scene url and adding the path in it.
            const splitUrl = docUrl.split("?sv");
            if(splitUrl.length < 2)
                return;

            const imageStorageUrl = splitUrl[0] + imagePathValue + "?sv" + splitUrl[1];
            photo.segmentation2D = { 
                id : photoId,
                path: imageStorageUrl
            };
        }
    }
}

function parseLines3D(xmlDoc: XMLDocument, contextScene: ContextScene) {
    const lines3D = xmlDoc.getElementsByTagName("Lines3D");
    if(lines3D.length === 0)
        return;

    const path = lines3D[0].getElementsByTagName("Path");
    if(path.length === 0)
        return;
    
    const pathValue = path[0].textContent;
    if(!pathValue)
        return; // No text content in reference path
        
    const linesPathParts = pathValue.split(":");
    if(linesPathParts.length === 2) {
        const referenceId = parseInt(linesPathParts[0]);
        const reference = contextScene.references.get(referenceId);
        if(reference === undefined)
            return; // Reference doesn't exist.
        
        // Add the image name in the full azure storage image collection url so it can be displayed in the frontend.
        const referenceParts = reference.collectionStorageUrl.split(reference.collectionId);
        if(referenceParts.length < 2)
            return; // The reference is supposed to be split in two parts : azure storage url and the file access.

        let access = referenceParts[1];
        if(access[0] === "/")
            access = access.substring(1);

        const imageStorageUrl = referenceParts[0] + reference.collectionId + "/" + linesPathParts[1] + access;
        contextScene.lines3D = imageStorageUrl;
    }
    else {
        // TODO : test file with absolute paths
        
    }

}

export async function parseContextScene(url: string): Promise<ContextScene> {
    const contextScene: ContextScene = {
        photos: new Map(),
        lines3D: "",
        references: new Map(),
        labels: new Map(),
    };

    const containerClient = new ContainerClient(url);
    const iter = await containerClient.listBlobsFlat();
    for await (const blob of iter) 
    {
        if(blob.name != "ContextScene.xml")
            continue;
        
        const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
        const buffer = await streamToBuffer(blobContent.readableStreamBody!);
        const xmlDoc = new DOMParser().parseFromString(buffer.toString(), "text/xml");

        await parseReferences(xmlDoc, contextScene);
        parsePhotoCollection(xmlDoc, contextScene);
        parseLabels(xmlDoc, contextScene);
        parseObjects2D(xmlDoc, contextScene);
        parseLines3D(xmlDoc, contextScene);
        parseSegmentation2D(xmlDoc, contextScene, url);
    }
    return contextScene;
}

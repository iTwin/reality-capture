/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import { ContainerClient } from "@azure/storage-blob";
import { Color, ContextScene } from "../../common/models";
import { serverRdsSample } from "./RealityApisWrapper";
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

async function parseReferences(xmlDoc: XMLDocument, contextScene: ContextScene) {
    if(!serverRdsSample)
        return;
    
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

        const azureBlobUrl = await serverRdsSample.getRealityDataUrl(pathValue);
        contextScene.references.set(parseInt(id), {collectionId: pathValue, collectionStorageUrl: azureBlobUrl});
    }
}

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
            const splitUrl = docUrl.split("?sv");
            if(splitUrl.length < 2)
                return;

            const imageStorageUrl = splitUrl[0] + imagePathValue + "?sv" + splitUrl[1];
            contextScene.photos.get(photoId)!.segmentation2D = { 
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

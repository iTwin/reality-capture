/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContainerClient } from "@azure/storage-blob";
import path from "path";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { ITwinRealityData } from "@itwin/reality-data-client";
import { IModelHost } from "@itwin/core-backend";
import { RealityDataAnalysis } from "../reality-apis-wrappers/Rdas";
import { ContextCaptureCloud } from "../reality-apis-wrappers/Cccs";
import { RealityDataClientBase, streamToBuffer } from "../reality-apis-wrappers/Rds";
import { DOMParser, XMLSerializer  } from "@xmldom/xmldom";
import { RealityDataTransfer } from "../reality-apis-wrappers/RealityDataTransfer";
import { v4 as uuidv4 } from "uuid";
import * as os from "os";


const localPathToRdId: Map<string, string> = new Map();
const realityDataIdToPath: Map<string, string> = new Map();

export let serverRdas: RealityDataAnalysis | undefined = undefined;
export let serverCCSample: ContextCaptureCloud | undefined = undefined;
export let serverRdsSample: RealityDataClientBase | undefined = undefined;

/**
 * Create a context scene in user temp file from the image collection url.
 * @param id image collection id.
 * @param collectionUrl image collection url on azure storage.
 * @returns the new scene.
 */
export async function writeTempSceneFromImageCollection(id: string, collectionUrl: string): Promise<string> {
    const fileOutput = path.join(os.tmpdir(), "Bentley/ContextCapture Internal/", uuidv4(), "ContextScene.xml");
    fs.mkdirSync(path.dirname(fileOutput), { recursive: true });
    const containerClient = new ContainerClient(collectionUrl);
    const iter = containerClient.listBlobsFlat();

    fs.appendFileSync(fileOutput, "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
    fs.appendFileSync(fileOutput, "<ContextScene version=\"3.0\">\n");
    fs.appendFileSync(fileOutput, "\t<PhotoCollection>\n");
    fs.appendFileSync(fileOutput, "\t\t<Photos>\n");
    let i = 0;
    for await (const blob of iter) 
    {
        fs.appendFileSync(fileOutput, "\t\t\t<Photo id=\"" + i + "\">\n");
        fs.appendFileSync(fileOutput, "\t\t\t\t<ImagePath>0:" + blob.name + "</ImagePath>\n");
        fs.appendFileSync(fileOutput, "\t\t\t</Photo>\n");
        i++;
    }
    fs.appendFileSync(fileOutput, "\t\t</Photos>\n");
    fs.appendFileSync(fileOutput, "\t</PhotoCollection>\n");
    fs.appendFileSync(fileOutput, "\t<References>\n");
    fs.appendFileSync(fileOutput, "\t\t<Reference id=\"0\">\n");
    fs.appendFileSync(fileOutput, "\t\t\t<Path>rds:" + id + "</Path>\n");
    fs.appendFileSync(fileOutput, "\t\t</Reference>\n");
    fs.appendFileSync(fileOutput, "\t</References>\n");
    fs.appendFileSync(fileOutput, "</ContextScene>\n");
    return fileOutput;
}

export async function getRealityDataUrl(realityDataId: string): Promise<string> {
    if(!serverRdsSample)
        return "";
    
    return await serverRdsSample.getRealityDataUrl(realityDataId);
}

export function replacePathsInScene(inPath: string, outPath: string, toPatch: Map<string, string>, isContextScene = true, doSave = true)
{
    const fileContent = fs.readFileSync(inPath, {encoding:"utf8", flag:"r"}).toString();
    const parser = new DOMParser();
    const xmlDoc: XMLDocument = parser.parseFromString(fileContent, "text/xml");

    const references = xmlDoc.getElementsByTagName(isContextScene ? "Reference" : "Photo");
    for (let i = 0; i < references.length; i++) {
        const referencePath = references[i].getElementsByTagName(isContextScene ? "Path" : "ImagePath");
        if(referencePath.length === 0)
            continue; // No path in reference

        let pathValue = referencePath[0].textContent;
        if(!pathValue)
            continue; // No text content in reference path

        const fileName = pathValue.split("/").pop();
        pathValue = pathValue.replace(/\\/g, "/");
        toPatch.forEach((value: string, key: string) => {
            if(!pathValue)
                return; // No text content in reference path

            if(pathValue.includes("../")) { // Relative path
                const relativePath = key + "/" + pathValue;
                const absolutePath = path.normalize(relativePath);
                pathValue = absolutePath.replace("/lib", "");
                pathValue = pathValue.replace(/\\/g, "/");

                // For CCOrientations, remove the file name;
                if(!isContextScene) {
                    pathValue = pathValue.substring(0, pathValue.lastIndexOf("/"));
                }
            }
            if(key === pathValue) {
                // For CCOrientations, remove "rds:";
                if(!isContextScene) {
                    referencePath[0].textContent = value.substring("rds:".length, value.length) + "/" + fileName;
                }
                else
                    referencePath[0].textContent = value;
                
                return;
            }
        });
    }

    if (doSave) {
        const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
        fs.writeFileSync(outPath, newXmlStr);
    }
}

export async function patch(scenePath: string): Promise<string> {
    // Get the scene in the folder
    let fileNames: string[] = [];
    if (fs.lstatSync(scenePath).isDirectory())
        fileNames = fs.readdirSync(scenePath);

    if(!fileNames.length)
        return scenePath; // Not a folder or does't contain any file. TODO : throw an error or return something else to handle the error.

    const fileName = path.join(scenePath, fileNames[0]);
    const fileOutput = path.join(os.tmpdir(), "Bentley/ContextCapture Internal/", uuidv4(), path.basename(fileName));
    fs.mkdir(path.dirname(fileOutput), (error) => {
        if(error)
            console.log("Can't create tmp dir.");
    });
    fs.copyFileSync(fileName, fileOutput);

    if(fileName.includes("ContextScene.xml"))
        await replacePathsInScene(fileName, fileOutput, localPathToRdId, true);

    if(fileName.includes("Orientations.xml"))
        await replacePathsInScene(fileName, fileOutput, localPathToRdId, false, true);
    
    return fileOutput;
}

export async function getCesiumRootDocument(dataPath: string) : Promise<string> {
    const subFiles = fs.readdirSync(dataPath);
    if(subFiles.includes("Scene")) {
        const sceneSubFiles = fs.readdirSync(dataPath + "/Scene");
        for(let i = 0; i < sceneSubFiles.length; i++) {
            if(sceneSubFiles[i].includes(".json")) {
                return "Scene/" + sceneSubFiles[i];
            }
        }
    }
    else {
        for(let i = 0; i < subFiles.length; i++) {
            if(subFiles[i].includes(".json")) {
                return subFiles[i];
            }
        }
    }
    return "";
}

export async function getOPCRootDocument(dataPath: string) : Promise<string> {
    const subFiles = fs.readdirSync(dataPath);
    for(let i = 0; i < subFiles.length; i++) {
        if(subFiles[i].includes(".opc")) {
            return subFiles[i];
        }
    }
    return "";
}

export async function runRDAS(inputs: string[][], outputTypes: string[], jobType: string): Promise<string[]> {
    if(!serverRdas)
        return [];
    
    const inputsMap: Map<string, string> = new Map();
    for(let i = 0; i < inputs.length; i++) {
        inputsMap.set(inputs[i][0], inputs[i][1]);
    }

    let numberOfPhotos = 0;
    inputsMap.forEach(async (value: string, key: string) => {
        if(key === "photos" || key === "orientedPhotos") {
            numberOfPhotos = await getNumberOfPhotos(value); 
        }
    });

    const createdItemIds = await serverRdas.runJobRDAS(false, inputsMap, outputTypes, jobType, numberOfPhotos);
    return createdItemIds;
}

export async function getRealityData(realityDataId: string) : Promise<ITwinRealityData | undefined> {
    if(!serverRdsSample)
        return;
    
    return serverRdsSample.getRealityData(realityDataId);
}

export async function initRdas(accessTokenString: string): Promise<void>
{
    if(serverRdas)
    {
        serverRdas.accessToken = accessTokenString;
        return;
    }
    serverRdas = new RealityDataAnalysis(accessTokenString);
}

export async function initCCS(accessTokenString: string): Promise<void>
{
    if(serverCCSample)
    {
        serverCCSample.accessToken = accessTokenString;
        return;
    }
    serverCCSample = new ContextCaptureCloud(accessTokenString);
}

export async function initRds(accessTokenString: string): Promise<void>
{
    if(serverRdsSample)
    {
        serverRdsSample.accessToken = accessTokenString;
        return;
    }
    serverRdsSample = new RealityDataClientBase(accessTokenString);
}

export async function setAccessToken(accessToken: string) {
    await IModelHost.startup();
    dotenv.config();
    await initRds(accessToken);
    await initRdas(accessToken);
    await initCCS(accessToken);
}

export async function getProgress(): Promise<string[]> {
    if(!serverRdas)
        return [];
    
    const progress = await serverRdas.monitorJobRDASBrowser();
    return progress;
}

export async function getProgressCCS(): Promise<string[]> {
    if(!serverCCSample)
        return [];
    
    const progress = await serverCCSample.monitorJobCCSBrowser();
    return progress;
}

export async function cancelJobRDAS(): Promise<void> {
    if(!serverRdas)
        return;
    
    await serverRdas.cancelJobRDAS();
}

export async function cancelJobCCS(): Promise<void> {
    if(!serverCCSample)
        return;
    
    await serverCCSample.cancelJobCCS();
}

export async function runCCS(inputs: string[][], jobType: string): Promise<string[]> {
    if(!serverCCSample)
        return [];
    
    const inputsMap: Map<string, string> = new Map();
    for(let i = 0; i < inputs.length; i++) {
        inputsMap.set(inputs[i][0], inputs[i][1]);
    }
    const createdItemIds = await serverCCSample.runReconstructionJobCCS(false, jobType === "Full" ? true : false, inputsMap);
    return createdItemIds;
}

export async function download(id: string, targetPath: string): Promise<void> {
    if(!serverRdsSample)
        return;
    
    const containsContextScene = await RealityDataTransfer.Instance.downloadRealityData(id, serverRdsSample, targetPath);
    realityDataIdToPath.set("rds:" + id, targetPath);

    if(containsContextScene)
    {
        const fullPath = targetPath + (targetPath[targetPath.length - 1] === "/" || targetPath[targetPath.length - 1] === "\\" ? "" : "/") + "ContextScene.xml";
        replacePathsInScene(fullPath, fullPath, realityDataIdToPath);
    }
}

export async function getNumberOfPhotos(contextScene: string): Promise<number> {
    if(!serverRdsSample)
        return -1;
    
    const url = await serverRdsSample.getRealityDataUrl(contextScene);
    const containerClient = new ContainerClient(url);
    const iter = await containerClient.listBlobsFlat();
    for await (const blob of iter) 
    {
        if(blob.name != "ContextScene.xml")
            continue;
        
        const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
        const buffer = await streamToBuffer(blobContent.readableStreamBody!);
        const xmlDoc = new DOMParser().parseFromString(buffer.toString(), "text/xml");
        const images = xmlDoc.getElementsByTagName("ImagePath");
        return images.length;
    }
    return 0;
}

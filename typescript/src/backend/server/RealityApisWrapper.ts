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
import { DOMParser } from "@xmldom/xmldom";
import { v4 as uuidv4 } from "uuid";
import * as os from "os";

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

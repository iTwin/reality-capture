/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { RealityDataAnalysisService } from "../rdas/RealityDataAnalysisService";
import { RealityDataTransfer } from "../utils/RealityDataTransfer";
import { ReferenceTable } from "../utils/ReferenceTable";
import path = require("path");
import * as fs from "fs";
import { ClientInfo, JobState, RealityDataType } from "../CommonData";
import { O2DJobSettings } from "../rdas/Settings";
import * as dotenv from "dotenv";
import { ServiceTokenFactory } from "../TokenFactory";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runObjects2DExample() {
    const ccImageCollection = "D:\\O2D-Motos\\images";
    const photoContextScene = "D:\\O2D-Motos\\Scene";
    const photoObjectDetector = "D:\\O2D-Motos\\Coco2017_v1.19";
    const outputPath = "D:\\output";

    dotenv.config();

    const jobName = "O2D job new SDK sample";
    const ccImageCollectionName = "Test Moto Photos";
    const contextSceneName = "Test Moto Scene";
    const detectorName = "O2D photos in RAS-QA";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";

    console.log("Reality Data Analysis sample job detecting 2D objects");
    const clientInfoRd: ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataTransfer.getScopes()]), 
        secret: secret, env: "qa-"};
    const clientInfoRda: ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataAnalysisService.getScopes()]), 
        secret: secret, env: "dev-"};
    const tokenFactoryRd = new ServiceTokenFactory(clientInfoRd);
    const tokenFactoryRda = new ServiceTokenFactory(clientInfoRda);
    await tokenFactoryRd.getToken();
    await tokenFactoryRda.getToken();
    if(!tokenFactoryRd.isOk() || !tokenFactoryRda.isOk())
        console.log("Can't get the access token");
    
    const realityDataService = new RealityDataTransfer(tokenFactoryRd);
    const realityDataAnalysisService = new RealityDataAnalysisService(tokenFactoryRda);
    console.log("Service initialized");

    // Creating reference table and uploading ccimageCollection, contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTable();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload CCImageCollection
    if(!references.hasLocalPath(ccImageCollection)) {
        console.log("No reference to CCimage Collections found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(ccImageCollection, ccImageCollectionName, 
            RealityDataType.CC_IMAGE_COLLECTION, projectId);
        references.addReference(ccImageCollection, id);
    }

    // Upload ContextScene
    if(!references.hasLocalPath(photoContextScene)) {
        console.log("No reference to ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(photoContextScene, contextSceneName, projectId, references);
        references.addReference(photoContextScene, id);
    }

    // Upload Detector
    if(!references.hasLocalPath(photoObjectDetector)) {
        console.log("No reference to detector found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(photoObjectDetector, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            projectId);
        references.addReference(photoObjectDetector, id);
    }

    await references.save(referencesPath);
    console.log("Checked data upload");

    const settings = new O2DJobSettings();
    settings.inputs.photos = references.getCloudIdFromLocalPath(photoContextScene);
    settings.inputs.photoObjectDetector = references.getCloudIdFromLocalPath(photoObjectDetector);
    settings.outputs.objects2D = "objects2D";
    console.log("Settings created");

    const jobId = await realityDataAnalysisService.createJob(settings, jobName, projectId);
    console.log("Job created");

    await realityDataAnalysisService.submitJob(jobId);
    console.log("Job submitted");

    while(true) {
        const progress = await realityDataAnalysisService.getJobProgress(jobId);
        if(progress.state === JobState.SUCCESS) {
            break;
        }
        else if(progress.state === JobState.ACTIVE) {
            console.log("Progress: " + progress.progress + ", step: " + progress.step);
        }
        else if(progress.state === JobState.CANCELLED) {
            console.log("Job cancelled");
            return;
        }
        else if(progress.state === JobState.FAILED) {
            console.log("Job failed");
            console.log("Progress: " + progress.progress + ", step: " + progress.step);
            return;
        }
        await sleep(6000);
    }
    console.log("Job done");

    console.log("Retrieving outputs ids");
    const finalSettings = await realityDataAnalysisService.getJobSettings(jobId);
    console.log("Downloading outputs");
    const objects2DId = (finalSettings as O2DJobSettings).outputs.objects2D;
    realityDataService.downloadContextScene(objects2DId, outputPath, references);
    console.log("Successfully downloaded output");
}

runObjects2DExample();
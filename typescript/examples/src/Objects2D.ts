/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CommonData, RDASettings, RealityDataAnalysisService } from "reality-capture";
import { RealityDataTransferNode, ReferenceTableNode } from "reality-capture-node";
import path = require("path");
import * as fs from "fs";
import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runObjects2DExample() {
    const imageCollection = "D:\\Photo_Object-Face_and_License_Plates\\images";
    const photoContextScene = "D:\\Photo_Object-Face_and_License_Plates\\ContextScene";
    const photoObjectDetector = "D:\\Photo_Object-Face_and_License_Plates\\Face_&_License_plates_1";
    const outputPath = "D:\\output";

    dotenv.config();

    const jobName = "O2D job new SDK sample";
    const imageCollectionName = "Test Moto Photos";
    const contextSceneName = "Test Moto Scene";
    const detectorName = "O2D photos in RDAS-QA";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const authority = process.env.IMJS_ISSUER_URL ?? "";

    console.log("Reality Data Analysis sample job detecting 2D objects");
    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        clientSecret: secret,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityDataAnalysisService.getScopes()).join(" "),
        authority: authority,
    });
    const realityDataService = new RealityDataTransferNode(authorizationClient);
    const realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient);
    console.log("Service initialized");

    // Creating reference table and uploading ccimageCollection, contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTableNode();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload CCImageCollection
    if(!references.hasLocalPath(imageCollection)) {
        console.log("No reference to CCimage Collections found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(imageCollection, imageCollectionName, 
            CommonData.RealityDataType.CC_IMAGE_COLLECTION, projectId);
        references.addReference(imageCollection, id);
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
        const id = await realityDataService.uploadRealityData(photoObjectDetector, detectorName, CommonData.RealityDataType.CONTEXT_DETECTOR, 
            projectId);
        references.addReference(photoObjectDetector, id);
    }

    await references.save(referencesPath);
    console.log("Checked data upload");

    const settings = new RDASettings.O2DJobSettings();
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
        if(progress.state === CommonData.JobState.SUCCESS) {
            break;
        }
        else if(progress.state === CommonData.JobState.ACTIVE) {
            console.log("Progress: " + progress.progress + ", step: " + progress.step);
        }
        else if(progress.state === CommonData.JobState.CANCELLED) {
            console.log("Job cancelled");
            return;
        }
        else if(progress.state === CommonData.JobState.FAILED) {
            console.log("Job failed");
            console.log("Progress: " + progress.progress + ", step: " + progress.step);
            return;
        }
        await sleep(6000);
    }
    console.log("Job done");

    console.log("Retrieving outputs ids");
    const properties = await realityDataAnalysisService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const objects2DId = (properties.settings as RDASettings.O2DJobSettings).outputs.objects2D;
    realityDataService.downloadContextScene(objects2DId, outputPath, projectId, references);
    console.log("Successfully downloaded output");
}

runObjects2DExample();
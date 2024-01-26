/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { O2DJobSettings, RealityDataAnalysisService } from "@itwin/reality-capture-analysis";
import { RealityDataTransferNode, ReferenceTableNode } from "@itwin/reality-data-transfer-node";
import path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runObjects2DExample() {
    const imageCollection = "path to your image collection";
    const photoContextScene = "path to the folder where your context scene file is";
    const photoObjectDetector = "path to the folder where your detector is";
    const outputPath = "path to the folder where you want to save outputs";

    dotenv.config();

    const jobName = "O2D job new SDK sample";
    const imageCollectionName = "Test Moto Photos";
    const contextSceneName = "Test Moto Scene";
    const detectorName = "Test O2D Photo Detector";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_REDIRECT_URL ?? "";
    const env = process.env.IMJS_ENV ?? "";
    const issuerUrl = env === "prod" ? "https://ims.bentley.com" : "https://qa-ims.bentley.com";

    console.log("Reality Analysis sample job detecting 2D objects");
    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityDataAnalysisService.getScopes()).join(" "),
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();
    
    let realityDataService: RealityDataTransferNode;
    if(env === "prod")
        realityDataService = new RealityDataTransferNode(authorizationClient);
    else
        realityDataService = new RealityDataTransferNode(authorizationClient, "qa-");

    let realityDataAnalysisService;
    if(env === "prod")
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient);
    else if(env === "qa")
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient, "qa-");
    else
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient, "dev-");
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
            RealityDataType.CC_IMAGE_COLLECTION, projectId);
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

    let jobInProgress = true;
    while(jobInProgress) {
        const progress = await realityDataAnalysisService.getJobProgress(jobId);
        if(progress.state === JobState.SUCCESS) {
            jobInProgress = false;
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
    const properties = await realityDataAnalysisService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const objects2DId = (properties.settings as O2DJobSettings).outputs.objects2D;
    realityDataService.downloadContextScene(objects2DId, outputPath, projectId, references);
    console.log("Successfully downloaded output");
}

runObjects2DExample();
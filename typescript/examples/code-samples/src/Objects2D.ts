/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { O2DJobSettings, RealityDataAnalysisService } from "@itwin/reality-capture-analysis";
import path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { RealityDataTransferNode, ReferenceTableNode, defaultProgressHook } from "@itwin/reality-data-transfer";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runObjects2DExample() {
    /**
     * This example submits an objects2d analysis job, and downloads an annotations context scene
     */
    const imageCollection = "path to your images";
    const photoContextScene = "path to the folder where your context scene file is referenced";
    const photoObjectDetector = "path to the folder where your detector is";
    const outputPath = "path to the folder where you want to save the annotatations context scene";

    dotenv.config();

    const jobName = "O2D job new SDK sample";
    const imageCollectionName = "Test Moto Photos";
    const contextSceneName = "Test Moto Scene";
    const detectorName = "Test O2D Photo Detector";

    const iTwinId = process.env.IMJS_PROJECT_ID ?? "";
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
        realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    else
        realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");

    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);

    let realityDataAnalysisService;
    if(env === "prod")
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient));
    else if(env === "qa")
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");
    else
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient), "dev-");
    console.log("Service initialized");

    // Creating reference table and uploading images, contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTableNode();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload images
    if(!references.hasLocalPath(imageCollection)) {
        console.log("No reference to images found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(imageCollection, imageCollectionName, 
            RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        references.addReference(imageCollection, id);
    }

    // Upload ContextScene
    if(!references.hasLocalPath(photoContextScene)) {
        console.log("No reference to ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(photoContextScene, contextSceneName, iTwinId, references);
        references.addReference(photoContextScene, id);
    }

    // Upload Detector
    if(!references.hasLocalPath(photoObjectDetector)) {
        console.log("No reference to detector found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(photoObjectDetector, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            iTwinId);
        references.addReference(photoObjectDetector, id);
    }

    await references.save(referencesPath);
    console.log("Checked data upload");

    const settings = new O2DJobSettings();
    settings.inputs.photos = references.getCloudIdFromLocalPath(photoContextScene);
    settings.inputs.photoObjectDetector = references.getCloudIdFromLocalPath(photoObjectDetector);
    settings.outputs.objects2D = "objects2D";
    console.log("Settings created");

    const jobId = await realityDataAnalysisService.createJob(settings, jobName, iTwinId);
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
    realityDataService.downloadContextScene(objects2DId, outputPath, iTwinId, references);
    console.log("Successfully downloaded output");
}

runObjects2DExample();
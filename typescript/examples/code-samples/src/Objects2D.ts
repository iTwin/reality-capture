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
     * This example show how to submit an objects2d analysis job and how to download the result
     */

    // Inputs to provide

    // Required : path to the image folder
    const imageCollectionPath = "";
    // Required : path to the context scene folder
    const photoContextScenePath = "";
    // Required : path to the detector folder
    const photoObjectDetectorPath = "";
    // Required : path to the folder where the results will be downloaded
    const outputPath = "";

    // Name of the analysis job
    const jobName = "O2D_Job_Sample";
    // Name of the images in the cloud
    const imageCollectionName = "Sample_Images";
    // Name of the context scene in the cloud
    const contextSceneName = "Sample_Context_Scene";
    // Name of the detector in the cloud
    const detectorName = "Sample_O2D_Photo_Detector";

    // Script
    dotenv.config()

    const iTwinId = process.env.IMJS_SAMPLE_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_SAMPLE_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_SAMPLE_REDIRECT_URL ?? "";
    const issuerUrl = "https://ims.bentley.com";
    if(!iTwinId || !clientId || !redirectUrl) {
        console.log(".env file is not configured properly");
    }

    console.log("Reality Analysis sample job detecting 2D objects");
    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataAnalysisService.getScopes()).join(" "),
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();
    
    let realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);

    let realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient));
    console.log("Service initialized");

    // Creating reference table and uploading images, contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTableNode();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload images
    if(!references.hasLocalPath(imageCollectionPath)) {
        console.log("Uploading images...");
        const id = await realityDataService.uploadRealityData(imageCollectionPath, imageCollectionName, 
            RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        references.addReference(imageCollectionPath, id);
        console.log("Images uploaded successfully");
    }

    // Upload context scene
    if(!references.hasLocalPath(photoContextScenePath)) {
        console.log("Uploading context scene...");
        const id = await realityDataService.uploadContextScene(photoContextScenePath, contextSceneName, iTwinId, references);
        references.addReference(photoContextScenePath, id);
        console.log("Context scene uploaded successfully");
    }

    // Upload detector
    if(!references.hasLocalPath(photoObjectDetectorPath)) {
        console.log("Uploading detector...");
        const id = await realityDataService.uploadRealityData(photoObjectDetectorPath, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            iTwinId);
        references.addReference(photoObjectDetectorPath, id);
        console.log("Detector uploaded successfully");
    }

    await references.save(referencesPath);

    // Create and submit job
    const settings = new O2DJobSettings();
    settings.inputs.photos = references.getCloudIdFromLocalPath(photoContextScenePath);
    settings.inputs.photoObjectDetector = references.getCloudIdFromLocalPath(photoObjectDetectorPath);
    settings.outputs.objects2D = "objects2D";
    console.log("Settings created");

    const jobId = await realityDataAnalysisService.createJob(settings, jobName, iTwinId);
    console.log("Job created");

    await realityDataAnalysisService.submitJob(jobId);
    console.log("Job submitted");

    // Monitor job
    let jobInProgress = true;
    while(jobInProgress) {
        try {
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
        }
        catch(error: any) {
            console.error("Job progress error :  ", error.message || error);
        }
        await sleep(6000);
    }
    console.log("Job done");

    // Download results
    console.log("Retrieving outputs ids");
    const properties = await realityDataAnalysisService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const objects2DId = (properties.settings as O2DJobSettings).outputs.objects2D;
    await realityDataService.downloadContextScene(objects2DId, outputPath, iTwinId, references);
    console.log("Successfully downloaded output");
}

runObjects2DExample();
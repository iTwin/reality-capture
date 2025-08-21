/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path from "path";
import { S2DJobSettings, RealityDataAnalysisService } from "@itwin/reality-capture-analysis";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { RealityDataTransferNode, ReferenceTableNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runSegmentation2DExample() {
    /**
     * This example show how to submit a segmentation2d analysis job and how to download the results
     */

    // Inputs to provide

    // Required : path to the image folder
    const imagesPath = "";
    // Required : path to the context scene folder where the images are referenced
    const photosContextScenePath  = "";
    // Required : path to the detector folder
    const photoSegmentationDetectorPath = "";
    // Required : path to the mesh folder
    const meshPath = "";
    // Required : path to the context scene folder where the meshes are referenced
    const meshContextScenePath = "";
    // Required : path to the folder where the results will be downloaded
    const outputPath = "";

    // Name of the analysis job
    const jobName = "S2D job SDK sample";
    // Name of the images in the cloud
    const imagesName = "Sample_S2D_Images";
    // Name of the images context scene in the cloud
    const photosSceneName = "Sample_S2D_Oriented_Scene";
    // Name of the mesh in the cloud
    const meshName = "Sample_S2D_Mesh";
    // Name of the mesh context scene in the cloud
    const meshSceneName = "Sample_S2D_Mesh_Scene";
    // Name of the detector in the cloud
    const detectorName = "Sample_S2D_Detector";

    // Script
    dotenv.config();

    const iTwinId = process.env.IMJS_SAMPLE_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_SAMPLE_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_SAMPLE_REDIRECT_URL ?? "";
    const issuerUrl = "https://ims.bentley.com";
    if(!iTwinId || !clientId || !redirectUrl) {
        console.log(".env file is not configured properly");
    }

    console.log("Reality Analysis sample job producing 2D segmentation and 3D lines");
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

    // Creating reference table and uploading ccimageCollection, oriented photos, mesh, mesh contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTableNode();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload images
    if(!references.hasLocalPath(imagesPath)) {
        console.log("Uploading images...");
        const id = await realityDataService.uploadRealityData(imagesPath, imagesName, RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        references.addReference(imagesPath, id);
        console.log("Images uploaded successfully");
    }

    // Upload oriented context scene
    if(!references.hasLocalPath(photosContextScenePath)) {
        console.log("Uploading context scene...");
        const id = await realityDataService.uploadContextScene(photosContextScenePath, photosSceneName, iTwinId, references);
        references.addReference(photosContextScenePath, id);
        console.log("Context scene uploaded successfully");
    }

    // Upload detector
    if(!references.hasLocalPath(photoSegmentationDetectorPath)) {
        console.log("Uploading detector...");
        const id = await realityDataService.uploadRealityData(photoSegmentationDetectorPath, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            iTwinId);
        references.addReference(photoSegmentationDetectorPath, id);
        console.log("Detector uploaded successfully");
    }

    // Upload mesh
    if(!references.hasLocalPath(meshPath)) {
        console.log("Uploading mesh...");
        const id = await realityDataService.uploadRealityData(meshPath, meshName, RealityDataType.THREEMX, iTwinId);
        references.addReference(meshPath, id);
        console.log("Mesh uploaded successfully");
    }

    // Upload mesh context scene
    if(!references.hasLocalPath(meshContextScenePath)) {
        console.log("Uploading mesh context scene...");
        const id = await realityDataService.uploadContextScene(meshContextScenePath, meshSceneName, iTwinId, references);
        references.addReference(meshContextScenePath, id);
        console.log("Mesh context scene uploaded successfully");
    }

    await references.save(referencesPath);

    // Create and submit job
    const settings = new S2DJobSettings();
    settings.inputs.photos = references.getCloudIdFromLocalPath(photosContextScenePath);
    settings.inputs.photoSegmentationDetector = references.getCloudIdFromLocalPath(photoSegmentationDetectorPath);
    settings.inputs.meshes = references.getCloudIdFromLocalPath(meshContextScenePath);
    settings.outputs.lines3D = "lines3D";
    settings.outputs.segmentation2D = "segmentation2D";
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
    const lines3dId = (properties.settings as S2DJobSettings).outputs.lines3D;
    await realityDataService.downloadContextScene(lines3dId, outputPath, iTwinId, references);
    console.log("Successfully downloaded output");
}

runSegmentation2DExample();
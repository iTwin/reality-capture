/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path from "path";
import { CCJobQuality, CCJobSettings, CCJobType, ContextCaptureService } from "@itwin/reality-capture-modeling";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { RealityDataTransferNode, ReferenceTableNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runModelingExample() {
    /**
     * This example show how to submit a Full Modeling job (Calibration + Reconstruction), and how to download the results.
     */

    // Inputs to provide

    // Required : path of the image folder
    const imagesPath = "";
    // Required : path to the ccorientation folder
    const orientationsPath = "";
    // Required : path to the folder where the results will be downloaded
    const outputPath = "";
    // Optional : path to the production setting file. See https://developer.bentley.com/apis/contextcapture/cc-production-settings/ to create a production setting file
    const prodSettingsPath = "";

    // Name of the modeling job
    const jobName = "Modeling_Sample_Job";
    // Name of the workspace
    const workspaceName = "Modeling_Sample_Workspace";
    // Name of the images in the cloud
    const imagesName = "Modeling_Sample_Images";
    // name of the orientations file in the cloud
    const orientationsName = "Modeling_Sample_Orientations";

    // Script
    dotenv.config();

    const iTwinId = process.env.IMJS_SAMPLE_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_SAMPLE_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_SAMPLE_REDIRECT_URL ?? "";
    const issuerUrl = "https://ims.bentley.com";
    if (!iTwinId || !clientId || !redirectUrl) {
        console.log(".env file is not configured properly");
    }

    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(ContextCaptureService.getScopes()).join(" "),
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();

    console.log("Reality Modeling sample job - Full (Calibration + Reconstruction)");
    let realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);

    let contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient));
    console.log("Service initialized");

    // Creating reference table and uploading images, ccOrientations if necessary (not yet on the cloud)
    const references = new ReferenceTableNode();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if (fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload images
    if (!references.hasLocalPath(imagesPath)) {
        console.log("Uploading images...");
        const id = await realityDataService.uploadRealityData(imagesPath, imagesName,
            RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        references.addReference(imagesPath, id);
        console.log("Images uploaded successfully");
    }

    // Upload orientations file
    if (!references.hasLocalPath(orientationsPath)) {
        console.log("Upoading orientations");
        const id = await realityDataService.uploadCCOrientations(orientationsPath, orientationsName, iTwinId, references);
        references.addReference(orientationsPath, id);
        console.log("Orientations uploaded successfully");
    }

    await references.save(referencesPath);

    // Create workspace
    const workspaceId = await contextCaptureService.createWorkspace(workspaceName, iTwinId);

    // Create job
    const settings = new CCJobSettings();
    settings.inputs = [references.getCloudIdFromLocalPath(imagesPath), references.getCloudIdFromLocalPath(orientationsPath)];
    settings.outputs.las = "LAS";
    settings.meshQuality = CCJobQuality.DRAFT;
    console.log("Settings created");

    const jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, jobName, workspaceId);
    console.log("Job created");

    // Then, upload production settings in the workspace
    if(prodSettingsPath) {
        console.log("Uploading production settings in workspace...")
        await realityDataService.uploadJsonToWorkspace(prodSettingsPath, iTwinId, workspaceId, jobId);
        console.log("Production settings uploaded successfully")
    }

    // Submit job
    await contextCaptureService.submitJob(jobId);
    console.log("Job submitted");

    // Monitor job
    let jobInProgress = true;
    while (jobInProgress) {
        try {
            const progress = await contextCaptureService.getJobProgress(jobId);
            if (progress.state === JobState.SUCCESS || progress.state === JobState.OVER) {
                jobInProgress = false;
                break;
            }
            else if (progress.state === JobState.ACTIVE) {
                console.log("Progress: " + progress.progress + ", step: " + progress.step);
            }
            else if (progress.state === JobState.CANCELLED) {
                console.log("Job cancelled");
                return;
            }
            else if (progress.state === JobState.FAILED) {
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
    const properties = await contextCaptureService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const lasId = (properties.settings as CCJobSettings).outputs.las;
    await realityDataService.downloadRealityData(lasId, outputPath, iTwinId);
    console.log("Successfully downloaded output");
}

runModelingExample();
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
     * This example submits a Full Modeling job (Calibration + Reconstruction), and will download the reconstruction output as a 3mx file.
     */
    const images = "path to your image folder";
    const ccOrientations = "path to the folder where your ccorientation file is";
    const outputPath = "path to the folder where you want to save outputs";

    dotenv.config();

    const jobName = "Reality Modeling job SDK sample";
    const workspaceName = "Reality Modeling test workspace";
    const imagesName = "Reality Modeling test photos";
    const ccOrientationsName = "Reality Modeling test ccorientations";

    const iTwindId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_REDIRECT_URL ?? "";
    const env = process.env.IMJS_ENV ?? "";
    const issuerUrl = env === "prod" ? "https://ims.bentley.com" : "https://qa-ims.bentley.com";

    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(ContextCaptureService.getScopes()).join(" "),
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();

    console.log("Reality Modeling sample job - Full (Calibration + Reconstruction)");
    let realityDataService: RealityDataTransferNode;
    if(env === "prod")
        realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    else
        realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");
    
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);

    let contextCaptureService;
    if(env === "prod")
        contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient));
    else if(env === "qa")
        contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");
    else
        contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient), "dev-");

    console.log("Service initialized");

    try {
        // Creating reference table and uploading images, ccOrientations if necessary (not yet on the cloud)
        const references = new ReferenceTableNode();
        const referencesPath = path.join(outputPath, "test_references_typescript.txt");
        if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
            console.log("Loading preexistent references");
            await references.load(referencesPath);
        }

        // Upload images
        if(!references.hasLocalPath(images)) {
            console.log("No reference to images found, uploading local files to cloud");
            const id = await realityDataService.uploadRealityData(images, imagesName, 
                RealityDataType.CC_IMAGE_COLLECTION, iTwindId);
            references.addReference(images, id);
        }

        // Upload ccOrientations
        if(!references.hasLocalPath(ccOrientations)) {
            console.log("No reference to cc orientations found, uploading local files to cloud");
            const id = await realityDataService.uploadCCOrientations(ccOrientations, ccOrientationsName, iTwindId, references);
            references.addReference(ccOrientations, id);
        }

        await references.save(referencesPath);
        console.log("Checked data upload");

        // Create workspace
        const workspaceId = await contextCaptureService.createWorkspace(workspaceName, iTwindId);

        const settings = new CCJobSettings();
        settings.inputs = [references.getCloudIdFromLocalPath(images), references.getCloudIdFromLocalPath(ccOrientations)];
        settings.outputs.threeMX = "threeMX";
        settings.meshQuality = CCJobQuality.DRAFT;
        console.log("Settings created");

        const jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, jobName, workspaceId);
        console.log("Job created");

        await contextCaptureService.submitJob(jobId);
        console.log("Job submitted");

        let jobInProgress = true;
        while(jobInProgress) {
            const progress = await contextCaptureService.getJobProgress(jobId);
            if(progress.state === JobState.SUCCESS || progress.state === JobState.OVER) {
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
        const properties = await contextCaptureService.getJobProperties(jobId);
        console.log("Downloading outputs");
        const threeMXId = (properties.settings as CCJobSettings).outputs.threeMX;
        realityDataService.downloadRealityData(threeMXId, outputPath, iTwindId);
        console.log("Successfully downloaded output");
    }
    catch(error: any) {
        console.log(error);
    }
}

runModelingExample();
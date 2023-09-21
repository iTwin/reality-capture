/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path from "path";
import { CCJobQuality, CCJobSettings, CCJobType, ContextCaptureService } from "@itwin/reality-capture-modeling";
import { RealityDataTransferNode, ReferenceTableNode } from "@itwin/reality-data-transfer-node";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { defaultProgressHook } from "@itwin/reality-data-transfer";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
    const ccImageCollection = "path to your image folder";
    const ccOrientations = "path to the folder where your ccorientation file is";
    const outputPath = "path to the folder where you want to save outputs";

    dotenv.config();

    const jobName = "Reality Modeling job SDK sample";
    const workspaceName = "Reality Modeling test workspace";
    const ccImageCollectionName = "Reality Modeling test photos";
    const ccOrientationsName = "Reality Modeling test ccorientations";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const authority = process.env.IMJS_ISSUER_URL ?? "";

    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        clientSecret: secret,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(ContextCaptureService.getScopes()).join(" "),
        authority: authority,
    });
    console.log("Reality Modeling sample job - Full (Calibration + Reconstruction)");
    const realityDataService = new RealityDataTransferNode(authorizationClient);
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    const contextCaptureService = new ContextCaptureService(authorizationClient);
    console.log("Service initialized");

    try {
        // Creating reference table and uploading ccimageCollection, ccOrientations if necessary (not yet on the cloud)
        const references = new ReferenceTableNode();
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

        // Upload Oriented photos (ccOrientations)
        if(!references.hasLocalPath(ccOrientations)) {
            console.log("No reference to cc orientations found, uploading local files to cloud");
            const id = await realityDataService.uploadCCOrientations(ccOrientations, ccOrientationsName, projectId, references);
            references.addReference(ccOrientations, id);
        }

        await references.save(referencesPath);
        console.log("Checked data upload");

        // Create workspace
        const workspaceId = await contextCaptureService.createWorkspace(workspaceName, projectId);

        const settings = new CCJobSettings();
        settings.inputs = [references.getCloudIdFromLocalPath(ccImageCollection), references.getCloudIdFromLocalPath(ccOrientations)];
        settings.outputs.threeMX = "threeMX";
        settings.meshQuality = CCJobQuality.MEDIUM;

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
        realityDataService.downloadRealityData(threeMXId, outputPath, projectId);
        console.log("Successfully downloaded output");
    }
    catch(error: any) {
        console.log(error);
    }
}

main();
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RealityCaptureService } from "../../reality_capture/src/service/service";
import { ReconstructionSpecificationsCreate, ReconstructionInputs, ReconstructionOutputsCreate } from "../../reality_capture/src/specifications/reconstruction";
import { ExportCreate, Format } from "../../reality_capture/src/specifications/production";
import { JobCreate, JobType, JobState, Progress, getAppropriateService } from "../../reality_capture/src/service/job";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runModelingExample() {
    /**
     * This example dhow how to submit a Reconstruction job
     */
    const orientedScene = "5db15f5c-41d5-4352-b905-87c8a2f1faa3";
    const outputPath = "path to the folder where you want to save outputs";

    dotenv.config();

    const jobName = "Reality Modeling job SDK sample";
    const contextSceneName = "Reality Modeling SDK sample context scene"

    const iTwindId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_REDIRECT_URL ?? "";
    const secret = process.env.IMJS_CLIENT_SECRET ?? "";
    const issuerUrl = "https://qa-ims.bentley.com";

    /*const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: "itwin-platform",
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();*/

    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        scope: "itwin-platform",
        clientSecret: secret,
        authority: issuerUrl,
    });

    const tokenFactory = {
        get_token: async () => {
            // realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
            return await authorizationClient.getAccessToken()
        }
    };
    const realityCaptureService = new RealityCaptureService(tokenFactory, {env: "dev"});
    console.log("Reality Capture service initialized");

    try {
        // TODO : upload data
        // Upload images
        /*console.log("No reference to images found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(images, imagesName, RealityDataType.CC_IMAGE_COLLECTION, iTwindId);

        // Upload ccOrientations
        console.log("No reference to cc orientations found, uploading local files to cloud");
        const id = await realityDataService.uploadCCOrientations(ccOrientations, ccOrientationsName, iTwindId, references);

        console.log("Checked data upload");*/

        let reconsInputs: ReconstructionInputs = { scene: orientedScene };
        let exp: ExportCreate = { format: Format.THREED_TILES }
        let reconsOutputs: ReconstructionOutputsCreate = { exports: [exp] };
        let reconsSpecs: ReconstructionSpecificationsCreate = { inputs: reconsInputs, outputs: reconsOutputs };

        let jobToSubmit: JobCreate = { name: jobName, specifications: reconsSpecs, type: JobType.RECONSTRUCTION, iTwinId: iTwindId };
        const response = await realityCaptureService.submitJob(jobToSubmit);
        if (response.isError()) {
            console.log("Failed to submit job : " + response.error!.error.message);
            return;
        }
        const jobid = response.value!.id;
        console.log("Job submitted");

        let progress: Progress = { state: JobState.QUEUED, percentage: 0 };
        while (progress.state !== JobState.CANCELLED && progress.state !== JobState.FAILED && progress.state !== JobState.SUCCESS) {
            const response = await realityCaptureService.getJobProgress(jobid, getAppropriateService(JobType.RECONSTRUCTION));
            if (response.isError()) {
                console.log("Can't get job progress");
            }
            progress = response.value!;
            console.log("progress : ", progress.percentage);
            await sleep(10000);
            if(progress.state === JobState.CANCELLED || progress.state === JobState.FAILED ) {
                console.log("Job not completed");
            }
            else if(progress.state === JobState.SUCCESS) {
                console.log("Job completed");
            }
        }

        // TODO : download job
        /*console.log("Retrieving outputs ids");
        const properties = await contextCaptureService.getJobProperties(jobId);
        console.log("Downloading outputs");
        const threeMXId = (properties.settings as CCJobSettings).outputs.threeMX;
        realityDataService.downloadRealityData(threeMXId, outputPath, iTwindId);
        console.log("Successfully downloaded output");*/
    }
    catch(error: any) {
        console.log(error);
    }
}

runModelingExample();
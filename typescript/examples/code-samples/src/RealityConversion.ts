/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { RCJobSettings, RealityConversionService } from "@itwin/reality-capture-conversion";
import * as dotenv from "dotenv";
import { RealityDataTransferNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runConversionExample() {
    /**
     * This example show how to convert a las file to 3DTiles format and how to download the 3DTiles locally.
     * Requires a service iTwin application and a environment file to define IMJS_SAMPLE_PROJECT_ID, IMJS_SAMPLE_CLIENT_ID and IMJS_SAMPLE_CLIENT_SECRET
     */

    // Inputs to provide. Please, adapt values

    // Required : path to the las to convert
    const lasPath = "D:/Datasets/Heli/LAS";
    // Required : path to the folder where the 3DTiles will be downloaded
    const outputPath = "D:/Datasets/Heli/3DTiles";

    // Optional : LAS srs. Please, provide an empty string if don't want to specify inputSrs
    const inputSrs: string = "EPSG:32631";
    // Optional : 3DTiles srs. Please, provide an empty string if don't want to specify outputSrs
    const outputSrs: string = "EPSG:4978";

    // Name for the uploaded data in the cloud
    const lasName = "Sample_LAS_Input";
    // Name for the Conversion job
    const jobName = "Sample_LAS_To_3DTiles_Sample";

    // Script
    console.log("Reality Conversion sample job to convert LAS in 3DTiles");
    dotenv.config();

    const iTwinId = process.env.IMJS_SAMPLE_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_SAMPLE_CLIENT_ID ?? "";
    const clientSecret = process.env.IMJS_SAMPLE_CLIENT_SECRET ?? "";
    const authority = "https://ims.bentley.com";
    if (!iTwinId || !clientId || !clientSecret) {
        console.log(".env file is not configured properly");
    }
    
    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        clientSecret: clientSecret,
        scope: Array.from(RealityConversionService.getScopes()).join(" "),
        authority: authority
    });

    let realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);

    let realityConversionService = new RealityConversionService(authorizationClient.getAccessToken.bind(authorizationClient));
    console.log("Service initialized");

    // Upload LAS
    console.log("Uploading LAS...")
    const lasCloudId = await realityDataService.uploadRealityData(lasPath, lasName, RealityDataType.LAS, iTwinId);
    console.log("Upload done")

    // Create and submit Conversion job
    const settings = new RCJobSettings();
    settings.inputs.las = [lasCloudId];
    settings.outputs.pnts = true;
    if(inputSrs !== "")
        settings.options.inputSrs = inputSrs;
    if(outputSrs !== "")
        settings.options.outputSrs = outputSrs;
    console.log("Settings created");

    const jobId = await realityConversionService.createJob(settings, jobName, iTwinId);
    console.log("Job created");

    await realityConversionService.submitJob(jobId);
    console.log("Job submitted");

    // Monitor job progress
    let jobInProgress = true;
    while (jobInProgress) {
        try {
            const progress = await realityConversionService.getJobProgress(jobId);
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
                return;
            }
        }
        catch(error: any) {
            console.error("Job progress error :  ", error.message || error);
        }
        await sleep(6000);
    }
    console.log("Job done");

    // Download 3DTiles
    const properties = await realityConversionService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const pnts = properties.settings.outputs.pnts as string[];
    if (pnts.length > 0) {
        await realityDataService.downloadRealityData(pnts[0], outputPath, iTwinId);
        console.log("Successfully downloaded output");
    }
}

runConversionExample();
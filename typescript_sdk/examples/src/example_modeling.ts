/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RealityCaptureService, ReconstructionSpecificationsCreate, ReconstructionInputs, ReconstructionOutputsCreate, 
    ReconstructionOutputs, ExportCreate, Format, OptionsLAS, SamplingStrategy, TilingOptions, GeometricPrecision, 
    JobCreate, JobType, JobState, Progress, getAppropriateService, Type, RealityDataHandler } from "reality-capture";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runModelingExample() {
    /**
     * This example shows how to submit a Reconstruction job
     */

    // Inputs to provide. Please, adapt values
    const orientedScene = "D:/Helico/ContextScene";
    const outputPath = "D:/output/LAS";

    // Optional : sampling distance (in meter). Please, set to undefined if you don't want to specify sampling distance
    const samplingDistance: number | undefined = 0.5;
    // Optional : srs used in outputs. Please, set to undefined if you don't want to specify srs
    const crs: string | undefined = "EPSG:32631";

    const jobName = "Reality Modeling job SDK sample";
    const contextSceneName = "Reality Modeling SDK sample context scene"

    // Script
    dotenv.config();

    const iTwindId = process.env.IMJS_ITWIN_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_CLIENT_SECRET ?? "";
    const issuerUrl = "https://ims.bentley.com";

    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        scope: "itwin-platform",
        clientSecret: secret,
        authority: issuerUrl,
    });

    const tokenFactory = {
        get_token: async () => {
            return await authorizationClient.getAccessToken()
        }
    };
    const realityCaptureService = new RealityCaptureService(tokenFactory);
    console.log("Reality Capture service initialized");
    const realityDataHandler = new RealityDataHandler(tokenFactory);
    console.log("Reality Data handler initialized");

    try {
        console.log("Upload context scene in ", iTwindId);
        const realityDataId = await realityCaptureService.createRealityData({ iTwinId: iTwindId, displayName: contextSceneName, type: Type.CONTEXT_SCENE});
        if(realityDataId.isError()) {
            console.log("Failed to create reality data : " + realityDataId.error!.error.message);
            return;
        }
        const uploadResponse = await realityDataHandler.uploadData(realityDataId.value!.id, orientedScene, "", iTwindId);
        if(uploadResponse.isError()) {
            console.log("Failed to upload reality data : " + uploadResponse.error!.error.message);
            return;
        }
        console.log("Successfully uploaded oriented context scene")

        let reconsInputs: ReconstructionInputs = { scene: realityDataId.value!.id };
        let lasOptions: OptionsLAS = { };
        if (crs) {
            lasOptions.crs = crs;
        }
        if (samplingDistance) {
            lasOptions.samplingStrategy = SamplingStrategy.ABSOLUTE;
            lasOptions.samplingDistance = samplingDistance;
        }
        let exp: ExportCreate = { format: Format.LAS, options: lasOptions };
        let tilingOptions: TilingOptions = { geometricPrecision: GeometricPrecision.EXTRA };
        let reconsOutputs: ReconstructionOutputsCreate = { exports: [exp] };
        let reconsSpecs: ReconstructionSpecificationsCreate = { inputs: reconsInputs, outputs: reconsOutputs, options: tilingOptions };

        let jobToSubmit: JobCreate = { name: jobName, specifications: reconsSpecs, type: JobType.RECONSTRUCTION, iTwinId: iTwindId };
        const submitResponse = await realityCaptureService.submitJob(jobToSubmit);
        if (submitResponse.isError()) {
            console.log("Failed to submit job : " + submitResponse.error!.error.message);
            return;
        }
        const jobId = submitResponse.value!.id;
        console.log("Job submitted");

        let progress: Progress = { state: JobState.QUEUED, percentage: 0 };
        while (progress.state !== JobState.CANCELLED && progress.state !== JobState.FAILED && progress.state !== JobState.SUCCESS) {
            const response = await realityCaptureService.getJobProgress(jobId, getAppropriateService(JobType.RECONSTRUCTION));
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

        console.log("Downloading outputs");
        const propertiesResponse = await realityCaptureService.getJob(jobId, getAppropriateService(JobType.RECONSTRUCTION));
        if (propertiesResponse.isError()) {
            console.log("Failed to retrieve job properties : " + submitResponse.error!.error.message);
            return;
        }
        const downloadResponse = await realityDataHandler.downloadData((propertiesResponse.value!.specifications.outputs as ReconstructionOutputs).exports![0].location, outputPath, "", iTwindId);
        if (downloadResponse.isError()) {
            console.log("Failed to download LAS : " + submitResponse.error!.error.message);
            return;
        }
        console.log("Successfully downloaded output");
    }
    catch(error: any) {
        console.log(error);
    }
}

runModelingExample();
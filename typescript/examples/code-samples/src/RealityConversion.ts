/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import  path from "path";
import { RCJobSettings, RealityConversionService } from "@itwin/reality-capture-conversion";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { RealityDataTransferNode, ReferenceTableNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runConversionexample() {
    /**
     * This example converts a laz file to opc format and downloads the opc file locally.
     */
    const lazPointCloud = "path to the laz you want to convert";
    const outputPath = "path to the folder where you want to save the opc file";

    dotenv.config();

    const jobName = "RCS LAZ to OPC sample";
    const lazName = "RCS LAZ Input";

    const iTwinId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_REDIRECT_URL ?? "";
    const env = process.env.IMJS_ENV ?? "";
    const issuerUrl = env === "prod" ? "https://ims.bentley.com" : "https://qa-ims.bentley.com";

    console.log("Reality Analysis sample job detecting 3D lines");
    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityConversionService.getScopes()).join(" "),
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

    let realityConversionService;
    if(env === "prod")
        realityConversionService = new RealityConversionService(authorizationClient.getAccessToken.bind(authorizationClient));
    else if(env === "qa")
        realityConversionService = new RealityConversionService(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");
    else
        realityConversionService = new RealityConversionService(authorizationClient.getAccessToken.bind(authorizationClient), "dev-");
    console.log("Service initialized");

    try {
        // Creating reference table and uploading laz point cloud if necessary (not yet on the cloud)
        const references = new ReferenceTableNode();
        const referencesPath = path.join(outputPath, "rcs_references_typescript.txt");
        if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
            console.log("Loading preexistent references");
            await references.load(referencesPath);
        }

        // Upload LAZ
        if(!references.hasLocalPath(lazPointCloud)) {
            console.log("No reference to LAZ point cloud found, uploading local files to cloud");
            const id = await realityDataService.uploadRealityData(lazPointCloud, lazName, RealityDataType.LAZ, iTwinId);
            references.addReference(lazPointCloud, id);
        }

        await references.save(referencesPath);
        console.log("Checked data upload");

        const settings = new RCJobSettings();
        settings.inputs.laz = [references.getCloudIdFromLocalPath(lazPointCloud)];
        settings.outputs.opc = true;

        console.log("Settings created");

        const jobId = await realityConversionService.createJob(settings, jobName, iTwinId);
        console.log("Job created");

        await realityConversionService.submitJob(jobId);
        console.log("Job submitted");

        let jobInProgress = true;
        while(jobInProgress) {
            const progress = await realityConversionService.getJobProgress(jobId);
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
        const properties = await realityConversionService.getJobProperties(jobId);
        console.log("Downloading outputs");
        const opc = properties.settings.outputs.opc as string[];
        if(opc.length > 0) {
            await realityDataService.downloadRealityData(opc[0], outputPath, iTwinId);
            console.log("Successfully downloaded output");
        }
    }
    catch(error: any) {
        console.log(error);
    }
}

runConversionexample();
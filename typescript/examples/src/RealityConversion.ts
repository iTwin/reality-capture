/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path = require("path");
import { CommonData, RealityConversionService, defaultProgressHook, RCUtils } from "@itwin/reality-capture";
import { RealityDataTransferNode, ReferenceTableNode } from "@itwin/reality-capture-node";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
    const lazPointCloud = "D:\\Datasets\\Conversions";
    const outputPath = "D:\\output";

    dotenv.config();

    const jobName = "RCS LAZ to OPC sample";
    const lazName = "RCS LAZ Input";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const authority = process.env.IMJS_ISSUER_URL ?? "";

    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        clientSecret: secret,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityConversionService.getScopes()).join(" "),
        authority: authority,
    });
    console.log("Reality conversion sample job - LAZ to OPC");
    const realityDataService = new RealityDataTransferNode(authorizationClient, "qa-");
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    const realityConversionService = new RealityConversionService(authorizationClient, "dev-");
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
            const id = await realityDataService.uploadRealityData(lazPointCloud, lazName, CommonData.RealityDataType.LAZ, projectId);
            references.addReference(lazPointCloud, id);
        }

        await references.save(referencesPath);
        console.log("Checked data upload");

        let settings = new RCUtils.RCJobSettings();
        settings.inputs.laz = [references.getCloudIdFromLocalPath(lazPointCloud)];
        settings.outputs.opc = true;

        console.log("Settings created");

        const jobId = await realityConversionService.createJob(settings, jobName, projectId);
        console.log("Job created");

        await realityConversionService.submitJob(jobId);
        console.log("Job submitted");

        while(true) {
            const progress = await realityConversionService.getJobProgress(jobId);
            if(progress.state === CommonData.JobState.SUCCESS || progress.state === CommonData.JobState.OVER) {
                break;
            }
            else if(progress.state === CommonData.JobState.ACTIVE) {
                console.log("Progress: " + progress.progress + ", step: " + progress.step);
            }
            else if(progress.state === CommonData.JobState.CANCELLED) {
                console.log("Job cancelled");
                return;
            }
            else if(progress.state === CommonData.JobState.FAILED) {
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
            await realityDataService.downloadRealityData(opc[0], outputPath, projectId);
            console.log("Successfully downloaded output");
        }
    }
    catch(error: any) {
        console.log(error);
    }
}

main();
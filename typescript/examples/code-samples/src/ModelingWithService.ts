/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path from "path";
import * as os from "os";
import { CCJobQuality, CCJobSettings, CCJobType, ContextCaptureService } from "@itwin/reality-capture-modeling";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { RealityDataTransferNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runModelingExample() {
    /**
     * This example show how to submit a Full Modeling job (Calibration + Reconstruction), and how to download the results.
     * Requires a service application and a environment file to define IMJS_SAMPLE_PROJECT_ID, IMJS_SAMPLE_CLIENT_ID and IMJS_SAMPLE_CLIENT_SECRET
     */

    // Inputs to provide. Please, adapt values

    // Required : path of the image folder
    const imagesPath = "D:/Datasets/Heli/InputImages";
    // Required : path to the folder where the results will be downloaded
    const outputPath = "D:/Datasets/Heli";
    
    // Optional : sampling distance (in meter). Please, set to undefined if you don't want to specify sampling distance
    const samplingDistance: number | undefined = 0.5;
    // Optional : srs used in outputs. Please, set to undefined if you don't want to specify srs
    const srs: string | undefined = "EPSG:32631";
    // Optional : AT settings. Please, set to an empty string if you don't want to specify AT settings
    const atSettings: string = "D:/Datasets/Heli/ATSettings";

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
    const clientSecret = process.env.IMJS_SAMPLE_CLIENT_SECRET ?? "";
    const authority = "https://ims.bentley.com";
    if (!iTwinId || !clientId || !clientSecret) {
        console.log(".env file is not configured properly");
    }

    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        clientSecret: clientSecret,
        scope: Array.from(ContextCaptureService.getScopes()).join(" "),
        authority: authority
    });

    console.log("Reality Modeling sample job - Full (Calibration + Reconstruction)");
    let realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);

    let contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient));
    console.log("Service initialized");

    // Upload images
    console.log("Uploading images...");
    const imagesId = await realityDataService.uploadRealityData(imagesPath, imagesName, RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
    console.log("Images uploaded successfully");

    // Create orientations file
    const domImpl = new DOMImplementation();
    const doc = domImpl.createDocument(null, "BlocksExchange", null);
    const root = doc.documentElement;
    root.setAttribute("version", "2.1");

    const block = doc.createElement("Block");
    root.appendChild(block);
    const blockName = doc.createElement("Name");
    blockName.appendChild(doc.createTextNode("Block_1"));
    block.appendChild(blockName);
    const bulk = doc.createElement("BulkPhotos");
    block.appendChild(bulk);
    const subFiles = await fs.promises.readdir(imagesPath);
    for (let i = 0; i < subFiles.length; i++) {
        if(subFiles[i] !== "Thumbs.db") {
            const photo = doc.createElement("Photo");
            bulk.appendChild(photo);
            const photoId = doc.createElement("Id");
            photoId.appendChild(doc.createTextNode(i.toString()));
            photo.appendChild(photoId);
            const photoPath = doc.createElement("ImagePath");
            photoPath.appendChild(doc.createTextNode(path.join(imagesId, subFiles[i])));
            photo.appendChild(photoPath);
            bulk.appendChild(photo);
        }
    }
    const serializer = new XMLSerializer();
    const xmlContent = '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(doc);
    let tmpDir = path.join(os.tmpdir(), "Bentley", crypto.randomUUID());
    await fs.promises.mkdir(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "Orientations.xml"), xmlContent);

    // Upload orientations.xml file
    console.log("Upoading orientations");
    const orientationsId = await realityDataService.uploadCCOrientations(tmpDir, orientationsName, iTwinId);
    console.log("Orientations uploaded successfully");

    // Create workspace
    const workspaceId = await contextCaptureService.createWorkspace(workspaceName, iTwinId);

    // Create job
    const settings = new CCJobSettings();
    settings.inputs = [imagesId, orientationsId];
    settings.outputs.las = "LAS";
    settings.meshQuality = CCJobQuality.EXTRA;
    console.log("Settings created");

    const jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, jobName, workspaceId);
    console.log("Job created");

    // Create production settings file
    if(srs || samplingDistance)
    {
        const srsValue = srs !== undefined ? srs : "";
        const samplingValue = samplingDistance !== undefined ? samplingDistance : 0;
        const data = {
            "ProductionSettingsExchange": [
                {
                    name: "LAS",
                    settings: {
                        MergePointClouds: "true",
                        ...(srsValue !== "" && { SRS: srsValue }),
                        ...(samplingValue > 0 && { PointSamplingUnit: "meter", PointSamplingDistance: samplingValue.toString() })
                    }
                }
            ]
        };
        tmpDir = path.join(os.tmpdir(), "Bentley/", crypto.randomUUID());
        await fs.promises.mkdir(tmpDir, { recursive: true });
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(path.join(tmpDir, "prod_settings.json"), jsonData);

        // Then, upload AT & production settings in the workspace
        console.log("Uploading production settings in workspace...");
        await realityDataService.uploadJsonToWorkspace(tmpDir, iTwinId, workspaceId, jobId);
        console.log("Production settings uploaded successfully");
        if(atSettings)
        {
            console.log("Uploading AT settings in workspace...");
            await realityDataService.uploadJsonToWorkspace(atSettings, iTwinId, workspaceId, jobId);
            console.log("AT settings uploaded successfully");
        }
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
    await realityDataService.downloadRealityData(lasId, path.join(outputPath, "LAS"), iTwinId);
    await realityDataService.downloadRealityData(workspaceId, path.join(outputPath, "CalibResults"), iTwinId, jobId + "/outputs/calibration");
    console.log("Successfully downloaded output");
}

runModelingExample();

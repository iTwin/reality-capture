/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path = require("path");
import { RealityDataType, JobState, ClientInfo } from "../CommonData";
import { RealityDataAnalysisService } from "../rdas/RealityDataAnalysisService";
import { L3DJobSettings } from "../rdas/Settings";
import { defaultProgressHook, RealityDataTransfer } from "../utils/RealityDataTransfer";
import { ReferenceTable } from "../utils/ReferenceTable";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { ServiceTokenFactory } from "../token/TokenFactoryNode";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runContextCaptureExample() {
    const ccImageCollection = "path to your image folder";
    const orientedPhotosContextScene = "path to the folder where your context scene file is";
    const photoSegmentationDetector = "path to the folder where your detector is";
    const mesh = "path to the folder where your mesh is";
    const meshContextScene = "path to the folder where your context scene file that references the mesh is";
    const outputPath = "path to the folder where you want to save outputs";

    dotenv.config();

    const jobName = "L3D job SDK sample";
    const ccImageCollectionName = "Test L3D Photos";
    const orientedPhotosName = "Test L3D oriented photos";
    const meshName = "Test L3D mesh";
    const contextSceneName = "Test L3D Scene";
    const detectorName = "Test L3D detector";

    const projectId = process.env.PROJECT_ID ?? "";
    const clientId = process.env.CLIENT_ID ?? "";
    const secret = process.env.SECRET ?? "";

    console.log("Reality Data Analysis sample job detecting 3D lines");
    const clientInfoRd: ClientInfo = {clientId: clientId, scopes: new Set([ ...RealityDataTransfer.getScopes()]), 
        secret: secret, env: "qa-"};
    const clientInfoRda: ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataAnalysisService.getScopes()]), 
        secret: secret, env: "dev-"};
    const tokenFactoryRd = new ServiceTokenFactory(clientInfoRd);
    const tokenFactoryRda = new ServiceTokenFactory(clientInfoRda);
    await tokenFactoryRd.getToken();
    await tokenFactoryRda.getToken();
    if(!tokenFactoryRd.isOk() || !tokenFactoryRda.isOk())
        console.log("Can't get the access token");
    
    const realityDataService = new RealityDataTransfer(tokenFactoryRd);
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    const realityDataAnalysisService = new RealityDataAnalysisService(tokenFactoryRda);
    console.log("Service initialized");


    // Creating reference table and uploading ccimageCollection, oriented photos, mesh, mesh contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTable();
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

    // Upload Oriented photos (contextScene)
    if(!references.hasLocalPath(orientedPhotosContextScene)) {
        console.log("No reference to oriented photos ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(orientedPhotosContextScene, orientedPhotosName, projectId, references);
        references.addReference(orientedPhotosContextScene, id);
    }

    // Upload Detector
    if(!references.hasLocalPath(photoSegmentationDetector)) {
        console.log("No reference to detector found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(photoSegmentationDetector, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            projectId);
        references.addReference(photoSegmentationDetector, id);
    }

    // Upload Mesh
    if(!references.hasLocalPath(mesh)) {
        console.log("No reference to mesh found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(mesh, meshName, RealityDataType.THREEMX, 
            projectId);
        references.addReference(mesh, id);
    }

    // Upload Mesh ContextScene
    if(!references.hasLocalPath(meshContextScene)) {
        console.log("No reference to mesh ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(meshContextScene, contextSceneName, projectId, references);
        references.addReference(meshContextScene, id);
    }

    await references.save(referencesPath);
    console.log("Checked data upload");

    const settings = new L3DJobSettings();
    settings.inputs.orientedPhotos = references.getCloudIdFromLocalPath(orientedPhotosContextScene);
    settings.inputs.photoSegmentationDetector = references.getCloudIdFromLocalPath(photoSegmentationDetector);
    settings.inputs.meshes = references.getCloudIdFromLocalPath(meshContextScene);
    settings.outputs.lines3D = "lines3D";
    settings.outputs.segmentation2D = "segmentation2D";

    console.log("Settings created");

    const jobId = await realityDataAnalysisService.createJob(settings, jobName, projectId);
    console.log("Job created");

    await realityDataAnalysisService.submitJob(jobId);
    console.log("Job submitted");

    while(true) {
        const progress = await realityDataAnalysisService.getJobProgress(jobId);
        if(progress.state === JobState.SUCCESS) {
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
    const properties = await realityDataAnalysisService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const lines3dId = (properties.settings as L3DJobSettings).outputs.lines3D;
    realityDataService.downloadContextScene(lines3dId, outputPath, projectId, references);
    console.log("Successfully downloaded output");
}

runContextCaptureExample();
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import path from "path";
import { S2DJobSettings, RealityDataAnalysisService } from "@itwin/reality-capture-analysis";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { RealityDataTransferNode, ReferenceTableNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runSegmentation2DExample() {
    const imageCollection = "path to your image folder";
    const photosContextScene  = "path to the folder where your context scene file is";
    const photoSegmentationDetector = "path to the folder where your detector is";
    const mesh = "path to the folder where your mesh is";
    const meshContextScene = "path to the folder where your context scene file that references the mesh is";
    const outputPath = "path to the folder where you want to save outputs";

    dotenv.config();

    const jobName = "S2D job SDK sample";
    const imageCollectionName = "Test S2D Photos";
    const photosSceneName = "Test S2D oriented photos";
    const meshName = "Test S2D mesh";
    const contextSceneName = "Test S2D Scene";
    const detectorName = "Test S2D detector";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_REDIRECT_URL ?? "";
    const env = process.env.IMJS_ENV ?? "";
    const issuerUrl = env === "prod" ? "https://ims.bentley.com" : "https://qa-ims.bentley.com";

    console.log("Reality Analysis sample job producing 2D segmentation and 3D lines");
    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityDataAnalysisService.getScopes()).join(" "),
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

    let realityDataAnalysisService;
    if(env === "prod")
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient));
    else if(env === "qa")
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");
    else
        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient.getAccessToken.bind(authorizationClient), "dev-");

    console.log("Service initialized");

    // Creating reference table and uploading ccimageCollection, oriented photos, mesh, mesh contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTableNode();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        await references.load(referencesPath);
    }

    // Upload CCImageCollection
    if(!references.hasLocalPath(imageCollection)) {
        console.log("No reference to CCimage Collections found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(imageCollection, imageCollectionName, 
            RealityDataType.CC_IMAGE_COLLECTION, projectId);
        references.addReference(imageCollection, id);
    }

    // Upload Oriented photos (contextScene)
    if(!references.hasLocalPath(photosContextScene)) {
        console.log("No reference to oriented photos ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(photosContextScene, photosSceneName, projectId, references);
        references.addReference(photosContextScene, id);
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

    const settings = new S2DJobSettings();
    settings.inputs.photos = references.getCloudIdFromLocalPath(photosContextScene);
    settings.inputs.photoSegmentationDetector = references.getCloudIdFromLocalPath(photoSegmentationDetector);
    settings.inputs.meshes = references.getCloudIdFromLocalPath(meshContextScene);
    settings.outputs.lines3D = "lines3D";
    settings.outputs.segmentation2D = "segmentation2D";

    console.log("Settings created");

    const jobId = await realityDataAnalysisService.createJob(settings, jobName, projectId);
    console.log("Job created");

    await realityDataAnalysisService.submitJob(jobId);
    console.log("Job submitted");

    let jobInProgress = true;
    while(jobInProgress) {
        const progress = await realityDataAnalysisService.getJobProgress(jobId);
        if(progress.state === JobState.SUCCESS) {
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
    const properties = await realityDataAnalysisService.getJobProperties(jobId);
    console.log("Downloading outputs");
    const lines3dId = (properties.settings as S2DJobSettings).outputs.lines3D;
    realityDataService.downloadContextScene(lines3dId, outputPath, projectId, references);
    console.log("Successfully downloaded output");
}

runSegmentation2DExample();
import path = require("path");
import { RealityDataType, JobState } from "../CommonData";
import { RealityDataAnalysisService } from "../Rdas/Service";
import { L3DJobSettings } from "../Rdas/Settings";
import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { ReferenceTable } from "../Utils/ReferenceTable";
import * as fs from "fs";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runContextCaptureExample() {
    const ccImageCollection = "D:\\Lines3D\\Images";
    const orientedPhotosContextScene = "D:\\Lines3D\\OrientedPhotos";
    const photoSegmentationDetector = "D:\\Lines3D\\CracksA_v1";
    const mesh = "D:\\Lines3D\\3MX";
    const meshContextScene = "D:\\Lines3D\\Mesh3MX";
    const outputPath = "D:\\output";

    const jobName = "L3D job SDK sample";
    const ccImageCollectionName = "Test L3D Photos";
    const orientedPhotosName = "Test L3D oriented photos";
    const meshName = "Test L3D mesh";
    const contextSceneName = "Test L3D Scene";
    const detectorName = "Test L3D detector";

    const projectId = "ad14b27c-91ea-4492-9433-1e2d6903b5e4";
    const clientId = "service-pJ0wfNZEIWcpVD98kt4QuHqQy";
    const secret = "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg==";
    const rdServiceUrl = "https://qa-api.bentley.com/realitydata/";
    const rdaServiceUrl = "https://qa-api.bentley.com/realitydataanalysis/";

    console.log("Reality Data Analysis sample job detecting 3D lines");
    const realityDataService = new RealityDataTransfer(rdServiceUrl, clientId, secret);
    const realityDataAnalysisService = new RealityDataAnalysisService(rdaServiceUrl, clientId, secret);
    console.log("Service initialized");

    // Creating reference table and uploading ccimageCollection, oriented photos, mesh, mesh contextScene and detector if necessary (not yet on the cloud)
    const references = new ReferenceTable();
    const referencesPath = path.join(outputPath, "test_references_typescript.txt");
    if(fs.existsSync(referencesPath) && fs.lstatSync(referencesPath).isFile()) {
        console.log("Loading preexistent references");
        const res = references.load(referencesPath);
        if(res) {
            console.log("Error while loading preexisting references:" + res);
            return;
        }
    }

    // Upload CCImageCollection
    if(!references.hasLocalPath(ccImageCollection)) {
        console.log("No reference to CCimage Collections found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(ccImageCollection, ccImageCollectionName, 
            RealityDataType.CC_IMAGE_COLLECTION, projectId);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(ccImageCollection, id);
    }

    // Upload Oriented photos (contextScene)
    if(!references.hasLocalPath(orientedPhotosContextScene)) {
        console.log("No reference to oriented photos ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(orientedPhotosContextScene, orientedPhotosName, projectId, references);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(orientedPhotosContextScene, id);
    }

    // Upload Detector
    if(!references.hasLocalPath(photoSegmentationDetector)) {
        console.log("No reference to detector found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(photoSegmentationDetector, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            projectId);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(photoSegmentationDetector, id);
    }

    // Upload Mesh
    if(!references.hasLocalPath(mesh)) {
        console.log("No reference to mesh found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(mesh, meshName, RealityDataType.THREEMX, 
            projectId);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(mesh, id);
    }

    // Upload Mesh ContextScene
    if(!references.hasLocalPath(meshContextScene)) {
        console.log("No reference to mesh ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(meshContextScene, contextSceneName, projectId, references);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(meshContextScene, id);
    }

    const saveRes = references.save(referencesPath);
    if(saveRes) {
        console.log("Error saving references:" + saveRes);
        return;
    }
    console.log("Checked data upload");

    const settings = new L3DJobSettings();
    settings.inputs.orientedPhotos = references.getCloudIdFromLocalPath(orientedPhotosContextScene);
    settings.inputs.photoSegmentationDetector = references.getCloudIdFromLocalPath(photoSegmentationDetector);
    settings.inputs.meshes = references.getCloudIdFromLocalPath(meshContextScene);
    settings.outputs.lines3D = "lines3D";
    settings.outputs.segmentation2D = "segmentation2D";

    console.log("Settings created");

    const jobId = await realityDataAnalysisService.createJob(settings, jobName, projectId);
    if(jobId instanceof Error) {
        console.log("Error in job create:" + jobId);
        return;
    }
    console.log("Job created");

    const submitRes = await realityDataAnalysisService.submitJob(jobId);
    if(submitRes) {
        console.log("Error in job submit:" + jobId);
        return;
    }
    console.log("Job submitted");

    while(true) {
        const progress = await realityDataAnalysisService.getJobProgress(jobId);
        if(progress instanceof Error) {
            console.log("Error while getting progress:" + jobId);
            return;
        }

        if(progress.state === JobState.SUCCESS) {
            break;
        }
        else if(progress.state === JobState.ACTIVE) {
            console.log("Progress: " + progress.progress + ", step: " + progress.step);
        }
        else if(progress.state === JobState.CANCELLED) {
            console.log("Job cancelled");
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
    const finalSettings = await realityDataAnalysisService.getJobSettings(jobId);
    if(finalSettings instanceof Error) {
        console.log("Error while getting settings:" + finalSettings);
        return;
    }

    console.log("Downloading outputs");
    const lines3dId = (finalSettings as L3DJobSettings).outputs.lines3D;
    realityDataService.downloadContextScene(lines3dId, outputPath, references);
    console.log("Successfully downloaded output");
}

runContextCaptureExample();
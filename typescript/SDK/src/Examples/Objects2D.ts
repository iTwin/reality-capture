import { RealityDataAnalysisService } from "../Rdas/Service";
import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { ReferenceTable } from "../Utils/ReferenceTable";
import path = require("path");
import * as fs from "fs";
import { JobState, RealityDataType } from "../CommonData";
import { O2DJobSettings } from "../Rdas/Settings";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runObjects2DExample() {
    const ccImageCollection = "D:\\O2D-Motos\\images";
    const photoContextScene = "D:\\O2D-Motos\\Scene";
    const photoObjectDetector = "D:\\O2D-Motos\\Coco2017_v1.19";
    const outputPath = "D:\\output";

    const jobName = "O2D job new SDK sample";
    const ccImageCollectionName = "Test Moto Photos";
    const contextSceneName = "Test Moto Scene";
    const detectorName = "O2D photos in RAS-QA";

    const projectId = "ad14b27c-91ea-4492-9433-1e2d6903b5e4";
    const clientId = "service-pJ0wfNZEIWcpVD98kt4QuHqQy";
    const secret = "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg==";
    const rdServiceUrl = "https://qa-api.bentley.com/realitydata/";
    const rdaServiceUrl = "https://qa-api.bentley.com/realitydataanalysis/";

    console.log("Reality Data Analysis sample job detecting 2D objects");
    const realityDataService = new RealityDataTransfer(rdServiceUrl, clientId, secret);
    const realityDataAnalysisService = new RealityDataAnalysisService(rdaServiceUrl, clientId, secret);
    console.log("Service initialized");

    // Creating reference table and uploading ccimageCollection, contextScene and detector if necessary (not yet on the cloud)
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

    // Upload ContextScene
    if(!references.hasLocalPath(photoContextScene)) {
        console.log("No reference to ContextScene found, uploading local files to cloud");
        const id = await realityDataService.uploadContextScene(photoContextScene, contextSceneName, projectId, references);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(photoContextScene, id);
    }

    // Upload Detector
    if(!references.hasLocalPath(photoObjectDetector)) {
        console.log("No reference to detector found, uploading local files to cloud");
        const id = await realityDataService.uploadRealityData(photoObjectDetector, detectorName, RealityDataType.CONTEXT_DETECTOR, 
            projectId);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(photoObjectDetector, id);
    }

    const saveRes = references.save(referencesPath);
    if(saveRes) {
        console.log("Error saving references:" + saveRes);
        return;
    }
    console.log("Checked data upload");

    const settings = new O2DJobSettings();
    console.log("references : ", references);
    settings.inputs.photos = references.getCloudIdFromLocalPath(photoContextScene);
    settings.inputs.photoObjectDetector = references.getCloudIdFromLocalPath(photoObjectDetector);
    settings.outputs.objects2D = "objects2D";
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
    const objects2DId = (finalSettings as O2DJobSettings).outputs.objects2D;
    realityDataService.downloadContextScene(objects2DId, outputPath, references);
    console.log("Successfully downloaded output");
}

runObjects2DExample();
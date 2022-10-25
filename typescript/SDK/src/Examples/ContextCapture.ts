import path = require("path");
import { ContextCaptureService } from "../Cccs/Service";
import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { ReferenceTable } from "../Utils/ReferenceTable";
import * as fs from "fs";
import { JobState, RealityDataType } from "../CommonData";
import { CCJobSettings } from "../Cccs/Settings";
import { CCJobType } from "../Cccs/Utils";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
    const ccImageCollection = "D:\\S2D-3CS-Bridge\\BridgeImages";
    const ccOrientations = "D:\\S2D-3CS-Bridge\\BridgeCCorientation";
    const outputPath = "D:\\output";

    const jobName = "CCCS job SDK sample";
    const workspaceName = "CCCS SDK test workspace";
    const ccImageCollectionName = "Test CCCS Photos";
    const ccOrientationsName = "Test CCCS cc orientations";

    const projectId = "ad14b27c-91ea-4492-9433-1e2d6903b5e4";
    const clientId = "service-pJ0wfNZEIWcpVD98kt4QuHqQy";
    const secret = "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg==";
    const rdServiceUrl = "https://qa-api.bentley.com/realitydata/";
    const ccServiceUrl = "https://qa-api.bentley.com/contextcapture/";

    console.log("Context capture sample job - Full (Calibration + Reconstruction)");
    const realityDataService = new RealityDataTransfer(rdServiceUrl, clientId, secret);
    const contextCaptureService = new ContextCaptureService(ccServiceUrl, clientId, secret);
    console.log("Service initialized");

    // Creating reference table and uploading ccimageCollection, ccOrientations if necessary (not yet on the cloud)
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
    if(!references.hasLocalPath(ccOrientations)) {
        console.log("No reference to cc orientations found, uploading local files to cloud");
        const id = await realityDataService.uploadCCOrientations(ccOrientations, ccOrientationsName, projectId, references);
        if(id instanceof Error) {
            console.log("Error in upload:", id);
            return;
        }
        references.addReference(ccOrientations, id);
    }

    const saveRes = references.save(referencesPath);
    if(saveRes) {
        console.log("Error saving references:" + saveRes);
        return;
    }
    console.log("Checked data upload");

    // Create workspace
    const workspaceId = await contextCaptureService.createWorkspace(workspaceName, projectId);
    if(workspaceId instanceof Error) {
        console.log("Error in workspace create : " + workspaceId);
        return;
    }

    let settings = new CCJobSettings();
    settings.inputs = [references.getCloudIdFromLocalPath(ccImageCollection), references.getCloudIdFromLocalPath(ccOrientations)];
    settings.outputs.threeMX = "threeMX";

    console.log("Settings created");

    const jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, jobName, workspaceId, projectId);
    if(jobId instanceof Error) {
        console.log("Error in job create:" + jobId);
        return;
    }
    console.log("Job created");

    const submitRes = await contextCaptureService.submitJob(jobId);
    if(submitRes) {
        console.log("Error in job submit:" + jobId);
        return;
    }
    console.log("Job submitted");

    while(true) {
        const progress = await contextCaptureService.getJobProgress(jobId);
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
    const finalSettings = await contextCaptureService.getJobSettings(jobId);
    if(finalSettings instanceof Error) {
        console.log("Error while getting settings:" + finalSettings);
        return;
    }

    console.log("Downloading outputs");
    const threeMXId = (finalSettings as CCJobSettings).outputs.threeMX;
    realityDataService.downloadContextScene(threeMXId, outputPath, references);
    console.log("Successfully downloaded output");
}

main();
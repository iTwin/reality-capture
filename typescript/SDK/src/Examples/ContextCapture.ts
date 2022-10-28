import path = require("path");
import { ContextCaptureService } from "../Cccs/ContextCaptureService";
import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { ReferenceTable } from "../Utils/ReferenceTable";
import * as fs from "fs";
import { ClientInfo, JobState, RealityDataType } from "../CommonData";
import { CCJobSettings, CCJobType, CCMeshQuality } from "../Cccs/Utils";
import * as dotenv from "dotenv";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
    const ccImageCollection = "D:\\S2D-3CS-Bridge\\BridgeImages";
    const ccOrientations = "D:\\S2D-3CS-Bridge\\BridgeCCorientation";
    const outputPath = "D:\\output";

    dotenv.config();

    const jobName = "CCCS job SDK sample";
    const workspaceName = "CCCS SDK test workspace";
    const ccImageCollectionName = "Test CCCS Photos";
    const ccOrientationsName = "Test CCCS cc orientations";

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const redirectUrl = process.env.IMJS_AUTHORIZATION_REDIRECT_URI ?? "";

    console.log("Context capture sample job - Full (Calibration + Reconstruction)");
    const clientInfo: ClientInfo = {clientId: clientId, secret: secret, redirectUrl: redirectUrl};
    const realityDataService = new RealityDataTransfer(clientInfo);
    const contextCaptureService = new ContextCaptureService(clientInfo);
    console.log("Service initialized");

    try {
        // Creating reference table and uploading ccimageCollection, ccOrientations if necessary (not yet on the cloud)
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

        // Upload Oriented photos (ccOrientations)
        if(!references.hasLocalPath(ccOrientations)) {
            console.log("No reference to cc orientations found, uploading local files to cloud");
            const id = await realityDataService.uploadCCOrientations(ccOrientations, ccOrientationsName, projectId, references);
            references.addReference(ccOrientations, id);
        }

        references.save(referencesPath);
        console.log("Checked data upload");

        // Create workspace
        const workspaceId = await contextCaptureService.createWorkspace(workspaceName, projectId);

        let settings = new CCJobSettings();
        settings.inputs = [references.getCloudIdFromLocalPath(ccImageCollection), references.getCloudIdFromLocalPath(ccOrientations)];
        settings.outputs.threeMX = "threeMX";
        settings.meshQuality = CCMeshQuality.MEDIUM;

        console.log("Settings created");

        const jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, jobName, workspaceId);
        console.log("Job created");

        await contextCaptureService.submitJob(jobId);
        console.log("Job submitted");

        while(true) {
            const progress = await contextCaptureService.getJobProgress(jobId);
            if(progress.state === JobState.SUCCESS || progress.state === JobState.Over) {
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
        const finalSettings = await contextCaptureService.getJobSettings(jobId);
        console.log("Downloading outputs");
        const threeMXId = (finalSettings as CCJobSettings).outputs.threeMX;
        realityDataService.downloadRealityData(threeMXId, outputPath);
        console.log("Successfully downloaded output");
    }
    catch(error: any) {
        console.log(error);
    }
}

main();
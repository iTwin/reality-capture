/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import * as dotenv from "dotenv";
import path from "path";
import { RealityDataClientOptions, RealityDataAccessClient } from "@itwin/reality-data-client";
import { ContextCaptureService } from "../ContextCaptureService";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { JobState, RealityDataType } from "@itwin/reality-capture-common";
import { CCJobQuality, CCJobSettings, CCJobType } from "../Utils";
import { RealityDataTransferNode, ReferenceTableNode } from "@itwin/reality-data-transfer";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Modeling integration tests", () => {
    let contextCaptureService: ContextCaptureService;
    let realityDataTransfer: RealityDataTransferNode;
    let iTwinId = "";
    let workspaceId = "";
    let imagesId = "";
    let ccOrientationsId = "";
    let references: ReferenceTableNode;
    let rdaClient: RealityDataAccessClient;
    let jobId = "";
    let threeMXId = "";

    before(async function ()  {    
        this.timeout(20000);
        dotenv.config({ path: path.resolve(__dirname, "../../../../../../.env") });

        iTwinId = process.env.IMJS_INTEGRATION_TESTS_PROJECT_ID ?? "";
        const clientId = process.env.IMJS_INTEGRATION_TESTS_CLIENT_ID ?? "";
        const secret = process.env.IMJS_INTEGRATION_TESTS_SECRET ?? "";

        const authorizationClient = new ServiceAuthorizationClient({
            clientId: clientId,
            clientSecret: secret,
            scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(ContextCaptureService.getScopes()).join(" "),
            authority: "https://ims.bentley.com",
        });

        contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient));
        realityDataTransfer = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
        references = new ReferenceTableNode();

        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://api.bentley.com/reality-management",
            authorizationClient: authorizationClient,
        };
        rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    });

    // Create and get workspace
    it("Create workspace", async function () {
        this.timeout(10000);
        workspaceId = await contextCaptureService.createWorkspace("SDK integration tests reality modeling workspace", iTwinId);
        expect(workspaceId).is.not.undefined;
        expect(workspaceId).to.have.length(36);
    });

    it("Get workspace", async function () {
        this.timeout(10000);
        const workspace = await contextCaptureService.getWorkspace(workspaceId);
        expect(workspace.id).to.deep.equal(workspaceId);
        expect(workspace.name).to.deep.equal("SDK integration tests reality modeling workspace");
        expect(workspace.iTwinId).to.deep.equal(iTwinId);
        expect(workspace.contextCaptureVersion).to.deep.equal("2023.0");
    });

    // Create and upload inputs
    it("Upload images", async function () {
        this.timeout(60000);
        imagesId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../../../../../../data/CC/Images/"), 
            "SDK integration tests images", RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        expect(imagesId).is.not.undefined;
        expect(imagesId).to.have.length(36);
        references.addReference("0", imagesId);
    });

    it("Upload CC orientations", async function () {
        this.timeout(10000);
        ccOrientationsId = await realityDataTransfer.uploadCCOrientations(path.resolve(__dirname, "../../../../../../data/CC/Orientation"), 
            "SDK integration tests CC orientations", iTwinId, references);
        expect(ccOrientationsId).is.not.undefined;
        expect(ccOrientationsId).to.have.length(36);
    });

    // Create & submit job
    it("Create reality modeling job", async function () {
        this.timeout(10000);
        const settings = new CCJobSettings();
        settings.inputs = [imagesId, ccOrientationsId];
        settings.outputs.threeMX = "threeMX";
        settings.meshQuality = CCJobQuality.MEDIUM;
        jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, "SDK integration tests reality modeling job", 
            workspaceId);
        expect(jobId).is.not.undefined;
        expect(jobId).to.have.length(36);
        await contextCaptureService.submitJob(jobId);
    });

    // Get and monitor job
    it("Get reality modeling job properties", async function () {
        const jobProperties = await contextCaptureService.getJobProperties(jobId);
        expect(jobProperties.name).to.deep.equal("SDK integration tests reality modeling job");
        expect(jobProperties.type).to.deep.equal(CCJobType.FULL);
        expect(jobProperties.iTwinId).to.deep.equal(iTwinId);
        expect(jobProperties.settings.inputs).to.have.length(2);
        expect(jobProperties.settings.inputs[0]).to.deep.equal(imagesId);
        expect(jobProperties.settings.inputs[1]).to.deep.equal(ccOrientationsId);
        threeMXId = jobProperties.settings.outputs.threeMX;
        expect(threeMXId).to.have.length(36);
        expect(jobProperties.settings.meshQuality).to.deep.equal(CCJobQuality.MEDIUM);
        expect(jobProperties.workspaceId).to.deep.equal(workspaceId);
        expect(jobProperties.id).to.deep.equal(jobId);
        expect(jobProperties.state).to.deep.equal(JobState.ACTIVE);
    });

    it("Get reality modeling job progress", async function () {
        this.timeout(10000);

        const jobProgress = await contextCaptureService.getJobProgress(jobId);
        await contextCaptureService.cancelJob(jobId);
        expect(jobProgress.progress).to.equal(0);
        expect(jobProgress.state).to.deep.equal(JobState.ACTIVE);
        expect(jobProgress.step).to.deep.equal("PrepareStep");
    });

    // Delete inputs
    it("Delete images", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", imagesId);
        try {
            await rdaClient.getRealityData("", iTwinId, imagesId);
        }
        catch(error: any) {
            expect(error.message).to.include("Requested reality data is not available");
        }
    });

    it("Delete cc orientations", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", ccOrientationsId);
        try {
            await rdaClient.getRealityData("", iTwinId, ccOrientationsId);
        }
        catch(error: any) {
            expect(error.message).to.include("Requested reality data is not available");
        }
    });

    it("Delete workspace", async function () {
        this.timeout(10000);
        await contextCaptureService.deleteWorkspace(workspaceId);
        try {
            await contextCaptureService.getWorkspace(workspaceId);
        }
        catch(error: any) {
            expect(error.message).to.include("Requested workspace is not available");
        }
    });
});
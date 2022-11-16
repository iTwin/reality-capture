/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { ContextCaptureService } from "../cccs/ContextCaptureService";
import { ServiceTokenFactory } from "../TokenFactory";
import { BentleyError } from "@itwin/core-bentley";
import { ClientInfo, JobState, RealityDataType } from "../CommonData";
import * as dotenv from "dotenv";
import { RealityDataTransfer } from "../utils/RealityDataTransfer";
import path = require("path");
import { ReferenceTable } from "../utils/ReferenceTable";
import { RealityDataClientOptions, RealityDataAccessClient } from "@itwin/reality-data-client";
import { CCJobSettings, CCJobType, CCMeshQuality } from "../cccs/Utils";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Context capture integration tests", () => {
    let tokenFactory: ServiceTokenFactory;
    let contextCaptureService: ContextCaptureService;
    let realityDataTransfer: RealityDataTransfer;
    let iTwinId = "";
    let workspaceId = "";
    let imagesId = "";
    let ccOrientationsId = "";
    let references: ReferenceTable;
    let rdaClient: RealityDataAccessClient;
    let jobId = "";
    let threeMXId = "";

    before(async function ()  {    
        this.timeout(20000);
        dotenv.config();

        iTwinId = process.env.IMJS_PROJECT_ID ?? "";
        const clientId = process.env.IMJS_CLIENT_ID ?? "";
        const secret = process.env.IMJS_SECRET ?? "";

        const clientInfo: ClientInfo = {clientId: clientId, scopes: new Set([...ContextCaptureService.getScopes(), 
            ...RealityDataTransfer.getScopes()]), secret: secret, env: "qa-"};
        tokenFactory = new ServiceTokenFactory(clientInfo);
        await tokenFactory.getToken();
        if(!tokenFactory.isOk) {
            console.log("Can't get the access token");
            return;
        }

        contextCaptureService = new ContextCaptureService(tokenFactory);
        realityDataTransfer = new RealityDataTransfer(tokenFactory);
        references = new ReferenceTable();

        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: tokenFactory.getServiceUrl() + "realitydata",
        };
        rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    });

    // Create and get workspace
    it("Create workspace", async function () {
        this.timeout(10000);
        workspaceId = await contextCaptureService.createWorkspace("SDK integration tests CC workspace", iTwinId);
        expect(workspaceId).is.not.undefined;
        expect(workspaceId).to.have.length(36);
    });

    it("Get workspace", async function () {
        this.timeout(10000);
        const workspace = await contextCaptureService.getWorkspace(workspaceId);
        expect(workspace.id).to.deep.equal(workspaceId);
        expect(workspace.name).to.deep.equal("SDK integration tests CC workspace");
        expect(workspace.iTwinId).to.deep.equal(iTwinId);
        expect(workspace.contextCaptureVersion).to.deep.equal("19.1");
    });

    // Create and upload inputs
    it("Upload images", async function () {
        this.timeout(20000);

        console.log("__dirname : ", __dirname);

        imagesId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../../data/CC/Images/"), 
            "SDK integration tests CC images", RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        expect(imagesId).is.not.undefined;
        expect(imagesId).to.have.length(36);
        references.addReference(/* path.resolve(__dirname, "../../data/CC/Images/") */ "0", imagesId);
    });

    it("Upload CC orientations", async function () {
        this.timeout(10000);
        ccOrientationsId = await realityDataTransfer.uploadCCOrientations(path.resolve(__dirname, "../../data/CC/Orientation"), 
            "SDK integration tests CC orientations", iTwinId, references);
        expect(ccOrientationsId).is.not.undefined;
        expect(ccOrientationsId).to.have.length(36);
    });

    // Create & submit job
    /* it("Create CC job", async function () {
        this.timeout(10000);
        let settings = new CCJobSettings();
        settings.inputs = [imagesId, ccOrientationsId];
        settings.outputs.threeMX = "threeMX";
        settings.meshQuality = CCMeshQuality.MEDIUM;
        jobId = await contextCaptureService.createJob(CCJobType.FULL, settings, "SDK integration tests CC job", 
            workspaceId);
        expect(jobId).is.not.undefined;
        expect(jobId).to.have.length(36);
        await contextCaptureService.submitJob(jobId);
    });

    // Get and monitor job
    it("Get CC job properties", async function () {
        const jobProperties = await contextCaptureService.getJobProperties(jobId);
        expect(jobProperties.name).to.deep.equal("SDK integration tests CC job");
        expect(jobProperties.type).to.deep.equal(CCJobType.FULL);
        expect(jobProperties.iTwinId).to.deep.equal(iTwinId);
        expect(jobProperties.settings.inputs).to.have.length(2);
        expect(jobProperties.settings.inputs[0]).to.deep.equal(imagesId);
        expect(jobProperties.settings.inputs[1]).to.deep.equal(ccOrientationsId);
        threeMXId = jobProperties.settings.outputs.threeMX;
        expect(threeMXId).to.have.length(36);
        expect(jobProperties.settings.meshQuality).to.deep.equal(CCMeshQuality.MEDIUM);
        expect(jobProperties.workspaceId).to.deep.equal(workspaceId);
        expect(jobProperties.id).to.deep.equal(jobId);
        expect(jobProperties.state).to.deep.equal(JobState.ACTIVE);
    });

    it("Get cc job progress", async function () {
        this.timeout(3600000); // 60mn

        let jobProgress = await contextCaptureService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(0);
        expect(jobProgress.state).to.deep.equal(JobState.ACTIVE);
        expect(jobProgress.step).to.deep.equal("PrepareStep");

        while(true) {
            const progress = await contextCaptureService.getJobProgress(jobId);
            if(progress.state === JobState.SUCCESS || progress.state === JobState.OVER || 
                progress.state === JobState.CANCELLED || progress.state === JobState.FAILED) {
                break;
            }
            await sleep(10000);
        }

        jobProgress = await contextCaptureService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(100);
        expect(jobProgress.state).to.deep.equal(JobState.OVER);
        expect(jobProgress.step).to.deep.equal("");

        const jobProperties = await contextCaptureService.getJobProperties(jobId);
        expect(jobProperties.state).to.deep.equal(JobState.SUCCESS);
    });

    // Delete inputs
    it("Delete images", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactory.getToken(), imagesId);
        try {
            await rdaClient.getRealityData(await tokenFactory.getToken(), iTwinId, imagesId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete cc orientations", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactory.getToken(), ccOrientationsId);
        try {
            await rdaClient.getRealityData(await tokenFactory.getToken(), iTwinId, ccOrientationsId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete workspace", async function () {
        this.timeout(10000);
        await contextCaptureService.deleteWorkspace(workspaceId);
        try {
            await contextCaptureService.getWorkspace(workspaceId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete 3MX output", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactory.getToken(), threeMXId);
        try {
            await rdaClient.getRealityData(await tokenFactory.getToken(), iTwinId, threeMXId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    }); */
});
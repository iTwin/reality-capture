/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import path = require("path");
import * as dotenv from "dotenv";
import { BentleyError } from "@itwin/core-bentley";
import { CommonData, RDASettings, RealityDataAnalysisService } from "reality-capture";
import { RealityDataTransferNode, ReferenceTableNode } from "reality-capture-node";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality data analysis integration tests", () => {
    let iTwinId = "";
    let realityDataAnalysisService: RealityDataAnalysisService;
    let realityDataTransfer: RealityDataTransferNode;
    let references: ReferenceTableNode;
    let rdaClient: RealityDataAccessClient;
    let detectorId = "";
    let imagesId = "";
    let sceneId = "";
    let jobId = "";
    let objects2D = "";

    before(async function ()  {
        this.timeout(30000);
        dotenv.config();

        iTwinId = process.env.IMJS_PROJECT_ID ?? "";
        const clientId = process.env.IMJS_CLIENT_ID ?? "";
        const secret = process.env.IMJS_SECRET ?? "";

        const authorizationClient = new ServiceAuthorizationClient({
            clientId: clientId,
            clientSecret: secret,
            scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityDataAnalysisService.getScopes()).join(" "),
            authority: "https://ims.bentley.com",
        });

        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient);
        realityDataTransfer = new RealityDataTransferNode(authorizationClient);
        references = new ReferenceTableNode();

        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://api.bentley.com/realitydata/",
            authorizationClient: authorizationClient,
        };
        rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    });

    // Create and upload inputs
    it("Upload RDAS detector", async function () {
        this.timeout(120000);
        detectorId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../data/O2D/Coco2017_v1.19/"), 
            "SDK integration tests RDAS detector", CommonData.RealityDataType.CONTEXT_DETECTOR, iTwinId);
        expect(detectorId).is.not.undefined;
        expect(detectorId).to.have.length(36);
    });

    it("Upload RDAS images", async function () {
        this.timeout(60000);
        imagesId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../data/O2D/Images"), 
            "SDK integration tests RDAS images", CommonData.RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        expect(imagesId).is.not.undefined;
        expect(imagesId).to.have.length(36);
        references.addReference("0", imagesId);
    });

    it("Upload RDAS scene", async function () {
        this.timeout(10000);
        sceneId = await realityDataTransfer.uploadContextScene(path.resolve(__dirname, "../data/O2D/Scene"), 
            "SDK integration tests RDAS scene", iTwinId, references);
        expect(sceneId).is.not.undefined;
        expect(sceneId).to.have.length(36);
    });

    // Create & submit job
    it("Create RDAS job", async function () {
        this.timeout(10000);

        const settings = new RDASettings.O2DJobSettings();
        settings.inputs.photos = sceneId;
        settings.inputs.photoObjectDetector = detectorId;
        settings.outputs.objects2D = "objects2D";

        jobId = await realityDataAnalysisService.createJob(settings, "SDK integration tests RDAS job", iTwinId);
        expect(jobId).is.not.undefined;
        expect(jobId).to.have.length(36);
        await realityDataAnalysisService.submitJob(jobId);
    });

    // Get and monitor job
    it("Get RDAS job properties", async function () {
        const jobProperties = await realityDataAnalysisService.getJobProperties(jobId);
        expect(jobProperties.name).to.deep.equal("SDK integration tests RDAS job");
        expect(jobProperties.type).to.deep.equal("objects2D");
        expect(jobProperties.iTwinId).to.deep.equal(iTwinId);
        const o2dSettings = jobProperties.settings as RDASettings.O2DJobSettings;
        expect(o2dSettings.inputs.photos).to.deep.equal(sceneId);
        expect(o2dSettings.inputs.photoObjectDetector).to.deep.equal(detectorId);
        objects2D = o2dSettings.outputs.objects2D;
        expect(o2dSettings.outputs.objects2D).to.have.length(36);
        expect(jobProperties.id).to.deep.equal(jobId);
        expect(jobProperties.state).to.deep.equal(CommonData.JobState.ACTIVE);
    });

    it("Get cc job progress", async function () {
        this.timeout(3600000); // 60mn

        let jobProgress = await realityDataAnalysisService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(0);
        expect(jobProgress.state).to.deep.equal(CommonData.JobState.ACTIVE);
        expect(jobProgress.step).to.deep.equal("PrepareStep");

        while(true) {
            const progress = await realityDataAnalysisService.getJobProgress(jobId);
            if(progress.state === CommonData.JobState.SUCCESS || progress.state === CommonData.JobState.CANCELLED 
                || progress.state === CommonData.JobState.FAILED) {
                break;
            }
            await sleep(10000);
        }

        jobProgress = await realityDataAnalysisService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(100);
        expect(jobProgress.state).to.deep.equal(CommonData.JobState.SUCCESS);
        expect(jobProgress.step).to.deep.equal("");

        const jobProperties = await realityDataAnalysisService.getJobProperties(jobId);
        expect(jobProperties.state).to.deep.equal(CommonData.JobState.SUCCESS);
    });

    // Delete inputs
    it("Delete images", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", imagesId);
        try {
            await rdaClient.getRealityData("", iTwinId, imagesId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete scene", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", sceneId);
        try {
            await rdaClient.getRealityData("", iTwinId, sceneId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete detector", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", detectorId);
        try {
            await rdaClient.getRealityData("", iTwinId, detectorId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete objects 2D output", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", objects2D);
        try {
            await rdaClient.getRealityData("", iTwinId, objects2D);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

});
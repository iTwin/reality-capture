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
import { ClientInfo, JobState, RealityDataType } from "../CommonData";
import { RealityDataAnalysisService } from "../rdas/RealityDataAnalysisService";
import { ServiceTokenFactory } from "../TokenFactory";
import { RealityDataTransfer } from "../utils/RealityDataTransfer";
import { ReferenceTable } from "../utils/ReferenceTable";
import { O2DJobSettings } from "../rdas/Settings";
import { BentleyError } from "@itwin/core-bentley";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality data analysis integration tests", () => {
    let iTwinId = "";
    let tokenFactoryRd: ServiceTokenFactory;
    let tokenFactoryRda: ServiceTokenFactory;
    let realityDataAnalysisService: RealityDataAnalysisService;
    let realityDataTransfer: RealityDataTransfer;
    let references: ReferenceTable;
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

        const clientInfoRd: ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataTransfer.getScopes()]), 
            secret: secret, env: "qa-"};
        const clientInfoRda: ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataAnalysisService.getScopes()]), 
            secret: secret, env: "dev-"};
        tokenFactoryRd = new ServiceTokenFactory(clientInfoRd);
        tokenFactoryRda = new ServiceTokenFactory(clientInfoRda);
        await tokenFactoryRd.getToken();
        await tokenFactoryRda.getToken();
        if(!tokenFactoryRd.isOk() || !tokenFactoryRda.isOk()) {
            console.log("Can't get the access token");
            return;
        }

        realityDataAnalysisService = new RealityDataAnalysisService(tokenFactoryRda);
        realityDataTransfer = new RealityDataTransfer(tokenFactoryRd);
        references = new ReferenceTable();

        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: tokenFactoryRd.getServiceUrl() + "realitydata",
        };
        rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    });

    // Create and upload inputs
    it("Upload RDAS detector", async function () {
        this.timeout(120000);
        detectorId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../../data/O2D/Coco2017_v1.19/"), 
            "SDK integration tests RDAS detector", RealityDataType.CONTEXT_DETECTOR, iTwinId);
        expect(detectorId).is.not.undefined;
        expect(detectorId).to.have.length(36);
    });

    it("Upload RDAS images", async function () {
        this.timeout(20000);
        imagesId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../../data/O2D/Images"), 
            "SDK integration tests RDAS images", RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
        expect(imagesId).is.not.undefined;
        expect(imagesId).to.have.length(36);
        references.addReference(/* path.resolve(__dirname, "../../data/CC/Images/") */ "0", imagesId);
    });

    it("Upload RDAS scene", async function () {
        this.timeout(10000);
        sceneId = await realityDataTransfer.uploadContextScene(path.resolve(__dirname, "../../data/O2D/Scene"), 
            "SDK integration tests RDAS scene", iTwinId, references);
        expect(sceneId).is.not.undefined;
        expect(sceneId).to.have.length(36);
    });

    // Create & submit job
    it("Create RDAS job", async function () {
        this.timeout(10000);

        const settings = new O2DJobSettings();
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
        const o2dSettings = jobProperties.settings as O2DJobSettings;
        expect(o2dSettings.inputs.photos).to.deep.equal(sceneId);
        expect(o2dSettings.inputs.photoObjectDetector).to.deep.equal(detectorId);
        objects2D = o2dSettings.outputs.objects2D;
        expect(o2dSettings.outputs.objects2D).to.have.length(36);
        expect(jobProperties.id).to.deep.equal(jobId);
        expect(jobProperties.state).to.deep.equal(JobState.ACTIVE);
    });

    it("Get cc job progress", async function () {
        this.timeout(3600000); // 60mn

        let jobProgress = await realityDataAnalysisService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(0);
        expect(jobProgress.state).to.deep.equal(JobState.ACTIVE);
        expect(jobProgress.step).to.deep.equal("PrepareStep");

        while(true) {
            const progress = await realityDataAnalysisService.getJobProgress(jobId);
            if(progress.state === JobState.SUCCESS || progress.state === JobState.CANCELLED || progress.state === JobState.FAILED) {
                break;
            }
            await sleep(10000);
        }

        jobProgress = await realityDataAnalysisService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(100);
        expect(jobProgress.state).to.deep.equal(JobState.SUCCESS);
        expect(jobProgress.step).to.deep.equal("");

        const jobProperties = await realityDataAnalysisService.getJobProperties(jobId);
        expect(jobProperties.state).to.deep.equal(JobState.SUCCESS);
    });

    // Delete inputs
    it("Delete images", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactoryRd.getToken(), imagesId);
        try {
            await rdaClient.getRealityData(await tokenFactoryRd.getToken(), iTwinId, imagesId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete scene", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactoryRd.getToken(), sceneId);
        try {
            await rdaClient.getRealityData(await tokenFactoryRd.getToken(), iTwinId, sceneId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete detector", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactoryRd.getToken(), detectorId);
        try {
            await rdaClient.getRealityData(await tokenFactoryRd.getToken(), iTwinId, detectorId);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete objects 2D output", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData(await tokenFactoryRd.getToken(), objects2D);
        try {
            await rdaClient.getRealityData(await tokenFactoryRd.getToken(), iTwinId, objects2D);
        }
        catch(error: any) {
            expect(error).instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

});
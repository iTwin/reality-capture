/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { BentleyError } from "@itwin/core-bentley";
import * as dotenv from "dotenv";
import path = require("path");
import { RealityDataClientOptions, RealityDataAccessClient } from "@itwin/reality-data-client";
import { CommonData, RealityConversionService } from "@itwin/reality-capture";
import { RealityDataTransferNode, ReferenceTableNode } from "@itwin/reality-capture-node";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RCJobSettings, RCJobType } from "@itwin/reality-capture/lib/rcs/Utils";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("RealityConversion integration tests", () => {
    let realityConversionService: RealityConversionService;
    let realityDataTransfer: RealityDataTransferNode;
    let iTwinId = "";
    let lasId = "";
    let references: ReferenceTableNode;
    let rdaClient: RealityDataAccessClient;
    let jobId = "";
    let opcId = "";

    before(async function ()  {    
        this.timeout(20000);
        dotenv.config();

        iTwinId = process.env.IMJS_PROJECT_ID ?? "";
        const clientId = process.env.IMJS_CLIENT_ID ?? "";
        const secret = process.env.IMJS_SECRET ?? "";

        const authorizationClient = new ServiceAuthorizationClient({
            clientId: clientId,
            clientSecret: secret,
            scope: Array.from(RealityDataTransferNode.getScopes()).join(" ") + " " + Array.from(RealityConversionService.getScopes()).join(" "),
            authority: "https://ims.bentley.com",
        });

        realityConversionService = new RealityConversionService(authorizationClient);
        realityDataTransfer = new RealityDataTransferNode(authorizationClient);
        references = new ReferenceTableNode();

        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://api.bentley.com/realitydata/",
            authorizationClient: authorizationClient,
        };
        rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    });

    // Create and upload inputs
    it("Upload LAS", async function () {
        this.timeout(60000);
        lasId = await realityDataTransfer.uploadRealityData(path.resolve(__dirname, "../data/RCS/LAS/"), 
            "SDK integration tests RCS LAS", CommonData.RealityDataType.LAS, iTwinId);
        expect(lasId).is.not.undefined;
        expect(lasId).to.have.length(36);
        references.addReference("0", lasId);
    });

    // Create & submit job
    it("Create CC job", async function () {
        this.timeout(10000);
        const settings = new RCJobSettings();
        settings.inputs.las = [lasId];
        settings.outputs.opc = true;
        jobId = await realityConversionService.createJob(settings, "SDK integration tests RCS job", iTwinId, RCJobType.Conversion);
        expect(jobId).is.not.undefined;
        expect(jobId).to.have.length(36);
        await realityConversionService.submitJob(jobId);
    });

    // Get and monitor job
    it("Get CC job properties", async function () {
        this.timeout(10000);
        const jobProperties = await realityConversionService.getJobProperties(jobId);
        expect(jobProperties.name).to.deep.equal("SDK integration tests RCS job");
        expect(jobProperties.type).to.deep.equal(RCJobType.Conversion);
        expect(jobProperties.iTwinId).to.deep.equal(iTwinId);
        expect(jobProperties.settings.inputs.las).to.have.length(1);
        expect(jobProperties.settings.inputs.las[0]).to.deep.equal(lasId);
        opcId = (jobProperties.settings.outputs.opc as string[])[0];
        expect(opcId).to.have.length(36);
        expect(jobProperties.id).to.deep.equal(jobId);
        expect(jobProperties.state).to.deep.equal(CommonData.JobState.ACTIVE);
    });

    it("Get rcs job progress", async function () {
        this.timeout(10000);
        let jobProgress = await realityConversionService.getJobProgress(jobId);
        expect(jobProgress.progress).to.equal(0);
        expect(jobProgress.state).to.deep.equal(CommonData.JobState.ACTIVE);
        expect(jobProgress.step).to.deep.equal("PrepareStep");
    });

    // Delete inputs
    it("Delete las", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", lasId);
        try {
            await rdaClient.getRealityData("", iTwinId, lasId);
        }
        catch(error: any) {
            expect(error).to.be.instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });

    it("Delete OPC output", async function () {
        this.timeout(10000);
        await rdaClient.deleteRealityData("", opcId);
        try {
            await rdaClient.getRealityData("", iTwinId, opcId);
        }
        catch(error: any) {
            expect(error).to.be.instanceOf(BentleyError);
            expect((error as BentleyError).errorNumber).to.equal(404);
        }
    });
});
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import * as dotenv from "dotenv";
import { BentleyError } from "@itwin/core-bentley";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import axios, { AxiosError, AxiosResponse } from "axios";
import MockAdapter from "axios-mock-adapter";
import { JobState } from "@itwin/reality-capture-common";
import { RealityConversionService } from "./RealityConversionService";
import { RCJobSettings, RCJobType } from "./Utils";
import path from "path";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality conversion unit tests", () => {
    let iTwinId = "c3739cf2-9da3-487b-b03d-f58c8eb97e5b";
    const serviceUrl = "https://api.bentley.com/realityconversion";
    let realityConversionService: RealityConversionService;
    let axiosMock = new MockAdapter(axios);
    let authorizationClient: ServiceAuthorizationClient;

    before(async function ()  {
        this.timeout(30000);
        dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

        iTwinId = process.env.IMJS_UNIT_TESTS_PROJECT_ID ?? "";
        const clientId = process.env.UNIT_TESTS_IMJS_CLIENT_ID ?? "";
        const secret = process.env.UNIT_TESTS_IMJS_SECRET ?? "";
        authorizationClient = new ServiceAuthorizationClient({
            clientId: clientId,
            clientSecret: secret,
            scope: Array.from(RealityConversionService.getScopes()).join(" "),
            authority: "https://ims.bentley.com",
        });

        realityConversionService = new RealityConversionService(authorizationClient);
    });

    beforeEach(async function () {
        axiosMock = new MockAdapter(axios);
    });

    afterEach(async function () {
        axiosMock.resetHistory();
    });

    describe("Create job", () => {
        it("Create valid job", async function () {
            this.timeout(2500);

            axiosMock.onPost(serviceUrl + "/jobs", {
                "type": "Conversion",
                "name": "Reality Conversion unit test",
                "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                "inputs": [{"type": "LAS", "id": "lasId"}, {"type": "LAZ", "id": "lazId"}, {"type": "PLY", "id": "plyId"}, {"type": "E57", "id": "e57Id"}],
                "outputs": ["OPC"],
                "options": {
                    "processingEngines": 8,               
                },
            }).reply(201, 
                {
                    "job": {
                        "id": "cc3d35cc-416a-4262-9714-b359da70b419",
                        "name": "Reality Conversion unit test",
                        "type": "Conversion",
                        "state": "unsubmitted",
                        "createdDateTime": "2023-04-13T14:13:27Z",
                        "lastModifiedDateTime": "2023-04-13T14:29:55Z",
                        "iTwinId": "510cd1a3-3703-4729-b08c-fecd9c87c3be",
                        "dataCenter": "East US",
                        "inputs": [{"type": "LAS", "id": "lasId"}, {"type": "LAZ", "id": "lazId"}, {"type": "PLY", "id": "plyId"}, {"type": "E57", "id": "e57Id"}],
                        "outputs": [{"format": "OPC", "id": "OPCId"}],
                        "options": {
                            "processingEngines": 8
                        },
                    }
                });

            const rcSettings = new RCJobSettings();
            rcSettings.inputs.e57 = ["e57Id"];
            rcSettings.inputs.las = ["lasId"];
            rcSettings.inputs.laz = ["lazId"];
            rcSettings.inputs.ply = ["plyId"];
            rcSettings.outputs.opc = true;
            rcSettings.options.engines = 8;
            const jobName = "Reality Conversion unit test";
                        
            const id = realityConversionService.createJob(rcSettings, jobName, iTwinId);
            await sleep(2000);

            if(axiosMock.history.post.length === 0)
                return expect(axiosMock.history.post.length).equal(1, "Mock adapter has not been called as expected.");

            const body = JSON.parse(axiosMock.history.post[0].data);
            return Promise.all([         
                expect(body).to.have.property("type", "Conversion"),
                expect(body).to.have.property("name", "Reality Conversion unit test"),
                expect(body).to.have.property("inputs"),
                expect(body.inputs).to.have.length.above(0),
                expect(body.inputs).to.deep.include({"type": "LAS", "id": "lasId"}),
                expect(body.inputs).to.deep.include({"type": "LAZ", "id": "lazId"}),
                expect(body.inputs).to.deep.include({"type": "PLY", "id": "plyId"}),
                expect(body.inputs).to.deep.include({"type": "E57", "id": "e57Id"}),
                expect(body).to.have.property("outputs"),
                expect(body.outputs).to.have.length.above(0),
                expect(body.outputs).to.deep.include("OPC"),
                expect(body).to.have.property("options"),
                expect(body.options).to.have.property("processingEngines", 8),
                expect(id).to.eventually.deep.equal("cc3d35cc-416a-4262-9714-b359da70b419"),
            ]);
        });
    
    });

    describe("Private submit request", () => {
        it("Get", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id1").reply(200, { });
            const res = (realityConversionService as any).submitRequest("jobs/id1", "GET", [200]);
            await sleep(500);
            
            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({});
        });

        it("Invalid method", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id2").reply(200, { });
            const res = (realityConversionService as any).submitRequest("jobs/id2", "INVALID", [200]);

            return expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Wrong request method");
        });

        it("Wrong response code", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id3").reply(201, { });
            const res = (realityConversionService as any).submitRequest("jobs/id3", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 201);
        });

        it("Axios error", async function () {
            const axiosResponse = {data: {error: {message: "Axios error"}}, status: 404, statusText: "404"} as AxiosResponse<any>;
            axiosMock.onGet(serviceUrl + "/jobs/id4").reply(() => Promise.reject(new AxiosError("Axios error", "404", undefined, undefined, axiosResponse)));
            const res = (realityConversionService as any).submitRequest("jobs/id4", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return Promise.all([
                expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404),
                expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Axios error"),
            ]);
        });

        it("Bentley error", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id5").reply(() => Promise.reject(new BentleyError(404, "Bentley Error")));
            const res = (realityConversionService as any).submitRequest("jobs/id5", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return Promise.all([
                expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404),
                expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Bentley Error"),
            ]);
        });
    });

    describe("Submit job", () => {
        it("Submit valid job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "active"}).reply(200, { });
            const res = realityConversionService.submitJob("validId");
            await sleep(500);

            if(axiosMock.history.patch.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Cancel", () => {
        it("Cancel existing job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "cancelled"}).reply(200, { });
            const res = realityConversionService.cancelJob("validId");
            await sleep(500);

            if(axiosMock.history.patch.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Delete", () => {
        it("Delete existing job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/validId").reply(204, { });
            const res = realityConversionService.deleteJob("validId");
            await sleep(500);

            if(axiosMock.history.delete.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Get job progress", () => {
        it("Get active job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/validId/progress").reply(200, {"progress": {"percentage": 56, "state": "active", "step": "Run_Production"}});
            const res = realityConversionService.getJobProgress("validId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.ACTIVE, progress: 56, step: "Run_Production" });
        });

        it("Get failed job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/failedId/progress").reply(200, {"progress": {"percentage": 3, "state": "failed", "step": "Prepare_Step"}});
            const res = realityConversionService.getJobProgress("failedId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.FAILED, progress: 3, step: "Prepare_Step" });
        });

        it("Get success job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/successId/progress").reply(200, {"progress": {"percentage": 100, "state": "success", "step": "Final_Step"}});
            const res = realityConversionService.getJobProgress("successId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.SUCCESS, progress: 100, step: "Final_Step" });
        });

        it("Get cancelled job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/cancelId/progress").reply(200, {"progress": {"percentage": 3, "state": "cancelled", "step": "Prepare_Step"}});
            const res = realityConversionService.getJobProgress("cancelId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.CANCELLED, progress: 3, step: "Prepare_Step" });
        });

    });

    describe("Get job properties", () => {
        it("Get job properties", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/rcJob").reply(200, 
                {
                    "job": {
                        "id": "cc3d35cc-416a-4262-9714-b359da70b419",
                        "name": "Reality Conversion unit test",
                        "type": "Conversion",
                        "state": "unsubmitted",
                        "createdDateTime": "2023-04-13T14:13:27Z",
                        "lastModifiedDateTime": "2023-04-13T14:29:55Z",
                        "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                        "dataCenter": "East US",
                        "inputs": [{"type": "LAS", "id": "lasId"}, {"type": "LAZ", "id": "lazId"}, {"type": "PLY", "id": "plyId"}, {"type": "E57", "id": "e57Id"}],
                        "outputs": [{
                            "format": "OPC", "id": "opcId"
                        }],
                        "options": {
                            "processingEngines": 8
                        },
                        "costEstimation": {
                            "estimatedCost": 3.5,
                            "gigaPixels": 2.1,
                            "megaPoints": 1.5
                        }
                    }
                });
            const properties = realityConversionService.getJobProperties("rcJob");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return Promise.all([
                expect(properties).to.eventually.have.property("id", "cc3d35cc-416a-4262-9714-b359da70b419"),
                expect(properties).to.eventually.have.property("name", "Reality Conversion unit test"),
                expect(properties).to.eventually.have.property("type", RCJobType.Conversion),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.property("iTwinId", "c3739cf2-9da3-487b-b03d-f58c8eb97e5b"),

                expect(properties).to.eventually.have.property("settings").that.has.property("inputs").that.has.property("laz").to.deep.include("lazId"),
                expect(properties).to.eventually.have.property("settings").that.has.property("inputs").that.has.property("las").to.deep.include("lasId"),
                expect(properties).to.eventually.have.property("settings").that.has.property("inputs").that.has.property("ply").to.deep.include("plyId"),
                expect(properties).to.eventually.have.property("settings").that.has.property("inputs").that.has.property("e57").to.deep.include("e57Id"),
                expect(properties).to.eventually.have.property("settings").that.has.property("outputs").that.has.property("opc").to.deep.include("opcId"),
                expect(properties).to.eventually.have.property("settings").that.has.property("options").that.has.property("engines", 8),

                expect(properties).to.eventually.have.deep.property("costEstimationParameters", {
                    estimatedCost: 3.5,
                    gigaPixels: 2.1,
                    megaPoints: 1.5,
                }),
            ]);
        });
    });

    describe("Get estimated cost", () => {
        it("Get estimated cost", async function () {
            const body = {
                gigaPixels: 2.1,
                megaPoints: 1.5,
            };
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {
                costEstimationParameters: {
                    gigaPixels: 2.1,
                    megaPoints: 1.5,
                }
            }).reply(200, {
                "estimatedCost": 3.5
            });
            return expect(realityConversionService.getJobEstimatedCost("validId", body)).to.eventually.equal(3.5);
        });
    
    });

});
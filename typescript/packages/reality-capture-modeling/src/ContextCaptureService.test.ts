/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import axios, { AxiosError, AxiosResponse } from "axios";
import MockAdapter from "axios-mock-adapter";
import { ContextCaptureService } from "./ContextCaptureService";
import { CCJobQuality, CCJobSettings, CCJobType } from "./Utils";
import { JobState } from "@itwin/reality-capture-common";
import path from "path";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Modeling unit tests", () => {
    const serviceUrl = "https://api.bentley.com/contextcapture";
    let contextCaptureService: ContextCaptureService;
    let axiosMock = new MockAdapter(axios);
    let authorizationClient: ServiceAuthorizationClient;

    before(async function ()  {
        this.timeout(30000);
        dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });

        const clientId = process.env.IMJS_UNIT_TESTS_CLIENT_ID ?? "";
        const secret = process.env.IMJS_UNIT_TESTS_SECRET ?? "";
        authorizationClient = new ServiceAuthorizationClient({
            clientId: clientId,
            clientSecret: secret,
            scope: Array.from(ContextCaptureService.getScopes()).join(" "),
            authority: "https://ims.bentley.com",
        });

        contextCaptureService = new ContextCaptureService(authorizationClient.getAccessToken.bind(authorizationClient));
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
                "type": "Full",
                "inputs": [{"id": "imagesId"},{"id": "ccOrientationsId"}],
                "name": "Reality Modeling unit test job",
                "settings": {   
                    "outputs": ["OPC", "CCOrientations"],               
                    "cacheSettings": { "createCache": true, "useCache": "useCache" },
                    "quality": "Extra",
                    "processingEngines": 5
                },
                "workspaceId": "workspaceId"
            }).reply(201, 
                {
                    "job": {
                        "id": "cc3d35cc-416a-4262-9714-b359da70b419",
                        "name": "Reality Modeling unit test job",
                        "type": "Full",
                        "state": "unsubmitted",
                        "createdDateTime": "2023-04-05T14:29:55Z",
                        "lastModifiedDateTime": "2023-04-05T14:29:55Z",
                        "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                        "location": "East US",
                        "email": "example@bentley.com",
                        "workspaceId": "workspaceId",
                        "inputs": [{"id": "imagesId"},{"id": "ccOrientationsId"}],
                        "jobSettings": {
                            "quality": "Extra",
                            "outputs": [{
                                "format": "OPC",
                                "id": "opcId"
                            },
                            {
                                "format": "CCOrientations",
                                "id": "orientationsId"
                            }
                            ],
                            "processingEngines": 5,
                            "cacheSettings": {
                                "createCache": true,
                                "useCache": "799b11bd-71cf-481a-b284-bf48f672cd9a"
                            }
                        }
                    }
                });

            const ccSettings = new CCJobSettings();
            ccSettings.inputs = ["imagesId", "ccOrientationsId"];
            ccSettings.outputs.opc = "opc";
            ccSettings.outputs.orientations = "orientations";
            ccSettings.engines = 5;
            ccSettings.meshQuality = CCJobQuality.EXTRA;
            ccSettings.cacheSettings = {
                useCache: "useCache",
                createCache: true
            };
            const jobName = "Reality Modeling unit test job";
                        
            const id = contextCaptureService.createJob(CCJobType.FULL, ccSettings, jobName, "workspaceId");
            await sleep(2000);

            if(axiosMock.history.post.length === 0)
                return expect(axiosMock.history.post.length).equal(1, "Mock adapter has not been called as expected.");

            const body = JSON.parse(axiosMock.history.post[0].data);
            return Promise.all([         
                expect(body).to.have.property("type", "Full"),
                expect(body).to.have.property("name", "Reality Modeling unit test job"),
                expect(body).to.have.property("workspaceId", "workspaceId"),
                expect(body).to.have.property("inputs"),
                expect(body.inputs).to.have.length.above(0),
                expect(body.inputs).to.deep.include({"id": "imagesId"}),
                expect(body.inputs).to.deep.include({"id": "ccOrientationsId"}),
                expect(body.settings).to.have.property("quality", "Extra"),
                expect(body.settings).to.have.property("processingEngines", 5),
                expect(body.settings.outputs).to.have.length.above(0),
                expect(body.settings.outputs).to.deep.include("OPC"),
                expect(body.settings.outputs).to.deep.include("CCOrientations"),
                expect(id).to.eventually.deep.equal("cc3d35cc-416a-4262-9714-b359da70b419"),
            ]);
        });
    
    });

    describe("Private submit request", () => {
        it("Get", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id1").reply(200, { });
            const res = (contextCaptureService as any).submitRequest("jobs/id1", "GET", [200]);
            await sleep(500);
            
            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({});
        });

        it("Invalid method", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id2").reply(200, { });
            const res = (contextCaptureService as any).submitRequest("jobs/id2", "INVALID", [200]);

            return expect(res).to.eventually.be.rejectedWith(Error).and.have.property("message", "Wrong request method");
        });

        it("Wrong response code", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id3").reply(201, { });
            const res = (contextCaptureService as any).submitRequest("jobs/id3", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.be.rejectedWith(Error).and.have.property("message", "Wrong request response code, expected : 200");
        });

        it("Axios error", async function () {
            const axiosResponse = {data: {error: {message: "Axios error"}}, status: 404, statusText: "404"} as AxiosResponse<any>;
            axiosMock.onGet(serviceUrl + "/jobs/id4").reply(() => Promise.reject(new AxiosError("Axios error", "404", undefined, undefined, axiosResponse)));
            const res = (contextCaptureService as any).submitRequest("jobs/id4", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.be.rejectedWith(Error).and.have.property("message", "Axios error");
        });

        it("Error", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id5").reply(() => Promise.reject(new Error("Error")));
            const res = (contextCaptureService as any).submitRequest("jobs/id5", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.be.rejectedWith(Error).and.have.property("message", "Error");
        });

    });

    describe("Create workspace", () => {
        it("Create workspace", async function () {
            const body: any = {
                "name": "Unit tests workspace name",
                "iTwinId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "contextCaptureVersion": "20.1"
            };
            axiosMock.onPost(serviceUrl + "/workspaces", body).reply(201, {
                "workspace": {
                    "id": "e47cf092-729a-4ce2-b20e-9b01ad820cdb",
                    "createdDateTime": "2023-04-07T09:39:23.436Z",
                    "name": "Unit tests workspace name",
                    "iTwinId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "contextCaptureVersion": "20.1"
                }
            });
            const res = contextCaptureService.createWorkspace("Unit tests workspace name", "3fa85f64-5717-4562-b3fc-2c963f66afa6", "20.1");
            await sleep(500);

            if(axiosMock.history.post.length === 0)
                return expect(axiosMock.history.post.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal("e47cf092-729a-4ce2-b20e-9b01ad820cdb");
        });
    });

    describe("Delete workspace", () => {
        it("Delete workspace", async function () {
            axiosMock.onDelete(serviceUrl + "/workspaces/workspace").reply(204, { });
            const res = contextCaptureService.deleteWorkspace("workspace");
            await sleep(500);

            if(axiosMock.history.delete.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });

    });

    describe("Get workspace", () => {
        it("Get workspace", async function () {
            axiosMock.onGet(serviceUrl + "/workspaces/workspace").reply(200, {
                "workspace": {
                    "id": "e47cf092-729a-4ce2-b20e-9b01ad820cdb",
                    "createdDateTime": "2023-04-07T09:39:23.436Z",
                    "name": "Unit tests workspace name",
                    "iTwinId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "contextCaptureVersion": "20.1"
                }
            });
            const workspace = contextCaptureService.getWorkspace("workspace");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return Promise.all([
                expect(workspace).to.eventually.have.property("id", "e47cf092-729a-4ce2-b20e-9b01ad820cdb"),
                expect(workspace).to.eventually.have.property("createdDateTime", "2023-04-07T09:39:23.436Z"),
                expect(workspace).to.eventually.have.property("name", "Unit tests workspace name"),
                expect(workspace).to.eventually.have.property("iTwinId", "3fa85f64-5717-4562-b3fc-2c963f66afa6"),
                expect(workspace).to.eventually.have.property("contextCaptureVersion", "20.1"),
            ]);
        });

    });

    describe("Submit job", () => {
        it("Submit valid job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "active"}).reply(200, { });
            const res = contextCaptureService.submitJob("validId");
            await sleep(500);

            if(axiosMock.history.patch.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Cancel", () => {
        it("Cancel existing job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "cancelled"}).reply(200, { });
            const res = contextCaptureService.cancelJob("validId");
            await sleep(500);

            if(axiosMock.history.patch.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Delete", () => {
        it("Delete existing job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/validId").reply(204, { });
            const res = contextCaptureService.deleteJob("validId");
            await sleep(500);

            if(axiosMock.history.delete.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });

    });

    describe("Get job progress", () => {
        it("Get active job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/validId/progress").reply(200, {"jobProgress": {"percentage": 56, "state": "active", "step": "Run_Production"}});
            const res = contextCaptureService.getJobProgress("validId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.ACTIVE, progress: 56, step: "Run_Production" });
        });

        it("Get failed job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/failedId/progress").reply(200, {"jobProgress": {"percentage": 3, "state": "failed", "step": "Prepare_Step"}});
            const res = contextCaptureService.getJobProgress("failedId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.FAILED, progress: 3, step: "Prepare_Step" });
        });

        it("Get success job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/successId/progress").reply(200, {"jobProgress": {"percentage": 100, "state": "success", "step": "Final_Step"}});
            const res = contextCaptureService.getJobProgress("successId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.SUCCESS, progress: 100, step: "Final_Step" });
        });

        it("Get cancelled job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/cancelId/progress").reply(200, {"jobProgress": {"percentage": 3, "state": "cancelled", "step": "Prepare_Step"}});
            const res = contextCaptureService.getJobProgress("cancelId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.CANCELLED, progress: 3, step: "Prepare_Step" });
        });

        it("Get over job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/overId/progress").reply(200, {"jobProgress": {"percentage": 100, "state": "over", "step": "Final_Step"}});
            const res = contextCaptureService.getJobProgress("overId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.OVER, progress: 100, step: "Final_Step" });
        });

    });

    describe("Get job properties", () => {
        it("Get job properties", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/ccJob").reply(200, 
                {
                    "job": {
                        "id": "cc3d35cc-416a-4262-9714-b359da70b419",
                        "name": "Reality Modeling unit test job",
                        "type": "Full",
                        "state": "unsubmitted",
                        "createdDateTime": "2023-04-05T14:29:55Z",
                        "lastModifiedDateTime": "2023-04-05T14:29:55Z",
                        "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                        "location": "East US",
                        "email": "example@bentley.com",
                        "workspaceId": "workspaceId",
                        "costEstimationParameters": {
                            "gigaPixels": 2.1,
                            "megaPoints": 1.5,
                            "meshQuality": "Extra"
                        },
                        "executionInformation": {
                            "submittedDateTime": "2023-03-30T15:14:57Z",
                            "startedDateTime": "2023-03-30T15:22:11Z",
                            "endedDateTime": "2023-03-30T15:39:47Z",
                            "estimatedUnits": 2,
                            "warnings": [{
                                "code": "400",
                                "title": "Warning",
                                "message": "This is an warning",
                                "params": ["param1", "param2"]
                            }],
                            "errors": [{
                                "code": "400",
                                "title": "Error",
                                "message": "This is an error",
                                "params": ["param1", "param2"]
                            }]
                        },
                        "inputs": [{"id": "imagesId"},{"id": "ccOrientationsId"}],
                        "jobSettings": {
                            "quality": "Extra",
                            "outputs": [{
                                "format": "OPC",
                                "id": "opcId"
                            },
                            {
                                "format": "CCOrientations",
                                "id": "orientationsId"
                            }
                            ],
                            "processingEngines": 5,
                            "cacheSettings": {
                                "createCache": true,
                                "useCache": "799b11bd-71cf-481a-b284-bf48f672cd9a"
                            }
                        }
                    }
                });
            const properties = contextCaptureService.getJobProperties("ccJob");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return Promise.all([
                expect(properties).to.eventually.have.property("name", "Reality Modeling unit test job"),
                expect(properties).to.eventually.have.property("type", CCJobType.FULL),
                expect(properties).to.eventually.have.property("iTwinId", "c3739cf2-9da3-487b-b03d-f58c8eb97e5b"),
                expect(properties).to.eventually.have.property("id", "cc3d35cc-416a-4262-9714-b359da70b419"),
                expect(properties).to.eventually.have.property("email", "example@bentley.com"),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),

                expect(properties).to.eventually.have.deep.property("dates", {
                    createdDateTime: "2023-04-05T14:29:55Z",
                    submissionDateTime: "2023-03-30T15:14:57Z",
                    startedDateTime: "2023-03-30T15:22:11Z",
                    endedDateTime: "2023-03-30T15:39:47Z"
                }),
                expect(properties).to.eventually.have.property("executionCost", 2),
                
                expect(properties).to.eventually.have.property("settings").that.has.property("meshQuality").to.deep.equal("Extra"),
                expect(properties).to.eventually.have.property("settings").that.has.property("engines").to.deep.equal(5),
                expect(properties).to.eventually.have.property("settings").that.has.property("cacheSettings").that.has.property("createCache").to.deep.equal(true),
                expect(properties).to.eventually.have.property("settings").that.has.property("cacheSettings").that.has.property("useCache").to.deep.equal("799b11bd-71cf-481a-b284-bf48f672cd9a"),
                expect(properties).to.eventually.have.property("settings").that.has.property("outputs").that.has.property("orientations").to.deep.equal("orientationsId"),
                expect(properties).to.eventually.have.property("settings").that.has.property("outputs").that.has.property("opc").to.deep.equal("opcId"),
                expect(properties).to.eventually.have.deep.property("costEstimationParameters", {
                    gigaPixels: 2.1,
                    megaPoints: 1.5,
                    meshQuality: "Extra",
                }),
            ]);
        });
    });

    describe("Get estimated cost", () => {
        it("Get estimated cost", async function () {
            const body = {
                gigaPixels: 2,
                megaPoints: 150,
                meshQuality: CCJobQuality.EXTRA,
            };
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {
                costEstimationParameters: {
                    gigaPixels: 2,
                    megaPoints: 150,
                    meshQuality: "Extra",
                }
            }).reply(200, {
                "estimatedCost": 2.1
            });
            return expect(contextCaptureService.getJobEstimatedCost("validId", body)).to.eventually.equal(2.1);
        });
    
    });

});
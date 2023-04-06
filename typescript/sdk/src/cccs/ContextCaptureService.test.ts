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
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ContextCaptureService } from "../reality-capture";
import { CCJobQuality, CCJobSettings, CCJobType } from "./Utils";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Context capture unit tests", () => {
    let iTwinId = "";
    let serviceUrl = "https://api.bentley.com/contextcapture"
    let contextCaptureService: ContextCaptureService;
    let axiosMock = new MockAdapter(axios);
    let authorizationClient: ServiceAuthorizationClient;

    before(async function ()  {
        this.timeout(30000);
        dotenv.config();

        iTwinId = process.env.IMJS_PROJECT_ID ?? "";
        const clientId = process.env.IMJS_CLIENT_ID ?? "";
        const secret = process.env.IMJS_SECRET ?? "";
        const authority = process.env.IMJS_ISSUER_URL ?? "";

        authorizationClient = new ServiceAuthorizationClient({
            clientId: clientId,
            clientSecret: secret,
            scope: Array.from(ContextCaptureService.getScopes()).join(" "),
            authority: authority,
        });

        contextCaptureService = new ContextCaptureService(authorizationClient);
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
                "name": "Context capture unit test job",
                "inputs": [{"id": "imagesId"},{"id": "ccOrientationsId"}],
                "workspaceId": "workspaceId",
                "settings": {
                    "quality": "Extra",
                    "processingEngines": 5,
                    "outputs": [
                        "OPC", "CCOrientations"
                    ]
                }
            }).reply(201, 
            {
                "job": {
                    "id": "cc3d35cc-416a-4262-9714-b359da70b419",
                    "name": "Context capture unit test job",
                    "type": "Full",
                    "state": "unsubmitted",
                    "createdDateTime": "2023-04-05T14:29:55Z",
                    "lastModifiedDateTime": "2023-04-05T14:29:55Z",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                    "location": "East US",
                    "email": "example@example.com",
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
            const jobName = "Context capture unit test job";
                        
            const id = contextCaptureService.createJob(CCJobType.FULL, ccSettings, jobName, "workspaceId");
            await sleep(2000);

            if(axiosMock.history.post.length === 0)
                return expect(axiosMock.history.post.length).equal(1, "Mock adapter has not been called as expected.");

            const body = JSON.parse(axiosMock.history.post[0].data);
            return Promise.all([         
                expect(body).to.have.property("type", "Full"),
                expect(body).to.have.property("name", "Context capture unit test job"),
                expect(body).to.have.property("workspaceId", "workspaceId"),
                expect(body).to.have.property("inputs"),
                expect(body.inputs).to.have.length.above(0),
                expect(body.inputs).to.deep.include({"id": "imagesId"}),
                expect(body.inputs).to.deep.include({"id": "ccOrientationsId"}),
                expect(body.settings).to.have.property("quality", "Extra"),
                expect(body.settings).to.have.property("processingEngines", 5),
                expect(body.settings.outputs).to.have.length.above(0),
                expect(body.inputs).to.deep.include("OPC"),
                expect(body.inputs).to.deep.include("CCOrientations"),
                expect(id).to.eventually.deep.equal("cc3d35cc-416a-4262-9714-b359da70b419"),
            ]);
        });
    
    });

    /*describe("Private submit request", () => {
        it("Get", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id1").reply(200, { });
            const res = (realityDataAnalysisService as any).submitRequest("jobs/id1", "GET", [200]);
            await sleep(500);
            
            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({});
        });

        it("Invalid method", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id2").reply(200, { });
            const res = (realityDataAnalysisService as any).submitRequest("jobs/id2", "INVALID", [200]);

            return expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Wrong request method");
        });

        it("Wrong response code", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/id3").reply(404, { });
            const res = (realityDataAnalysisService as any).submitRequest("jobs/id3", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404);
        });

    });

    describe("Submit job", () => {
        it("Submit valid job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "active"}).reply(200, { });
            const res = realityDataAnalysisService.submitJob("validId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Cancel", () => {
        it("Cancel existing job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "cancelled"}).reply(200, { });
            const res = realityDataAnalysisService.cancelJob("validId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Delete", () => {
        it("Delete existing job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/validId").reply(204, { });
            const res = realityDataAnalysisService.deleteJob("validId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });

    });

    describe("Get job progress", () => {
        it("Get active job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/validId/progress").reply(200, {"progress": {"percentage": 56, "state": "active", "step": "Run_Production"}});
            const res = realityDataAnalysisService.getJobProgress("validId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.ACTIVE, progress: 56, step: "Run_Production" });
        });

        it("Get failed job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/failedId/progress").reply(200, {"progress": {"percentage": 3, "state": "failed", "step": "Prepare_Step"}});
            const res = realityDataAnalysisService.getJobProgress("failedId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.FAILED, progress: 3, step: "Prepare_Step" });
        });

        it("Get success job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/successId/progress").reply(200, {"progress": {"percentage": 100, "state": "success", "step": "Final_Step"}});
            const res = realityDataAnalysisService.getJobProgress("successId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.SUCCESS, progress: 100, step: "Final_Step" });
        });

        it("Get cancelled job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/cancelId/progress").reply(200, {"progress": {"percentage": 3, "state": "cancelled", "step": "Prepare_Step"}});
            const res = realityDataAnalysisService.getJobProgress("cancelId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.CANCELLED, progress: 3, step: "Prepare_Step" });
        });

    });

    describe("Get job properties", () => {
        it("O2D job with cost estimation and execution information", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/o2d").reply(200, 
            {
                "job": {
                    "state": "success",
                    "settings": {
                        "outputs": [{
                            "name": "objects2D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "photos",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "photoObjectDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ]
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "lastModifiedDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "example@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "objects2D",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                    "costEstimation": {
                        "gigaPixels": 2,
                        "sceneWidth": 4.5,
                        "sceneHeight": 3.0,
                        "sceneLength": 1.7,
                        "detectorScale": 1.2,
                        "detectorCost": 1.4,
                        "numberOfPhotos": 150,
                        "estimatedCost": 2.1
                    },
                    "executionInformation": {
                        "exitCode": 0,
                        "submissionDateTime": "2023-03-30T15:14:57Z",
                        "startedDateTime": "2023-03-30T15:22:11Z",
                        "endedDateTime": "2023-03-30T15:39:47Z",
                        "estimatedUnits": 0
                    },
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("o2d");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");
            
            return Promise.all([
                expect(properties).to.eventually.have.property("name", "SDK unit test"),
                expect(properties).to.eventually.have.property("type", RDAJobType.O2D), // Other types are tested in Settings unit tests
                expect(properties).to.eventually.have.property("iTwinId", "c3739cf2-9da3-487b-b03d-f58c8eb97e5b"),
                expect(properties).to.eventually.have.property("id", "6f51448f-6377-4330-9ab0-f13fe994b3f1"),
                expect(properties).to.eventually.have.property("email", "example@bentley.com"),
                expect(properties).to.eventually.have.property("state", JobState.SUCCESS),
                expect(properties).to.eventually.have.property("dataCenter", "EastUs"),
                expect(properties).to.eventually.have.property("exitCode", 0),
                expect(properties).to.eventually.have.property("executionCost", 0),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(O2DJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "objects2D",
                    inputs: {
                        photos: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        photoObjectDetector: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                    },
                    outputs: {
                        objects2D: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                    },
                }),
                expect(properties).to.eventually.have.deep.property("dates", {
                    createdDateTime: "2023-03-30T15:14:55Z",
                    submissionDateTime: "2023-03-30T15:14:57Z",
                    startedDateTime: "2023-03-30T15:22:11Z",
                    endedDateTime: "2023-03-30T15:39:47Z"
                }),
                expect(properties).to.eventually.have.deep.property("costEstimation", {
                    gigaPixels: 2,
                    numberOfPhotos: 150,
                    sceneWidth: 4.5,
                    sceneHeight: 3.0,
                    sceneLength: 1.7,
                    detectorScale: 1.2,
                    detectorCost: 1.4,
                    estimatedCost: 2.1
                }),
            ]);
        });

        it("Properties with invalid settings type", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/invalid").reply(200, 
            {
                "job": {
                    "state": "success",
                    "settings": {
                        "outputs": [{
                            "name": "objects2D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "photos",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "photoObjectDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ]
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "lastModifiedDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "example@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "invalidJobType",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("invalid");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.delete.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(properties).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Can't get job properties of unknown type : invalidJobType");
        });
    });

    describe("Get estimated cost", () => {
        it("Get estimated cost", async function () {
            const body = {
                gigaPixels: 2,
                numberOfPhotos: 150,
                sceneWidth: 4.5,
                sceneHeight: 3,
                sceneLength: 1.7,
                detectorScale: 1.2,
                detectorCost: 1.4,
            };
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {
                costEstimationParameters: {
                    gigaPixels: 2,
                    numberOfPhotos: 150,
                    sceneWidth: 4.5,
                    sceneHeight: 3,
                    sceneLength: 1.7,
                    detectorScale: 1.2,
                    detectorCost: 1.4,
                }
            }).reply(200, {
                "job": {
                    "costEstimation": {
                        "gigaPixels": 2,
                        "sceneWidth": 4.5,
                        "sceneHeight": 3.0,
                        "sceneLength": 1.7,
                        "detectorScale": 1.2,
                        "detectorCost": 1.4,
                        "numberOfPhotos": 150,
                        "estimatedCost": 2.1
                    },
                }
            });
            return expect(realityDataAnalysisService.getJobEstimatedCost("validId", body)).to.eventually.equal(2.1);
        });
    
    });*/

});
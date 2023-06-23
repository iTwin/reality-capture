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
import { RealityDataAnalysisService } from "./RealityDataAnalysisService";
import axios, { AxiosError, AxiosResponse } from "axios";
import MockAdapter from "axios-mock-adapter";
import { JobState } from "../CommonData";
import { O2DJobSettings, RDAJobType } from "./Settings";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Analysis unit tests", () => {
    let iTwinId = "";
    const serviceUrl = "https://api.bentley.com/realitydataanalysis";
    let realityDataAnalysisService: RealityDataAnalysisService;
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
            scope: Array.from(RealityDataAnalysisService.getScopes()).join(" "),
            authority: authority,
        });

        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient);
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
                "type": "objects2D",
                "name": "Reality Analysis unit test",
                "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                "settings": {
                    "inputs": [{
                        "name": "photos",
                        "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                    },
                    {
                        "name": "photoObjectDetector",
                        "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                    }
                    ],
                    "outputs": ["objects2D"]
                }
            }).reply(201, 
                {
                    "job": {                  
                        "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                        "type": "objects2D",
                        "name": "Reality Analysis unit test",
                        "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                        "settings": {
                            "outputs": [{
                                "name": "objects2D",
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
                    }
                });

            const settings = new O2DJobSettings();
            settings.inputs.photos = "8e9f7e7a-f37e-4d74-a1e7-df7325944757";
            settings.inputs.photoObjectDetector = "9fbbe885-9086-4b98-b6a5-8024657bcff4";
            settings.outputs.objects2D = "objects2D";
            const jobName = "Reality Analysis unit test";
                        
            const id = realityDataAnalysisService.createJob(settings, jobName, iTwinId);
            await sleep(2000);

            if(axiosMock.history.post.length === 0)
                return expect(axiosMock.history.post.length).equal(1, "Mock adapter has not been called as expected.");

            return Promise.all([
                expect(axiosMock.history.post[0].data).deep.equal(JSON.stringify({
                    "type": "objects2D",
                    "name": "Reality Analysis unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                    "settings": {
                        "inputs": [{
                            "name": "photos",
                            "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                        },
                        {
                            "name": "photoObjectDetector",
                            "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                        }
                        ],
                        "outputs": ["objects2D"]
                    }
                })),
                expect(id).to.eventually.deep.equal("6f51448f-6377-4330-9ab0-f13fe994b3f1"),
            ]);
        });
    
    });

    describe("Private submit request", () => {
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
            axiosMock.onGet(serviceUrl + "/jobs/id3").reply(201, { });
            const res = (realityDataAnalysisService as any).submitRequest("jobs/id3", "GET", [200]);
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 201);
        });

        it("Axios error", async function () {
            const axiosResponse = {data: {error: {message: "Axios error"}}, status: 404, statusText: "404"} as AxiosResponse<any>;
            axiosMock.onGet(serviceUrl + "/jobs/id4").reply(() => Promise.reject(new AxiosError("Axios error", "404", undefined, undefined, axiosResponse)));
            const res = (realityDataAnalysisService as any).submitRequest("jobs/id4", "GET", [200]);
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
            const res = (realityDataAnalysisService as any).submitRequest("jobs/id5", "GET", [200]);
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
            const res = realityDataAnalysisService.submitJob("validId");
            await sleep(500);

            if(axiosMock.history.patch.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Cancel", () => {
        it("Cancel existing job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "cancelled"}).reply(200, { });
            const res = realityDataAnalysisService.cancelJob("validId");
            await sleep(500);

            if(axiosMock.history.patch.length === 0)
                return expect(axiosMock.history.patch.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({});
        });
    });

    describe("Delete", () => {
        it("Delete existing job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/validId").reply(204, { });
            const res = realityDataAnalysisService.deleteJob("validId");
            await sleep(500);

            if(axiosMock.history.delete.length === 0)
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
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.ACTIVE, progress: 56, step: "Run_Production" });
        });

        it("Get failed job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/failedId/progress").reply(200, {"progress": {"percentage": 3, "state": "failed", "step": "Prepare_Step"}});
            const res = realityDataAnalysisService.getJobProgress("failedId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

            return expect(res).to.eventually.deep.equal({ state: JobState.FAILED, progress: 3, step: "Prepare_Step" });
        });

        it("Get success job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/successId/progress").reply(200, {"progress": {"percentage": 100, "state": "success", "step": "Final_Step"}});
            const res = realityDataAnalysisService.getJobProgress("successId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return expect(res).to.eventually.deep.equal({ state: JobState.SUCCESS, progress: 100, step: "Final_Step" });
        });

        it("Get cancelled job progress", async function () {            
            axiosMock.onGet(serviceUrl + "/jobs/cancelId/progress").reply(200, {"progress": {"percentage": 3, "state": "cancelled", "step": "Prepare_Step"}});
            const res = realityDataAnalysisService.getJobProgress("cancelId");
            await sleep(500);

            if(axiosMock.history.get.length === 0)
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
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
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");
            
            return Promise.all([
                expect(properties).to.eventually.have.property("name", "Reality Analysis unit test"),
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
                return expect(axiosMock.history.get.length).equal(1, "Mock adapter has not been called as expected.");

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
    
    });

});
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
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { JobState } from "../CommonData";
import { RDASettings, RealityDataTransferBrowser } from "../reality-capture";
import { RDAJobType } from "./Settings";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality data analysis unit tests", () => {
    let iTwinId = "";
    let serviceUrl = "https://api.bentley.com/realitydataanalysis"
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
            scope: Array.from(RealityDataTransferBrowser.getScopes()).join(" ") + " " + Array.from(RealityDataAnalysisService.getScopes()).join(" "),
            authority: authority,
        });

        realityDataAnalysisService = new RealityDataAnalysisService(authorizationClient);
    });

    beforeEach(async function ()  {
        axiosMock = new MockAdapter(axios);
    });

    describe("Create", () => {
        it("Create valid job", async function () {
            const settings = new RDASettings.O2DJobSettings();
            settings.inputs.photos = "8e9f7e7a-f37e-4d74-a1e7-df7325944757";
            settings.inputs.photoObjectDetector = "9fbbe885-9086-4b98-b6a5-8024657bcff4";
            settings.outputs.objects2D = "objects2D";
            axiosMock.onPost(serviceUrl + "/jobs", {
                "type": "objects2D",
                "name": "SDK unit test",
                "iTwinId": iTwinId,
                "settings": {
                    "outputs": ["objects2D"],
                    "inputs": [{
                            "name": "photos",
                            "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                        },
                        {
                            "name": "photoObjectDetector",
                            "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                        }
                    ]
                }
            }).reply(201, 
            {
                "job": {                  
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "type": "objects2D",
                    "name": "SDK unit test",
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

            return expect(realityDataAnalysisService.createJob(settings, "SDK unit test", iTwinId)).to.eventually.deep.equal("6f51448f-6377-4330-9ab0-f13fe994b3f1");
        });

        it("Create job with invalid settings", async function () {
            axiosMock.onPost(serviceUrl + "/jobs").reply(422, { });
            return expect(realityDataAnalysisService.submitJob("validId")).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404);
        });
    
    });

    describe("Submit", () => {
        it("Submit valid job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "active"}).reply(200, { });
            return expect(realityDataAnalysisService.submitJob("validId")).to.eventually.deep.equal({});
        });

        it("Submit invalid job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/invalidId", {"state": "active"}).reply(404, { });
            return expect(realityDataAnalysisService.submitJob("validId")).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404);
        });
    });

    describe("Cancel", () => {
        it("Cancel existing job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/validId", {"state": "cancelled"}).reply(200, { });
            return expect(realityDataAnalysisService.cancelJob("validId")).to.eventually.deep.equal({});
        });

        it("Cancel invalid job/canceled job", async function () {
            axiosMock.onPatch(serviceUrl + "/jobs/invalidId", {"state": "cancelled"}).reply(404, { });
            return expect(realityDataAnalysisService.cancelJob("invalidId")).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404);
        });
    });

    describe("Delete", () => {
        it("Delete existing job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/validId").reply(204, { });
            return expect(realityDataAnalysisService.deleteJob("validId")).to.eventually.deep.equal({});
        });

        it("Delete invalid job/deleted job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/invalidId").reply(404, { });
            return expect(realityDataAnalysisService.deleteJob("invalidId")).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404);
        });

        it("Delete already submitted job", async function () {
            axiosMock.onDelete(serviceUrl + "/jobs/submittedJobId").reply(422, { });
            return expect(realityDataAnalysisService.deleteJob("submittedJobId")).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 422);
        });
    });

    describe("Get job progress", () => {
        it("Get active job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/validId/progress").reply(200, {"progress": {"percentage": 56, "state": "active", "step": "Run_Production"}});
            return expect(realityDataAnalysisService.getJobProgress("validId")).to.eventually.deep.equal({ state: JobState.ACTIVE, progress: 56, step: "Run_Production" });
        });

        it("Get failed job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/failedId/progress").reply(200, {"progress": {"percentage": 3, "state": "failed", "step": "Prepare_Step"}});
            return expect(realityDataAnalysisService.getJobProgress("failedId")).to.eventually.deep.equal({ state: JobState.FAILED, progress: 3, step: "Prepare_Step" });
        });

        it("Get success job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/successId/progress").reply(200, {"progress": {"percentage": 100, "state": "success", "step": "Final_Step"}});
            return expect(realityDataAnalysisService.getJobProgress("successId")).to.eventually.deep.equal({ state: JobState.SUCCESS, progress: 100, step: "Final_Step" });
        });

        it("Get cancelled job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/cancelId/progress").reply(200, {"progress": {"percentage": 3, "state": "cancelled", "step": "Prepare_Step"}});
            return expect(realityDataAnalysisService.getJobProgress("cancelId")).to.eventually.deep.equal({ state: JobState.CANCELLED, progress: 3, step: "Prepare_Step" });
        });

        it("get invalid job progress", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/invalidId/progress").reply(404, { });
            return expect(realityDataAnalysisService.getJobProgress("invalidId")).to.eventually.be.rejectedWith(BentleyError).and.have.property("errorNumber", 404);
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
                    "email": "denis.biguenet@bentley.com",
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
            return Promise.all([
                expect(properties).to.eventually.have.property("name", "SDK unit test"),
                expect(properties).to.eventually.have.property("type", RDAJobType.O2D),
                expect(properties).to.eventually.have.property("iTwinId", "c3739cf2-9da3-487b-b03d-f58c8eb97e5b"),
                expect(properties).to.eventually.have.property("id", "6f51448f-6377-4330-9ab0-f13fe994b3f1"),
                expect(properties).to.eventually.have.property("email", "denis.biguenet@bentley.com"),
                expect(properties).to.eventually.have.property("state", JobState.SUCCESS),
                expect(properties).to.eventually.have.property("dataCenter", "EastUs"),
                expect(properties).to.eventually.have.property("exitCode", 0),
                expect(properties).to.eventually.have.property("executionCost", 0),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.O2DJobSettings),
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

        it("O3D job", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/o3d").reply(200, 
            {
                "job": {
                    "state": "unsubmitted",
                    "settings": {
                        "outputs": [{
                            "name": "objects3D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "orientedPhotos",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "photoObjectDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ],
                        "useTiePoints": "true",
                        "minPhotos": "7",
                        "maxDist": "10",
                        "exportSrs": "EPSG:7472"
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "denis.biguenet@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "objects3D",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("o3d");
            return Promise.all([
                expect(properties).to.eventually.have.property("type", RDAJobType.O3D),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.O3DJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "objects3D",
                    inputs: {
                        meshes: "",
                        objects2D: "",
                        orientedPhotos: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        photoObjectDetector: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                        pointClouds: "",
                    },
                    outputs: {
                        exportedLocations3DSHP: "",
                        exportedObjects3DCesium: "",
                        exportedObjects3DDGN: "",
                        objects2D: "",
                        objects3D: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                    },
                    useTiePoints: true,
                    minPhotos: 7,
                    maxDist: 10,
                    exportSrs: "EPSG:7472"
                }),
            ]);
        });

        it("S2D job", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/s2d").reply(200, 
            {
                "job": {
                    "state": "unsubmitted",
                    "settings": {
                        "outputs": [{
                            "name": "segmentation2D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "photos",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "photoSegmentationDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ]
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "denis.biguenet@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "segmentation2D",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("s2d");
            return Promise.all([
                expect(properties).to.eventually.have.property("type", RDAJobType.S2D),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.S2DJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "segmentation2D",
                    inputs: {
                        orthophoto: "",
                        orthophotoSegmentationDetector: "",
                        photos: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        photoSegmentationDetector: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                    },
                    outputs: {
                        exportedLines2DDGN: "",
                        exportedLines2DSHP: "",
                        exportedPolygons2DSHP: "",
                        lines2D: "",
                        polygons2D: "",
                        segmentation2D: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                        segmentedPhotos: "",
                    },
                }),
            ]);
        });

        it("S3D job", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/s3d").reply(200, 
            {
                "job": {
                    "state": "unsubmitted",
                    "settings": {
                        "outputs": [{
                            "name": "segmentation3D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "pointClouds",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "pointCloudSegmentationDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ],
                        "saveConfidence": "true",
                        "exportSrs": "EPSG:3429"
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "denis.biguenet@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "segmentation3D",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("s3d");
            return Promise.all([
                expect(properties).to.eventually.have.property("type", RDAJobType.S3D),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.S3DJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "segmentation3D",
                    inputs: {
                        meshes: "",
                        objects2D: "",
                        orientedPhotos: "",
                        photoObjectDetector: "",
                        pointClouds: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        pointCloudSegmentationDetector: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                        segmentation3D: ""
                    },
                    outputs: {
                        exportedLocations3DSHP: "",
                        exportedObjects3DCesium: "",
                        exportedObjects3DDGN: "",
                        exportedSegmentation3DLAS: "",
                        exportedSegmentation3DLAZ: "",
                        exportedSegmentation3DPLY: "",
                        exportedSegmentation3DPOD: "",
                        objects2D: "",
                        objects3D: "",
                        segmentation3D: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                        segmentedPointCloud: "",
                    },
                    saveConfidence: true,
                    exportSrs: "EPSG:3429"
                }),
            ]);
        });

        it("L3D job", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/l3d").reply(200, 
            {
                "job": {
                    "state": "unsubmitted",
                    "settings": {
                        "outputs": [{
                            "name": "lines3D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "pointClouds",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "pointCloudSegmentationDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ],
                        "computeLineWidth": "true",
                        "removeSmallComponents": "2",
                        "exportSrs": "EPSG:3429"
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "denis.biguenet@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "lines3D",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("l3d");
            return Promise.all([
                expect(properties).to.eventually.have.property("type", RDAJobType.L3D),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.L3DJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "lines3D",
                    inputs: {
                        clipPolygon: "",
                        meshes: "",
                        orientedPhotos: "",
                        photoSegmentationDetector: "",
                        pointClouds: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        pointCloudSegmentationDetector: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                        segmentation2D: "",
                        segmentation3D: ""
                    },
                    outputs: {
                        exportedLines3DCesium: "",
                        exportedLines3DDGN: "",                      
                        exportedPatches3DCesium: "",
                        exportedPatches3DDGN: "",
                        lines3D: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                        patches3D: "",
                        segmentation2D: "",
                        segmentation3D: "",
                        segmentedPhotos: "",
                        segmentedPointCloud: "",
                    },
                    computeLineWidth: true,
                    removeSmallComponents: 2,
                    exportSrs: "EPSG:3429"
                }),
            ]);
        });

        it("Change Detection job", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/change").reply(200, 
            {
                "job": {
                    "state": "unsubmitted",
                    "settings": {
                        "outputs": [{
                            "name": "objects3D",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "pointClouds1",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "pointClouds2",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ],
                        "colorThresholdLow": "1",
                        "colorThresholdHigh": "5",
                        "distThresholdLow": "2",
                        "distThresholdHigh": "8",
                        "resolution": "10",
                        "minPoints": "100",
                        "exportSrs": "EPSG:2784",
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "denis.biguenet@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "changeDetection",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("change");
            return Promise.all([
                expect(properties).to.eventually.have.property("type", RDAJobType.ChangeDetection),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.ChangeDetectionJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "changeDetection",
                    inputs: {
                        meshes1: "",
                        meshes2: "",
                        pointClouds1: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        pointClouds2: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                    },
                    outputs: {
                        exportedLocations3DSHP: "",
                        objects3D: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                    },
                    colorThresholdLow: 1,
                    colorThresholdHigh: 5,
                    distThresholdLow: 2,
                    distThresholdHigh: 8,
                    resolution: 10,
                    minPoints: 100,
                    exportSrs: "EPSG:2784",
                }),
            ]);
        });

        it("Extract Ground job", async function () {
            axiosMock.onGet(serviceUrl + "/jobs/ground").reply(200, 
            {
                "job": {
                    "state": "unsubmitted",
                    "settings": {
                        "outputs": [{
                            "name": "segmentedPointCloud",
                            "realityDataId": "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4"
                        }],
                        "inputs": [{
                                "name": "pointClouds",
                                "realityDataId": "8e9f7e7a-f37e-4d74-a1e7-df7325944757"
                            },
                            {
                                "name": "pointCloudSegmentationDetector",
                                "realityDataId": "9fbbe885-9086-4b98-b6a5-8024657bcff4"
                            }
                        ],
                        "exportSrs": "EPSG:2784",
                    },
                    "createdDateTime": "2023-03-30T15:14:55Z",
                    "id": "6f51448f-6377-4330-9ab0-f13fe994b3f1",
                    "email": "denis.biguenet@bentley.com",
                    "dataCenter": "EastUs",
                    "type": "extractGround",
                    "name": "SDK unit test",
                    "iTwinId": "c3739cf2-9da3-487b-b03d-f58c8eb97e5b",
                }
            });
            const properties = realityDataAnalysisService.getJobProperties("ground");
            return Promise.all([
                expect(properties).to.eventually.have.property("type", RDAJobType.ExtractGround),
                expect(properties).to.eventually.have.property("state", JobState.UNSUBMITTED),
                expect(properties).to.eventually.have.deep.property("settings").instanceOf(RDASettings.ExtractGroundJobSettings),
                expect(properties).to.eventually.have.deep.property("settings", {
                    type: "extractGround",
                    inputs: {
                        pointClouds: "8e9f7e7a-f37e-4d74-a1e7-df7325944757",
                        meshes: "",
                        pointCloudSegmentationDetector: "9fbbe885-9086-4b98-b6a5-8024657bcff4",
                        clipPolygon: "",
                    },
                    outputs: {
                        segmentation3D: "",
                        segmentedPointCloud: "60d8a846-7ad2-40e4-aed1-5adfe2dc79a4",
                        exportedSegmentation3DPOD: "",
                        exportedSegmentation3DLAS: "",
                        exportedSegmentation3DLAZ: "",
                    },
                    exportSrs: "EPSG:2784",
                }),
            ]);
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
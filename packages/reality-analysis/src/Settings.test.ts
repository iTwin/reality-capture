/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { BentleyError } from "@itwin/core-bentley";
import { ChangeDetectionJobSettings, ExtractGroundJobSettings, L3DJobSettings, O2DJobSettings, O3DJobSettings, S2DJobSettings, S3DJobSettings } from "./Settings";


export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Analysis settings unit tests", () => {
    describe("Settings to json", () => {
        it("O2D", function () {
            const o2dSettings = new O2DJobSettings();
            o2dSettings.inputs.photos = "photosId";
            o2dSettings.inputs.photoObjectDetector = "photoObjectDetectorId";
            o2dSettings.outputs.objects2D = "objects2D";
            const json = o2dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "photos", "realityDataId": "photosId"}),
                expect(json.inputs).to.deep.include({"name": "photoObjectDetector", "realityDataId": "photoObjectDetectorId"}),
                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("objects2D"),
            ]);
        });

        it("O3D", function () {
            const o3dSettings = new O3DJobSettings();
            o3dSettings.inputs.meshes = "meshesId";
            o3dSettings.inputs.objects2D = "objects2DId";
            o3dSettings.inputs.orientedPhotos = "orientedPhotosId";
            o3dSettings.inputs.photoObjectDetector = "photoObjectDetectorId";
            o3dSettings.inputs.pointClouds = "pointCloudsId";
            o3dSettings.outputs.exportedLocations3DSHP = "exportedLocations3DSHP";
            o3dSettings.outputs.exportedObjects3DCesium = "exportedObjects3DCesium";
            o3dSettings.outputs.exportedObjects3DDGN = "exportedObjects3DDGN";
            o3dSettings.outputs.objects2D = "objects2D";
            o3dSettings.outputs.objects3D = "objects3D";
            o3dSettings.useTiePoints = true;
            o3dSettings.minPhotos = 10;
            o3dSettings.maxDist = 100;
            o3dSettings.exportSrs = "EPSG:2788";
            const json = o3dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "meshes", "realityDataId": "meshesId"}),
                expect(json.inputs).to.deep.include({"name": "objects2D", "realityDataId": "objects2DId"}),
                expect(json.inputs).to.deep.include({"name": "orientedPhotos", "realityDataId": "orientedPhotosId"}),
                expect(json.inputs).to.deep.include({"name": "photoObjectDetector", "realityDataId": "photoObjectDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "pointClouds", "realityDataId": "pointCloudsId"}),
                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLocations3DSHP"),
                expect(json.outputs).to.deep.include("exportedObjects3DCesium"),
                expect(json.outputs).to.deep.include("exportedObjects3DDGN"),
                expect(json.outputs).to.deep.include("objects2D"),
                expect(json.outputs).to.deep.include("objects3D"),
                expect(json.useTiePoints).to.deep.equal("true"),
                expect(json.minPhotos).to.deep.equal("10"),
                expect(json.maxDist).to.deep.equal("100"),
                expect(json.exportSrs).to.deep.equal("EPSG:2788"),
            ]);
        });

        it("S2D", function () {
            const s2dSettings = new S2DJobSettings();
            s2dSettings.inputs.orthophoto = "orthophotoId";
            s2dSettings.inputs.orthophotoSegmentationDetector = "orthophotoSegmentationDetectorId";
            s2dSettings.inputs.photoSegmentationDetector = "photoSegmentationDetectorId";
            s2dSettings.inputs.photos = "photosId";
            s2dSettings.outputs.exportedLines2DDGN = "exportedLines2DDGN";
            s2dSettings.outputs.exportedLines2DSHP = "exportedLines2DSHP";
            s2dSettings.outputs.exportedPolygons2DSHP = "exportedPolygons2DSHP";
            s2dSettings.outputs.lines2D = "lines2D";
            s2dSettings.outputs.polygons2D = "polygons2D";
            s2dSettings.outputs.segmentation2D = "segmentation2D";
            s2dSettings.outputs.segmentedPhotos = "segmentedPhotos";
            const json = s2dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "orthophoto", "realityDataId": "orthophotoId"}),
                expect(json.inputs).to.deep.include({"name": "orthophotoSegmentationDetector", "realityDataId": "orthophotoSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "photoSegmentationDetector", "realityDataId": "photoSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "photos", "realityDataId": "photosId"}),
                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLines2DDGN"),
                expect(json.outputs).to.deep.include("exportedLines2DSHP"),
                expect(json.outputs).to.deep.include("exportedPolygons2DSHP"),
                expect(json.outputs).to.deep.include("lines2D"),
                expect(json.outputs).to.deep.include("polygons2D"),
                expect(json.outputs).to.deep.include("segmentation2D"),
                expect(json.outputs).to.deep.include("segmentedPhotos"),
            ]);
        });

        it("S3D", function () {
            const s3dSettings = new S3DJobSettings();
            s3dSettings.inputs.meshes = "meshesId";
            s3dSettings.inputs.objects2D = "objects2DId";
            s3dSettings.inputs.orientedPhotos = "orientedPhotosId";
            s3dSettings.inputs.photoObjectDetector = "photoObjectDetectorId";
            s3dSettings.inputs.pointCloudSegmentationDetector = "pointCloudSegmentationDetectorId";
            s3dSettings.inputs.pointClouds = "pointCloudsId";
            s3dSettings.inputs.segmentation3D = "segmentation3DId";
            s3dSettings.inputs.clipPolygon = "clipPolygonId";
            s3dSettings.outputs.exportedLocations3DSHP = "exportedLocations3DSHP";
            s3dSettings.outputs.exportedObjects3DCesium = "exportedObjects3DCesium";
            s3dSettings.outputs.exportedObjects3DDGN = "exportedObjects3DDGN";
            s3dSettings.outputs.exportedSegmentation3DLAS = "exportedSegmentation3DLAS";
            s3dSettings.outputs.exportedSegmentation3DLAZ = "exportedSegmentation3DLAZ";
            s3dSettings.outputs.exportedSegmentation3DPLY = "exportedSegmentation3DPLY";
            s3dSettings.outputs.exportedSegmentation3DPOD = "exportedSegmentation3DPOD";
            s3dSettings.outputs.objects2D = "objects2D";
            s3dSettings.outputs.objects3D = "objects3D";
            s3dSettings.outputs.segmentation3D = "segmentation3D";
            s3dSettings.outputs.segmentedPointCloud = "segmentedPointCloud";
            s3dSettings.saveConfidence = true;
            s3dSettings.exportSrs = "EPSG:7132";
            const json = s3dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "meshes", "realityDataId": "meshesId"}),
                expect(json.inputs).to.deep.include({"name": "objects2D", "realityDataId": "objects2DId"}),
                expect(json.inputs).to.deep.include({"name": "orientedPhotos", "realityDataId": "orientedPhotosId"}),
                expect(json.inputs).to.deep.include({"name": "photoObjectDetector", "realityDataId": "photoObjectDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "pointCloudSegmentationDetector", "realityDataId": "pointCloudSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "pointClouds", "realityDataId": "pointCloudsId"}),
                expect(json.inputs).to.deep.include({"name": "segmentation3D", "realityDataId": "segmentation3DId"}),
                expect(json.inputs).to.deep.include({"name": "clipPolygon", "realityDataId": "clipPolygonId"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLocations3DSHP"),
                expect(json.outputs).to.deep.include("exportedObjects3DCesium"),
                expect(json.outputs).to.deep.include("exportedObjects3DDGN"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAS"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAZ"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DPLY"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DPOD"),
                expect(json.outputs).to.deep.include("objects2D"),
                expect(json.outputs).to.deep.include("objects3D"),
                expect(json.outputs).to.deep.include("segmentation3D"),
                expect(json.outputs).to.deep.include("segmentedPointCloud"),

                expect(json.saveConfidence).to.deep.equal("true"),
                expect(json.exportSrs).to.deep.equal("EPSG:7132"),
            ]);
        });

        it("L3D", function () {
            const l3dSettings = new L3DJobSettings();
            l3dSettings.inputs.meshes = "meshesId";
            l3dSettings.inputs.orientedPhotos = "orientedPhotosId";
            l3dSettings.inputs.photoSegmentationDetector = "photoSegmentationDetectorId";
            l3dSettings.inputs.pointCloudSegmentationDetector = "pointCloudSegmentationDetectorId";
            l3dSettings.inputs.pointClouds = "pointCloudsId";
            l3dSettings.inputs.segmentation2D = "segmentation2DId";
            l3dSettings.inputs.segmentation3D = "segmentation3DId";
            l3dSettings.outputs.exportedLines3DCesium = "exportedLines3DCesium";
            l3dSettings.outputs.exportedLines3DDGN = "exportedLines3DDGN";
            l3dSettings.outputs.exportedPatches3DCesium = "exportedPatches3DCesium";
            l3dSettings.outputs.exportedPatches3DDGN = "exportedPatches3DDGN";
            l3dSettings.outputs.lines3D = "lines3D";
            l3dSettings.outputs.patches3D = "patches3D";
            l3dSettings.outputs.segmentation2D = "segmentation2D";
            l3dSettings.outputs.segmentation3D = "segmentation3D";
            l3dSettings.outputs.segmentedPointCloud = "segmentedPointCloud";
            l3dSettings.outputs.segmentedPhotos = "segmentedPhotos";
            l3dSettings.computeLineWidth = true;
            l3dSettings.removeSmallComponents = 1;
            l3dSettings.exportSrs = "EPSG:4512";
            const json = l3dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "meshes", "realityDataId": "meshesId"}),
                expect(json.inputs).to.deep.include({"name": "orientedPhotos", "realityDataId": "orientedPhotosId"}),
                expect(json.inputs).to.deep.include({"name": "photoSegmentationDetector", "realityDataId": "photoSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "pointCloudSegmentationDetector", "realityDataId": "pointCloudSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "pointClouds", "realityDataId": "pointCloudsId"}),
                expect(json.inputs).to.deep.include({"name": "segmentation2D", "realityDataId": "segmentation2DId"}),
                expect(json.inputs).to.deep.include({"name": "segmentation3D", "realityDataId": "segmentation3DId"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLines3DCesium"),
                expect(json.outputs).to.deep.include("exportedLines3DDGN"),
                expect(json.outputs).to.deep.include("exportedPatches3DCesium"),
                expect(json.outputs).to.deep.include("exportedPatches3DDGN"),
                expect(json.outputs).to.deep.include("lines3D"),
                expect(json.outputs).to.deep.include("patches3D"),
                expect(json.outputs).to.deep.include("segmentation2D"),
                expect(json.outputs).to.deep.include("segmentation3D"),
                expect(json.outputs).to.deep.include("segmentedPhotos"),
                expect(json.outputs).to.deep.include("segmentedPointCloud"),

                expect(json.computeLineWidth).to.deep.equal("true"),
                expect(json.removeSmallComponents).to.deep.equal("1"),
                expect(json.exportSrs).to.deep.equal("EPSG:4512"),
            ]);
        });

        it("Change detection", function () {
            const changeDetectionSettings = new ChangeDetectionJobSettings();
            changeDetectionSettings.inputs.meshes1 = "meshes1Id";
            changeDetectionSettings.inputs.meshes2 = "meshes2Id";
            changeDetectionSettings.inputs.pointClouds1 = "pointClouds1Id";
            changeDetectionSettings.inputs.pointClouds2 = "pointClouds2Id";
            changeDetectionSettings.outputs.exportedLocations3DSHP = "exportedLocations3DSHP";
            changeDetectionSettings.outputs.objects3D = "objects3D";
            changeDetectionSettings.colorThresholdLow = 10;
            changeDetectionSettings.colorThresholdHigh = 50;
            changeDetectionSettings.distThresholdLow = 10;
            changeDetectionSettings.distThresholdHigh = 50;
            changeDetectionSettings.resolution = 100;
            changeDetectionSettings.minPoints = 1000;
            changeDetectionSettings.exportSrs = "EPSG:5712";
            const json = changeDetectionSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "meshes1", "realityDataId": "meshes1Id"}),
                expect(json.inputs).to.deep.include({"name": "meshes2", "realityDataId": "meshes2Id"}),
                expect(json.inputs).to.deep.include({"name": "pointClouds1", "realityDataId": "pointClouds1Id"}),
                expect(json.inputs).to.deep.include({"name": "pointClouds2", "realityDataId": "pointClouds2Id"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLocations3DSHP"),
                expect(json.outputs).to.deep.include("objects3D"),
                
                expect(json.colorThresholdLow).to.deep.equal("10"),
                expect(json.colorThresholdHigh).to.deep.equal("50"),
                expect(json.distThresholdLow).to.deep.equal("10"),
                expect(json.distThresholdHigh).to.deep.equal("50"),
                expect(json.resolution).to.deep.equal("100"),
                expect(json.minPoints).to.deep.equal("1000"),
                expect(json.exportSrs).to.deep.equal("EPSG:5712"),
            ]);
        });

        it("Extract ground", function () {
            const extractGroundSettings = new ExtractGroundJobSettings();
            extractGroundSettings.inputs.clipPolygon = "clipPolygonId";
            extractGroundSettings.inputs.meshes = "meshesId";
            extractGroundSettings.inputs.pointCloudSegmentationDetector = "pointCloudSegmentationDetectorId";
            extractGroundSettings.inputs.pointClouds = "pointCloudsId";
            extractGroundSettings.outputs.exportedSegmentation3DLAS = "exportedSegmentation3DLAS";
            extractGroundSettings.outputs.exportedSegmentation3DLAZ = "exportedSegmentation3DLAZ";
            extractGroundSettings.outputs.exportedSegmentation3DPOD = "exportedSegmentation3DPOD";
            extractGroundSettings.outputs.segmentation3D = "segmentation3D";
            extractGroundSettings.outputs.segmentedPointCloud = "segmentedPointCloud";
            extractGroundSettings.exportSrs = "EPSG:6712";
            const json = extractGroundSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"name": "clipPolygon", "realityDataId": "clipPolygonId"}),
                expect(json.inputs).to.deep.include({"name": "meshes", "realityDataId": "meshesId"}),
                expect(json.inputs).to.deep.include({"name": "pointCloudSegmentationDetector", "realityDataId": "pointCloudSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"name": "pointClouds", "realityDataId": "pointCloudsId"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAS"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAZ"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DPOD"),
                expect(json.outputs).to.deep.include("segmentation3D"),
                expect(json.outputs).to.deep.include("segmentedPointCloud"),

                expect(json.exportSrs).to.deep.equal("EPSG:6712"),
            ]);
        });

    });

    describe("Settings from json : O2D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "photos",
                    "realityDataId": "photosId"
                },
                {
                    "name": "photoObjectDetector",
                    "realityDataId": "photoObjectDetectorId"
                }
                ],
                "outputs": [{
                    "name": "objects2D",
                    "realityDataId": "objects2DId"
                }
                ]
            };
            const o2DSettings = await O2DJobSettings.fromJson(json);
            return Promise.all([
                expect(o2DSettings.type).to.deep.equal("objects2D"),
                expect(o2DSettings.inputs).to.have.property("photos", "photosId"),
                expect(o2DSettings.inputs).to.have.property("photoObjectDetector", "photoObjectDetectorId"),
                expect(o2DSettings.outputs).to.have.property("objects2D", "objects2DId"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "photosId"
                }
                ],
                "outputs": [{
                    "name": "objects2D",
                    "realityDataId": "objects2DId"
                }
                ]
            };
            const o2DSettings = O2DJobSettings.fromJson(json);
            return expect(o2DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "photos",
                    "realityDataId": "photosId"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "objects2DId"
                }
                ]
            };
            const o2DSettings = O2DJobSettings.fromJson(json);
            return expect(o2DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });

    describe("Settings from json : O3D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "orientedPhotos",
                    "realityDataId": "orientedPhotosId"
                },
                {
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                },
                {
                    "name": "photoObjectDetector",
                    "realityDataId": "photoObjectDetectorId"
                },
                {
                    "name": "objects2D",
                    "realityDataId": "objects2DId"
                },
                {
                    "name": "meshes",
                    "realityDataId": "meshesId"
                },
                ],
                "outputs": [{
                    "name": "objects2D",
                    "realityDataId": "objects2DId"
                },
                {
                    "name": "objects3D",
                    "realityDataId": "objects3DId"
                },
                {
                    "name": "exportedObjects3DDGN",
                    "realityDataId": "exportedObjects3DDGNId"
                },
                {
                    "name": "exportedObjects3DCesium",
                    "realityDataId": "exportedObjects3DCesiumId"
                },
                {
                    "name": "exportedLocations3DSHP",
                    "realityDataId": "exportedLocations3DSHPId"
                },
                ],
                "useTiePoints": "true",
                "minPhotos": "10",
                "maxDist": "100",
                "exportSrs": "EPSG:7415"
            };
            const o3DSettings = await O3DJobSettings.fromJson(json);
            return Promise.all([
                expect(o3DSettings.type).to.deep.equal("objects3D"),
                expect(o3DSettings.inputs).to.have.property("orientedPhotos", "orientedPhotosId"),
                expect(o3DSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),
                expect(o3DSettings.inputs).to.have.property("photoObjectDetector", "photoObjectDetectorId"),
                expect(o3DSettings.inputs).to.have.property("objects2D", "objects2DId"),
                expect(o3DSettings.inputs).to.have.property("meshes", "meshesId"),

                expect(o3DSettings.outputs).to.have.property("objects2D", "objects2DId"),
                expect(o3DSettings.outputs).to.have.property("objects3D", "objects3DId"),
                expect(o3DSettings.outputs).to.have.property("exportedObjects3DDGN", "exportedObjects3DDGNId"),
                expect(o3DSettings.outputs).to.have.property("exportedObjects3DCesium", "exportedObjects3DCesiumId"),
                expect(o3DSettings.outputs).to.have.property("exportedLocations3DSHP", "exportedLocations3DSHPId"),

                expect(o3DSettings.useTiePoints).to.deep.equal(true),
                expect(o3DSettings.minPhotos).to.deep.equal(10),
                expect(o3DSettings.maxDist).to.deep.equal(100),
                expect(o3DSettings.exportSrs).to.deep.equal("EPSG:7415"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "orientedPhotosId"
                }
                ],
                "outputs": [{
                    "name": "objects3D",
                    "realityDataId": "objects3DId"
                }
                ]
            };
            const o3DSettings = O3DJobSettings.fromJson(json);
            return expect(o3DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "orientedPhotos",
                    "realityDataId": "orientedPhotosId"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "objects3DId"
                }
                ]
            };
            const o3DSettings = O3DJobSettings.fromJson(json);
            return expect(o3DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });

    describe("Settings from json : S2D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "photos",
                    "realityDataId": "photosId"
                },
                {
                    "name": "photoSegmentationDetector",
                    "realityDataId": "photoSegmentationDetectorId"
                },
                {
                    "name": "orthophoto",
                    "realityDataId": "orthophotoId"
                },
                {
                    "name": "orthophotoSegmentationDetector",
                    "realityDataId": "orthophotoSegmentationDetectorId"
                }
                ],
                "outputs": [{
                    "name": "segmentation2D",
                    "realityDataId": "segmentation2DId"
                },
                {
                    "name": "polygons2D",
                    "realityDataId": "polygons2DId"
                },
                {
                    "name": "exportedPolygons2DSHP",
                    "realityDataId": "exportedPolygons2DSHPId"
                },
                {
                    "name": "lines2D",
                    "realityDataId": "lines2DId"
                },
                {
                    "name": "segmentedPhotos",
                    "realityDataId": "segmentedPhotosId"
                },
                {
                    "name": "exportedLines2DSHP",
                    "realityDataId": "exportedLines2DSHPId"
                },
                {
                    "name": "exportedLines2DDGN",
                    "realityDataId": "exportedLines2DDGNId"
                }
                ]
            };
            const s2DSettings = await S2DJobSettings.fromJson(json);
            return Promise.all([
                expect(s2DSettings.type).to.deep.equal("segmentation2D"),
                expect(s2DSettings.inputs).to.have.property("photos", "photosId"),
                expect(s2DSettings.inputs).to.have.property("photoSegmentationDetector", "photoSegmentationDetectorId"),
                expect(s2DSettings.inputs).to.have.property("orthophoto", "orthophotoId"),
                expect(s2DSettings.inputs).to.have.property("orthophotoSegmentationDetector", "orthophotoSegmentationDetectorId"),

                expect(s2DSettings.outputs).to.have.property("segmentation2D", "segmentation2DId"),
                expect(s2DSettings.outputs).to.have.property("polygons2D", "polygons2DId"),
                expect(s2DSettings.outputs).to.have.property("exportedPolygons2DSHP", "exportedPolygons2DSHPId"),
                expect(s2DSettings.outputs).to.have.property("lines2D", "lines2DId"),
                expect(s2DSettings.outputs).to.have.property("segmentedPhotos", "segmentedPhotosId"),
                expect(s2DSettings.outputs).to.have.property("exportedLines2DSHP", "exportedLines2DSHPId"),
                expect(s2DSettings.outputs).to.have.property("exportedLines2DDGN", "exportedLines2DDGNId"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "photosId"
                }
                ],
                "outputs": [{
                    "name": "segmentation2D",
                    "realityDataId": "segmentation2DId"
                }
                ]
            };
            const s2DSettings = S2DJobSettings.fromJson(json);
            return expect(s2DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "photos",
                    "realityDataId": "photosId"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "segmentation2DId"
                }
                ]
            };
            const s2DSettings = S2DJobSettings.fromJson(json);
            return expect(s2DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });

    describe("Settings from json : S3D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                },
                {
                    "name": "meshes",
                    "realityDataId": "meshesId"
                },
                {
                    "name": "pointCloudSegmentationDetector",
                    "realityDataId": "pointCloudSegmentationDetectorId"
                },
                {
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                },
                {
                    "name": "orientedPhotos",
                    "realityDataId": "orientedPhotosId"
                },
                {
                    "name": "photoObjectDetector",
                    "realityDataId": "photoObjectDetectorId"
                },
                {
                    "name": "objects2D",
                    "realityDataId": "objects2DId"
                },
                {
                    "name": "clipPolygon",
                    "realityDataId": "clipPolygonId"
                }
                ],
                "outputs": [{
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                },
                {
                    "name": "segmentedPointCloud",
                    "realityDataId": "segmentedPointCloudId"
                },
                {
                    "name": "objects2D",
                    "realityDataId": "objects2DId"
                },
                {
                    "name": "exportedSegmentation3DPOD",
                    "realityDataId": "exportedSegmentation3DPODId"
                },
                {
                    "name": "exportedSegmentation3DLAS",
                    "realityDataId": "exportedSegmentation3DLASId"
                },
                {
                    "name": "exportedSegmentation3DLAZ",
                    "realityDataId": "exportedSegmentation3DLAZId"
                },
                {
                    "name": "exportedSegmentation3DPLY",
                    "realityDataId": "exportedSegmentation3DPLYId"
                },
                {
                    "name": "objects3D",
                    "realityDataId": "objects3DId"
                },
                {
                    "name": "exportedObjects3DDGN",
                    "realityDataId": "exportedObjects3DDGNId"
                },
                {
                    "name": "exportedObjects3DCesium",
                    "realityDataId": "exportedObjects3DCesiumId"
                },
                {
                    "name": "exportedLocations3DSHP",
                    "realityDataId": "exportedLocations3DSHPId"
                }
                ],
                "saveConfidence": "true",
                "exportSrs": "EPSG:2841"
            };
            const s3DSettings = await S3DJobSettings.fromJson(json);
            return Promise.all([
                expect(s3DSettings.type).to.deep.equal("segmentation3D"),
                expect(s3DSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),
                expect(s3DSettings.inputs).to.have.property("meshes", "meshesId"),
                expect(s3DSettings.inputs).to.have.property("pointCloudSegmentationDetector", "pointCloudSegmentationDetectorId"),
                expect(s3DSettings.inputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(s3DSettings.inputs).to.have.property("orientedPhotos", "orientedPhotosId"),
                expect(s3DSettings.inputs).to.have.property("photoObjectDetector", "photoObjectDetectorId"),
                expect(s3DSettings.inputs).to.have.property("objects2D", "objects2DId"),
                expect(s3DSettings.inputs).to.have.property("clipPolygon", "clipPolygonId"),

                expect(s3DSettings.outputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(s3DSettings.outputs).to.have.property("segmentedPointCloud", "segmentedPointCloudId"),
                expect(s3DSettings.outputs).to.have.property("objects2D", "objects2DId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DPOD", "exportedSegmentation3DPODId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DLAS", "exportedSegmentation3DLASId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DLAZ", "exportedSegmentation3DLAZId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DPLY", "exportedSegmentation3DPLYId"),
                expect(s3DSettings.outputs).to.have.property("objects3D", "objects3DId"),
                expect(s3DSettings.outputs).to.have.property("exportedObjects3DDGN", "exportedObjects3DDGNId"),
                expect(s3DSettings.outputs).to.have.property("exportedObjects3DCesium", "exportedObjects3DCesiumId"),
                expect(s3DSettings.outputs).to.have.property("exportedLocations3DSHP", "exportedLocations3DSHPId"),

                expect(s3DSettings.saveConfidence).to.deep.equal(true),
                expect(s3DSettings.exportSrs).to.deep.equal("EPSG:2841"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                }
                ]
            };
            const s3DSettings = S3DJobSettings.fromJson(json);
            return expect(s3DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "segmentation3DId"
                }
                ]
            };
            const s3DSettings = S3DJobSettings.fromJson(json);
            return expect(s3DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });

    describe("Settings from json : L3D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                },
                {
                    "name": "meshes",
                    "realityDataId": "meshesId"
                },
                {
                    "name": "pointCloudSegmentationDetector",
                    "realityDataId": "pointCloudSegmentationDetectorId"
                },
                {
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                },
                {
                    "name": "orientedPhotos",
                    "realityDataId": "orientedPhotosId"
                },
                {
                    "name": "photoSegmentationDetector",
                    "realityDataId": "photoSegmentationDetectorId"
                },
                {
                    "name": "segmentation2D",
                    "realityDataId": "segmentation2DId"
                }
                ],
                "outputs": [{
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                },
                {
                    "name": "segmentedPointCloud",
                    "realityDataId": "segmentedPointCloudId"
                },
                {
                    "name": "segmentation2D",
                    "realityDataId": "segmentation2DId"
                },
                {
                    "name": "lines3D",
                    "realityDataId": "lines3DId"
                },
                {
                    "name": "exportedLines3DDGN",
                    "realityDataId": "exportedLines3DDGNId"
                },
                {
                    "name": "exportedLines3DCesium",
                    "realityDataId": "exportedLines3DCesiumId"
                },
                {
                    "name": "segmentedPhotos",
                    "realityDataId": "segmentedPhotosId"
                },
                {
                    "name": "patches3D",
                    "realityDataId": "patches3DId"
                },
                {
                    "name": "exportedPatches3DDGN",
                    "realityDataId": "exportedPatches3DDGNId"
                },
                {
                    "name": "exportedPatches3DCesium",
                    "realityDataId": "exportedPatches3DCesiumId"
                }
                ],
                "computeLineWidth": "true",
                "removeSmallComponents": "1",
                "exportSrs": "EPSG:2841"
            };
            const l3DSettings = await L3DJobSettings.fromJson(json);
            return Promise.all([
                expect(l3DSettings.type).to.deep.equal("lines3D"),
                expect(l3DSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),
                expect(l3DSettings.inputs).to.have.property("meshes", "meshesId"),
                expect(l3DSettings.inputs).to.have.property("pointCloudSegmentationDetector", "pointCloudSegmentationDetectorId"),
                expect(l3DSettings.inputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(l3DSettings.inputs).to.have.property("orientedPhotos", "orientedPhotosId"),
                expect(l3DSettings.inputs).to.have.property("photoSegmentationDetector", "photoSegmentationDetectorId"),
                expect(l3DSettings.inputs).to.have.property("segmentation2D", "segmentation2DId"),

                expect(l3DSettings.outputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(l3DSettings.outputs).to.have.property("segmentedPointCloud", "segmentedPointCloudId"),
                expect(l3DSettings.outputs).to.have.property("segmentation2D", "segmentation2DId"),
                expect(l3DSettings.outputs).to.have.property("lines3D", "lines3DId"),
                expect(l3DSettings.outputs).to.have.property("exportedLines3DDGN", "exportedLines3DDGNId"),
                expect(l3DSettings.outputs).to.have.property("exportedLines3DCesium", "exportedLines3DCesiumId"),
                expect(l3DSettings.outputs).to.have.property("segmentedPhotos", "segmentedPhotosId"),
                expect(l3DSettings.outputs).to.have.property("patches3D", "patches3DId"),
                expect(l3DSettings.outputs).to.have.property("exportedPatches3DDGN", "exportedPatches3DDGNId"),
                expect(l3DSettings.outputs).to.have.property("exportedPatches3DCesium", "exportedPatches3DCesiumId"),

                expect(l3DSettings.computeLineWidth).to.deep.equal(true),
                expect(l3DSettings.removeSmallComponents).to.deep.equal(1),
                expect(l3DSettings.exportSrs).to.deep.equal("EPSG:2841"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                }
                ]
            };
            const l3DSettings = L3DJobSettings.fromJson(json);
            return expect(l3DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "segmentation3DId"
                }
                ]
            };
            const s3DSettings = S3DJobSettings.fromJson(json);
            return expect(s3DSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });

    describe("Settings from json : Change detection", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds1",
                    "realityDataId": "pointClouds1Id"
                },
                {
                    "name": "pointClouds2",
                    "realityDataId": "pointClouds2Id"
                },
                {
                    "name": "meshes1",
                    "realityDataId": "meshes1Id"
                },
                {
                    "name": "meshes2",
                    "realityDataId": "meshes2Id"
                }
                ],
                "outputs": [{
                    "name": "objects3D",
                    "realityDataId": "objects3DId"
                },
                {
                    "name": "exportedLocations3DSHP",
                    "realityDataId": "exportedLocations3DSHPId"
                }
                ],
                "colorThresholdLow": "10",
                "colorThresholdHigh": "100",
                "distThresholdLow": "10",
                "distThresholdHigh": "100",
                "resolution": "100",
                "minPoints": "1000",
                "exportSrs": "EPSG:5912"
            };
            const changeDetectionSettings = await ChangeDetectionJobSettings.fromJson(json);
            return Promise.all([
                expect(changeDetectionSettings.type).to.deep.equal("changeDetection"),
                expect(changeDetectionSettings.inputs).to.have.property("pointClouds1", "pointClouds1Id"),
                expect(changeDetectionSettings.inputs).to.have.property("pointClouds2", "pointClouds2Id"),
                expect(changeDetectionSettings.inputs).to.have.property("meshes1", "meshes1Id"),
                expect(changeDetectionSettings.inputs).to.have.property("meshes2", "meshes2Id"),

                expect(changeDetectionSettings.outputs).to.have.property("objects3D", "objects3DId"),
                expect(changeDetectionSettings.outputs).to.have.property("exportedLocations3DSHP", "exportedLocations3DSHPId"),

                expect(changeDetectionSettings.colorThresholdLow).to.deep.equal(10),
                expect(changeDetectionSettings.colorThresholdHigh).to.deep.equal(100),
                expect(changeDetectionSettings.distThresholdLow).to.deep.equal(10),
                expect(changeDetectionSettings.distThresholdHigh).to.deep.equal(100),
                expect(changeDetectionSettings.resolution).to.deep.equal(100),
                expect(changeDetectionSettings.minPoints).to.deep.equal(1000),
                expect(changeDetectionSettings.exportSrs).to.deep.equal("EPSG:5912")
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "pointClouds1Id"
                }
                ],
                "outputs": [{
                    "name": "objects3D",
                    "realityDataId": "objects3DId"
                }
                ]
            };
            const changeDetectionSettings = ChangeDetectionJobSettings.fromJson(json);
            return expect(changeDetectionSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "meshes1",
                    "realityDataId": "meshes1Id"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "objects3DId"
                }
                ]
            };
            const changeDetectionSettings = ChangeDetectionJobSettings.fromJson(json);
            return expect(changeDetectionSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });

    describe("Settings from json : Extract ground", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                },
                {
                    "name": "meshes",
                    "realityDataId": "meshesId"
                },
                {
                    "name": "pointCloudSegmentationDetector",
                    "realityDataId": "pointCloudSegmentationDetectorId"
                },
                {
                    "name": "clipPolygon",
                    "realityDataId": "clipPolygonId"
                }
                ],
                "outputs": [{
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                },
                {
                    "name": "segmentedPointCloud",
                    "realityDataId": "segmentedPointCloudId"
                },
                {
                    "name": "exportedSegmentation3DPOD",
                    "realityDataId": "exportedSegmentation3DPODId"
                },
                {
                    "name": "exportedSegmentation3DLAS",
                    "realityDataId": "exportedSegmentation3DLASId"
                },
                {
                    "name": "exportedSegmentation3DLAZ",
                    "realityDataId": "exportedSegmentation3DLAZId"
                }
                ],
                "exportSrs": "EPSG:5912"
            };
            const extractGroundSettings = await ExtractGroundJobSettings.fromJson(json);
            return Promise.all([
                expect(extractGroundSettings.type).to.deep.equal("extractGround"),
                expect(extractGroundSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),
                expect(extractGroundSettings.inputs).to.have.property("meshes", "meshesId"),
                expect(extractGroundSettings.inputs).to.have.property("pointCloudSegmentationDetector", "pointCloudSegmentationDetectorId"),
                expect(extractGroundSettings.inputs).to.have.property("clipPolygon", "clipPolygonId"),

                expect(extractGroundSettings.outputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(extractGroundSettings.outputs).to.have.property("segmentedPointCloud", "segmentedPointCloudId"),
                expect(extractGroundSettings.outputs).to.have.property("exportedSegmentation3DPOD", "exportedSegmentation3DPODId"),
                expect(extractGroundSettings.outputs).to.have.property("exportedSegmentation3DLAS", "exportedSegmentation3DLASId"),
                expect(extractGroundSettings.outputs).to.have.property("exportedSegmentation3DLAZ", "exportedSegmentation3DLAZId"),

                expect(extractGroundSettings.exportSrs).to.deep.equal("EPSG:5912")
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "name": "invalid",
                    "realityDataId": "clipPolygonId"
                }
                ],
                "outputs": [{
                    "name": "segmentation3D",
                    "realityDataId": "segmentation3DId"
                }
                ]
            };
            const extractGroundSettings = ExtractGroundJobSettings.fromJson(json);
            return expect(extractGroundSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected input name : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "name": "pointClouds",
                    "realityDataId": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "name": "invalid",
                    "realityDataId": "segmentation3DId"
                }
                ]
            };
            const extractGroundSettings = ExtractGroundJobSettings.fromJson(json);
            return expect(extractGroundSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : invalid");
        });
    });
});
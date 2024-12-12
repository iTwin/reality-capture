/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { ChangeDetectionJobSettings, ExtractGroundJobSettings, O2DJobSettings, S2DJobSettings, S3DJobSettings, SOrthoJobSettings } from "./Settings";


export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Analysis settings unit tests", () => {
    describe("Settings to json", () => {
        it("O2D", function () {
            const o2dSettings = new O2DJobSettings();
            o2dSettings.inputs.photos = "photosId";
            o2dSettings.inputs.photoObjectDetector = "photoObjectDetectorId";
            o2dSettings.inputs.meshes = "meshesId";
            o2dSettings.inputs.objects2D = "objects2DId";
            o2dSettings.inputs.pointClouds = "pointCloudsId";
            o2dSettings.outputs.objects2D = "objects2D";
            o2dSettings.outputs.objects3D = "objects3D";
            o2dSettings.outputs.exportedObjects3DDGN = "exportedObjects3DDGN";
            o2dSettings.outputs.exportedObjects3DCesium = "exportedObjects3DCesium";
            o2dSettings.outputs.exportedObjects3DGeoJSON = "exportedObjects3DGeoJSON";
            o2dSettings.outputs.exportedLocations3DSHP = "exportedLocations3DSHP";
            o2dSettings.outputs.exportedLocations3DGeoJSON = "exportedLocations3DGeoJSON";
            o2dSettings.options.useTiePoints = true;
            o2dSettings.options.minPhotos = 10;
            o2dSettings.options.maxDist = 100;
            o2dSettings.options.exportSrs = "EPSG:2788";
            const json = o2dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"type": "photos", "id": "photosId"}),
                expect(json.inputs).to.deep.include({"type": "photoObjectDetector", "id": "photoObjectDetectorId"}),
                expect(json.inputs).to.deep.include({"type": "meshes", "id": "meshesId"}),
                expect(json.inputs).to.deep.include({"type": "objects2D", "id": "objects2DId"}),
                expect(json.inputs).to.deep.include({"type": "pointClouds", "id": "pointCloudsId"}),
                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("objects2D"),
                expect(json.outputs).to.deep.include("objects3D"),
                expect(json.outputs).to.deep.include("exportedObjects3DDGN"),
                expect(json.outputs).to.deep.include("exportedObjects3DCesium"),
                expect(json.outputs).to.deep.include("exportedObjects3DGeoJSON"),
                expect(json.outputs).to.deep.include("exportedLocations3DSHP"),
                expect(json.outputs).to.deep.include("exportedLocations3DGeoJSON"),

                expect(json.options.useTiePoints).to.deep.equal("true"),
                expect(json.options.minPhotos).to.deep.equal("10"),
                expect(json.options.maxDist).to.deep.equal("100"),
                expect(json.options.exportSrs).to.deep.equal("EPSG:2788"),
            ]);
        });

        it("S2D", function () {
            const s2dSettings = new S2DJobSettings();
            s2dSettings.inputs.photoSegmentationDetector = "photoSegmentationDetectorId";
            s2dSettings.inputs.photos = "photosId";
            s2dSettings.inputs.meshes = "meshesId";
            s2dSettings.inputs.pointClouds = "pointCloudsId";
            s2dSettings.inputs.segmentation2D = "segmentation2DId";

            s2dSettings.outputs.segmentation2D = "segmentation2D";
            s2dSettings.outputs.segmentedPhotos = "segmentedPhotos";
            s2dSettings.outputs.polygons3D = "polygons3D";
            s2dSettings.outputs.lines3D = "lines3D";
            s2dSettings.outputs.exportedPolygons3DDGN = "exportedPolygons3DDGN";
            s2dSettings.outputs.exportedPolygons3DCesium = "exportedPolygons3DCesium";
            s2dSettings.outputs.exportedPolygons3DGeoJSON = "exportedPolygons3DGeoJSON";
            s2dSettings.outputs.exportedLines3DDGN = "exportedLines3DDGN";
            s2dSettings.outputs.exportedLines3DCesium = "exportedLines3DCesium";
            s2dSettings.outputs.exportedLines3DGeoJSON = "exportedLines3DGeoJSON";

            s2dSettings.options.computeLineWidth = true;
            s2dSettings.options.removeSmallComponents = 1;
            s2dSettings.options.exportSrs = "EPSG:4512";
            s2dSettings.options.minPhotos = 10;

            const json = s2dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"type": "photoSegmentationDetector", "id": "photoSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"type": "photos", "id": "photosId"}),
                expect(json.inputs).to.deep.include({"type": "meshes", "id": "meshesId"}),
                expect(json.inputs).to.deep.include({"type": "pointClouds", "id": "pointCloudsId"}),
                expect(json.inputs).to.deep.include({"type": "segmentation2D", "id": "segmentation2DId"}),
                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("segmentation2D"),
                expect(json.outputs).to.deep.include("segmentedPhotos"),
                expect(json.outputs).to.deep.include("polygons3D"),
                expect(json.outputs).to.deep.include("lines3D"),
                expect(json.outputs).to.deep.include("exportedPolygons3DDGN"),
                expect(json.outputs).to.deep.include("exportedPolygons3DCesium"),
                expect(json.outputs).to.deep.include("exportedPolygons3DGeoJSON"),
                expect(json.outputs).to.deep.include("exportedLines3DDGN"),
                expect(json.outputs).to.deep.include("exportedLines3DCesium"),
                expect(json.outputs).to.deep.include("exportedLines3DGeoJSON"),
                expect(json.options.computeLineWidth).to.deep.equal("true"),
                expect(json.options.removeSmallComponents).to.deep.equal("1"),
                expect(json.options.exportSrs).to.deep.equal("EPSG:4512"),
                expect(json.options.minPhotos).to.deep.equal("10"),
            ]);
        });

        it("SOrtho", function () {
            const s2dSettings = new SOrthoJobSettings();
            s2dSettings.inputs.orthophoto = "orthophotoId";
            s2dSettings.inputs.orthophotoSegmentationDetector = "orthophotoSegmentationDetectorId";
            s2dSettings.outputs.exportedLines2DDGN = "exportedLines2DDGN";
            s2dSettings.outputs.exportedLines2DSHP = "exportedLines2DSHP";
            s2dSettings.outputs.exportedLines2DGeoJSON = "exportedLines2DGeoJSON";
            s2dSettings.outputs.exportedPolygons2DSHP = "exportedPolygons2DSHP";
            s2dSettings.outputs.exportedPolygons2DGeoJSON = "exportedPolygons2DGeoJSON";
            s2dSettings.outputs.lines2D = "lines2D";
            s2dSettings.outputs.polygons2D = "polygons2D";
            s2dSettings.outputs.segmentation2D = "segmentation2D";
            s2dSettings.outputs.segmentedPhotos = "segmentedPhotos";
            const json = s2dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"type": "orthophoto", "id": "orthophotoId"}),
                expect(json.inputs).to.deep.include({"type": "orthophotoSegmentationDetector", "id": "orthophotoSegmentationDetectorId"}),
                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLines2DDGN"),
                expect(json.outputs).to.deep.include("exportedLines2DSHP"),
                expect(json.outputs).to.deep.include("exportedLines2DGeoJSON"),
                expect(json.outputs).to.deep.include("exportedPolygons2DSHP"),
                expect(json.outputs).to.deep.include("exportedPolygons2DGeoJSON"),
                expect(json.outputs).to.deep.include("lines2D"),
                expect(json.outputs).to.deep.include("polygons2D"),
                expect(json.outputs).to.deep.include("segmentation2D"),
                expect(json.outputs).to.deep.include("segmentedPhotos"),
            ]);
        });

        it("S3D", function () {
            const s3dSettings = new S3DJobSettings();
            s3dSettings.inputs.meshes = "meshesId";
            s3dSettings.inputs.pointCloudSegmentationDetector = "pointCloudSegmentationDetectorId";
            s3dSettings.inputs.pointClouds = "pointCloudsId";
            s3dSettings.inputs.segmentation3D = "segmentation3DId";
            s3dSettings.inputs.clipPolygon = "clipPolygonId";
            s3dSettings.outputs.lines3D = "lines3D";
            s3dSettings.outputs.polygons3D = "polygons3D";
            s3dSettings.outputs.exportedLocations3DSHP = "exportedLocations3DSHP";
            s3dSettings.outputs.exportedLocations3DGeoJSON = "exportedLocations3DGeoJSON";
            s3dSettings.outputs.exportedObjects3DCesium = "exportedObjects3DCesium";
            s3dSettings.outputs.exportedObjects3DDGN = "exportedObjects3DDGN";
            s3dSettings.outputs.exportedObjects3DGeoJSON = "exportedObjects3DGeoJSON";
            s3dSettings.outputs.exportedLines3DDGN = "exportedLines3DDGN";
            s3dSettings.outputs.exportedLines3DCesium = "exportedLines3DCesium";
            s3dSettings.outputs.exportedLines3DGeoJSON = "exportedLines3DGeoJSON";
            s3dSettings.outputs.exportedPolygons3DDGN = "exportedPolygons3DDGN";
            s3dSettings.outputs.exportedPolygons3DCesium = "exportedPolygons3DCesium";
            s3dSettings.outputs.exportedPolygons3DGeoJSON = "exportedPolygons3DGeoJSON";
            s3dSettings.outputs.exportedSegmentation3DLAS = "exportedSegmentation3DLAS";
            s3dSettings.outputs.exportedSegmentation3DLAZ = "exportedSegmentation3DLAZ";
            s3dSettings.outputs.exportedSegmentation3DPLY = "exportedSegmentation3DPLY";
            s3dSettings.outputs.exportedSegmentation3DPOD = "exportedSegmentation3DPOD";
            s3dSettings.outputs.objects3D = "objects3D";
            s3dSettings.outputs.segmentation3D = "segmentation3D";
            s3dSettings.outputs.segmentedPointCloud = "segmentedPointCloud";
            s3dSettings.options.saveConfidence = true;
            s3dSettings.options.computeLineWidth = true;
            s3dSettings.options.removeSmallComponents = 1;
            s3dSettings.options.exportSrs = "EPSG:7132";
            const json = s3dSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"type": "meshes", "id": "meshesId"}),
                expect(json.inputs).to.deep.include({"type": "pointCloudSegmentationDetector", "id": "pointCloudSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"type": "pointClouds", "id": "pointCloudsId"}),
                expect(json.inputs).to.deep.include({"type": "segmentation3D", "id": "segmentation3DId"}),
                expect(json.inputs).to.deep.include({"type": "clipPolygon", "id": "clipPolygonId"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLocations3DSHP"),
                expect(json.outputs).to.deep.include("exportedLocations3DGeoJSON"),
                expect(json.outputs).to.deep.include("exportedObjects3DCesium"),
                expect(json.outputs).to.deep.include("exportedObjects3DDGN"),
                expect(json.outputs).to.deep.include("exportedObjects3DGeoJSON"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAS"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAZ"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DPLY"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DPOD"),
                expect(json.outputs).to.deep.include("objects3D"),
                expect(json.outputs).to.deep.include("segmentation3D"),
                expect(json.outputs).to.deep.include("segmentedPointCloud"),
                expect(json.outputs).to.deep.include("exportedLines3DDGN"),
                expect(json.outputs).to.deep.include("exportedLines3DCesium"),
                expect(json.outputs).to.deep.include("exportedLines3DGeoJSON"),
                expect(json.outputs).to.deep.include("polygons3D"),
                expect(json.outputs).to.deep.include("exportedPolygons3DDGN"),
                expect(json.outputs).to.deep.include("exportedPolygons3DCesium"),
                expect(json.outputs).to.deep.include("exportedPolygons3DGeoJSON"),
                expect(json.outputs).to.deep.include("lines3D"),

                expect(json.options.saveConfidence).to.deep.equal("true"),
                expect(json.options.exportSrs).to.deep.equal("EPSG:7132"),
                expect(json.options.computeLineWidth).to.deep.equal("true"),
                expect(json.options.removeSmallComponents).to.deep.equal("1"),
            ]);
        });

        it("Change detection", function () {
            const changeDetectionSettings = new ChangeDetectionJobSettings();
            changeDetectionSettings.inputs.meshes1 = "meshes1Id";
            changeDetectionSettings.inputs.meshes2 = "meshes2Id";
            changeDetectionSettings.inputs.pointClouds1 = "pointClouds1Id";
            changeDetectionSettings.inputs.pointClouds2 = "pointClouds2Id";
            changeDetectionSettings.outputs.exportedLocations3DSHP = "exportedLocations3DSHP";
            changeDetectionSettings.outputs.exportedLocations3DGeoJSON = "exportedLocations3DGeoJSON";
            changeDetectionSettings.outputs.objects3D = "objects3D";
            changeDetectionSettings.options.colorThresholdLow = 10;
            changeDetectionSettings.options.colorThresholdHigh = 50;
            changeDetectionSettings.options.distThresholdLow = 10;
            changeDetectionSettings.options.distThresholdHigh = 50;
            changeDetectionSettings.options.resolution = 100;
            changeDetectionSettings.options.minPoints = 1000;
            changeDetectionSettings.options.exportSrs = "EPSG:5712";
            const json = changeDetectionSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"type": "meshes1", "id": "meshes1Id"}),
                expect(json.inputs).to.deep.include({"type": "meshes2", "id": "meshes2Id"}),
                expect(json.inputs).to.deep.include({"type": "pointClouds1", "id": "pointClouds1Id"}),
                expect(json.inputs).to.deep.include({"type": "pointClouds2", "id": "pointClouds2Id"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedLocations3DSHP"),
                expect(json.outputs).to.deep.include("exportedLocations3DGeoJSON"),
                expect(json.outputs).to.deep.include("objects3D"),
                
                expect(json.options.colorThresholdLow).to.deep.equal("10"),
                expect(json.options.colorThresholdHigh).to.deep.equal("50"),
                expect(json.options.distThresholdLow).to.deep.equal("10"),
                expect(json.options.distThresholdHigh).to.deep.equal("50"),
                expect(json.options.resolution).to.deep.equal("100"),
                expect(json.options.minPoints).to.deep.equal("1000"),
                expect(json.options.exportSrs).to.deep.equal("EPSG:5712"),
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
            extractGroundSettings.options.exportSrs = "EPSG:6712";
            const json = extractGroundSettings.toJson();
            return Promise.all([
                expect(json).to.have.property("inputs"),
                expect(json.inputs).to.have.length.above(0),
                expect(json.inputs).to.deep.include({"type": "clipPolygon", "id": "clipPolygonId"}),
                expect(json.inputs).to.deep.include({"type": "meshes", "id": "meshesId"}),
                expect(json.inputs).to.deep.include({"type": "pointCloudSegmentationDetector", "id": "pointCloudSegmentationDetectorId"}),
                expect(json.inputs).to.deep.include({"type": "pointClouds", "id": "pointCloudsId"}),

                expect(json).to.have.property("outputs"),
                expect(json.outputs).to.have.length.above(0),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAS"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DLAZ"),
                expect(json.outputs).to.deep.include("exportedSegmentation3DPOD"),
                expect(json.outputs).to.deep.include("segmentation3D"),
                expect(json.outputs).to.deep.include("segmentedPointCloud"),

                expect(json.options.exportSrs).to.deep.equal("EPSG:6712"),
            ]);
        });

    });

    describe("Settings from json : O2D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "type": "photos",
                    "id": "photosId"
                },
                {
                    "type": "photoObjectDetector",
                    "id": "photoObjectDetectorId"
                },
                {
                    "type": "meshes",
                    "id": "meshesId"
                },
                {
                    "type": "objects2D",
                    "id": "objects2DId"
                },
                {
                    "type": "pointClouds",
                    "id": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "type": "objects2D",
                    "id": "objects2DId"
                },
                {
                    "type": "objects3D",
                    "id": "objects3DId"
                },
                {
                    "type": "exportedObjects3DDGN",
                    "id": "exportedObjects3DDGNId"
                },
                {
                    "type": "exportedObjects3DCesium",
                    "id": "exportedObjects3DCesiumId"
                },
                {
                    "type": "exportedObjects3DGeoJSON",
                    "id": "exportedObjects3DGeoJSONId"
                },
                {
                    "type": "exportedLocations3DSHP",
                    "id": "exportedLocations3DSHPId"
                },
                {
                    "type": "exportedLocations3DGeoJSON",
                    "id": "exportedLocations3DGeoJSONId"
                }
                ],
                "options": {
                    "useTiePoints": "true",
                    "minPhotos": "10",
                    "maxDist": "100",
                    "exportSrs": "EPSG:7415"
                }
            };
            const o2DSettings = await O2DJobSettings.fromJson(json);
            return Promise.all([
                expect(o2DSettings.type).to.deep.equal("objects2D"),
                expect(o2DSettings.inputs).to.have.property("photos", "photosId"),
                expect(o2DSettings.inputs).to.have.property("photoObjectDetector", "photoObjectDetectorId"),
                expect(o2DSettings.inputs).to.have.property("meshes", "meshesId"),
                expect(o2DSettings.inputs).to.have.property("objects2D", "objects2DId"),
                expect(o2DSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),

                expect(o2DSettings.outputs).to.have.property("objects2D", "objects2DId"),
                expect(o2DSettings.outputs).to.have.property("objects3D", "objects3DId"),
                expect(o2DSettings.outputs).to.have.property("exportedObjects3DDGN", "exportedObjects3DDGNId"),
                expect(o2DSettings.outputs).to.have.property("exportedObjects3DCesium", "exportedObjects3DCesiumId"),
                expect(o2DSettings.outputs).to.have.property("exportedObjects3DGeoJSON", "exportedObjects3DGeoJSONId"),
                expect(o2DSettings.outputs).to.have.property("exportedLocations3DSHP", "exportedLocations3DSHPId"),
                expect(o2DSettings.outputs).to.have.property("exportedLocations3DGeoJSON", "exportedLocations3DGeoJSONId"),

                expect(o2DSettings.options.useTiePoints).to.deep.equal(true),
                expect(o2DSettings.options.minPhotos).to.deep.equal(10),
                expect(o2DSettings.options.maxDist).to.deep.equal(100),
                expect(o2DSettings.options.exportSrs).to.deep.equal("EPSG:7415"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "type": "invalid",
                    "id": "photosId"
                }
                ],
                "outputs": [{
                    "type": "objects2D",
                    "id": "objects2DId"
                }
                ]
            };
            const o2DSettings = O2DJobSettings.fromJson(json);
            return expect(o2DSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "type": "photos",
                    "id": "photosId"
                }
                ],
                "outputs": [{
                    "type": "invalid",
                    "id": "objects2DId"
                }
                ]
            };
            const o2DSettings = O2DJobSettings.fromJson(json);
            return expect(o2DSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : invalid");
        });
    });

    describe("Settings from json : S2D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "type": "photos",
                    "id": "photosId"
                },
                {
                    "type": "photoSegmentationDetector",
                    "id": "photoSegmentationDetectorId"
                },
                {
                    "type": "meshes",
                    "id": "meshesId"
                },
                {
                    "type": "pointClouds",
                    "id": "pointCloudsId"
                },
                {
                    "type": "segmentation2D",
                    "id": "segmentation2DId"
                }
                ],
                "outputs": [{
                    "type": "segmentation2D",
                    "id": "segmentation2DId"
                },
                {
                    "type": "segmentedPhotos",
                    "id": "segmentedPhotosId"
                },
                {
                    "type": "lines3D",
                    "id": "lines3DId"
                },
                {
                    "type": "polygons3D",
                    "id": "polygons3DId"
                },
                {
                    "type": "exportedPolygons3DDGN",
                    "id": "exportedPolygons3DDGNId"
                },
                {
                    "type": "exportedPolygons3DCesium",
                    "id": "exportedPolygons3DCesiumId"
                },
                {
                    "type": "exportedPolygons3DGeoJSON",
                    "id": "exportedPolygons3DGeoJSONId"
                },
                {
                    "type": "exportedLines3DDGN",
                    "id": "exportedLines3DDGNId"
                },
                {
                    "type": "exportedLines3DCesium",
                    "id": "exportedLines3DCesiumId"
                },
                {
                    "type": "exportedLines3DGeoJSON",
                    "id": "exportedLines3DGeoJSONId"
                },
                ],
                "options": {
                    "minPhotos": "10",
                    "exportSrs": "EPSG:7415",
                    "computeLineWidth": "true",
                    "removeSmallComponents": "1"
                }
            };
            const s2DSettings = await S2DJobSettings.fromJson(json);
            return Promise.all([
                expect(s2DSettings.type).to.deep.equal("segmentation2D"),
                expect(s2DSettings.inputs).to.have.property("photos", "photosId"),
                expect(s2DSettings.inputs).to.have.property("photoSegmentationDetector", "photoSegmentationDetectorId"),
                expect(s2DSettings.inputs).to.have.property("meshes", "meshesId"),
                expect(s2DSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),
                expect(s2DSettings.inputs).to.have.property("segmentation2D", "segmentation2DId"),

                expect(s2DSettings.outputs).to.have.property("segmentation2D", "segmentation2DId"),
                expect(s2DSettings.outputs).to.have.property("segmentedPhotos", "segmentedPhotosId"),
                expect(s2DSettings.outputs).to.have.property("polygons3D", "polygons3DId"),
                expect(s2DSettings.outputs).to.have.property("lines3D", "lines3DId"),
                expect(s2DSettings.outputs).to.have.property("exportedPolygons3DDGN", "exportedPolygons3DDGNId"),
                expect(s2DSettings.outputs).to.have.property("exportedPolygons3DCesium", "exportedPolygons3DCesiumId"),
                expect(s2DSettings.outputs).to.have.property("exportedPolygons3DGeoJSON", "exportedPolygons3DGeoJSONId"),
                expect(s2DSettings.outputs).to.have.property("exportedLines3DDGN", "exportedLines3DDGNId"),
                expect(s2DSettings.outputs).to.have.property("exportedLines3DCesium", "exportedLines3DCesiumId"),
                expect(s2DSettings.outputs).to.have.property("exportedLines3DGeoJSON", "exportedLines3DGeoJSONId"),

                expect(s2DSettings.options.computeLineWidth).to.deep.equal(true),
                expect(s2DSettings.options.minPhotos).to.deep.equal(10),
                expect(s2DSettings.options.removeSmallComponents).to.deep.equal(1),
                expect(s2DSettings.options.exportSrs).to.deep.equal("EPSG:7415"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "type": "invalid",
                    "id": "photosId"
                }
                ],
                "outputs": [{
                    "type": "segmentation2D",
                    "id": "segmentation2DId"
                }
                ]
            };
            const s2DSettings = S2DJobSettings.fromJson(json);
            return expect(s2DSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "type": "photos",
                    "id": "photosId"
                }
                ],
                "outputs": [{
                    "type": "invalid",
                    "id": "segmentation2DId"
                }
                ]
            };
            const s2DSettings = S2DJobSettings.fromJson(json);
            return expect(s2DSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : invalid");
        });
    });

    describe("Settings from json : SOrtho", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "type": "orthophoto",
                    "id": "orthophotoId"
                },
                {
                    "type": "orthophotoSegmentationDetector",
                    "id": "orthophotoSegmentationDetectorId"
                }
                ],
                "outputs": [{
                    "type": "segmentation2D",
                    "id": "segmentation2DId"
                },
                {
                    "type": "segmentedPhotos",
                    "id": "segmentedPhotosId"
                },
                {
                    "type": "polygons2D",
                    "id": "polygons2DId"
                },
                {
                    "type": "exportedPolygons2DSHP",
                    "id": "exportedPolygons2DSHPId"
                },
                {
                    "type": "exportedPolygons2DGeoJSON",
                    "id": "exportedPolygons2DGeoJSONId"
                },
                {
                    "type": "lines2D",
                    "id": "lines2DId"
                },
                {
                    "type": "exportedLines2DSHP",
                    "id": "exportedLines2DSHPId"
                },
                {
                    "type": "exportedLines2DDGN",
                    "id": "exportedLines2DDGNId"
                },
                {
                    "type": "exportedLines2DGeoJSON",
                    "id": "exportedLines2DGeoJSONId"
                },
                ]
            };
            const orthoSettings = await SOrthoJobSettings.fromJson(json);
            return Promise.all([
                expect(orthoSettings.type).to.deep.equal("segmentationOrthophoto"),
                expect(orthoSettings.inputs).to.have.property("orthophoto", "orthophotoId"),
                expect(orthoSettings.inputs).to.have.property("orthophotoSegmentationDetector", "orthophotoSegmentationDetectorId"),

                expect(orthoSettings.outputs).to.have.property("segmentation2D", "segmentation2DId"),
                expect(orthoSettings.outputs).to.have.property("segmentedPhotos", "segmentedPhotosId"),
                expect(orthoSettings.outputs).to.have.property("polygons2D", "polygons2DId"),
                expect(orthoSettings.outputs).to.have.property("exportedPolygons2DSHP", "exportedPolygons2DSHPId"),
                expect(orthoSettings.outputs).to.have.property("exportedPolygons2DGeoJSON", "exportedPolygons2DGeoJSONId"),
                expect(orthoSettings.outputs).to.have.property("lines2D", "lines2DId"),
                expect(orthoSettings.outputs).to.have.property("exportedLines2DSHP", "exportedLines2DSHPId"),
                expect(orthoSettings.outputs).to.have.property("exportedLines2DDGN", "exportedLines2DDGNId"),
                expect(orthoSettings.outputs).to.have.property("exportedLines2DGeoJSON", "exportedLines2DGeoJSONId"),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "type": "invalid",
                    "id": "photosId"
                }
                ],
                "outputs": [{
                    "type": "segmentation2D",
                    "id": "segmentation2DId"
                }
                ]
            };
            const orthoSettings = SOrthoJobSettings.fromJson(json);
            return expect(orthoSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "type": "orthophoto",
                    "id": "orthophotoId"
                }
                ],
                "outputs": [{
                    "type": "invalid",
                    "id": "segmentation2DId"
                }
                ]
            };
            const orthoSettings = SOrthoJobSettings.fromJson(json);
            return expect(orthoSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : invalid");
        });
    });

    describe("Settings from json : S3D", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "type": "pointClouds",
                    "id": "pointCloudsId"
                },
                {
                    "type": "meshes",
                    "id": "meshesId"
                },
                {
                    "type": "pointCloudSegmentationDetector",
                    "id": "pointCloudSegmentationDetectorId"
                },
                {
                    "type": "segmentation3D",
                    "id": "segmentation3DId"
                },
                {
                    "type": "clipPolygon",
                    "id": "clipPolygonId"
                }
                ],
                "outputs": [{
                    "type": "segmentation3D",
                    "id": "segmentation3DId"
                },
                {
                    "type": "segmentedPointCloud",
                    "id": "segmentedPointCloudId"
                },
                {
                    "type": "exportedSegmentation3DPOD",
                    "id": "exportedSegmentation3DPODId"
                },
                {
                    "type": "exportedSegmentation3DLAS",
                    "id": "exportedSegmentation3DLASId"
                },
                {
                    "type": "exportedSegmentation3DLAZ",
                    "id": "exportedSegmentation3DLAZId"
                },
                {
                    "type": "exportedSegmentation3DPLY",
                    "id": "exportedSegmentation3DPLYId"
                },
                {
                    "type": "objects3D",
                    "id": "objects3DId"
                },
                {
                    "type": "exportedObjects3DDGN",
                    "id": "exportedObjects3DDGNId"
                },
                {
                    "type": "exportedObjects3DCesium",
                    "id": "exportedObjects3DCesiumId"
                },
                {
                    "type": "exportedObjects3DGeoJSON",
                    "id": "exportedObjects3DGeoJSONId"
                },
                {
                    "type": "exportedLocations3DSHP",
                    "id": "exportedLocations3DSHPId"
                },
                {
                    "type": "exportedLocations3DGeoJSON",
                    "id": "exportedLocations3DGeoJSONId"
                },
                {
                    "type": "exportedLines3DDGN",
                    "id": "exportedLines3DDGNId"
                },
                {
                    "type": "exportedLines3DCesium",
                    "id": "exportedLines3DCesiumId"
                },
                {
                    "type": "exportedLines3DGeoJSON",
                    "id": "exportedLines3DGeoJSONId"
                },
                {
                    "type": "polygons3D",
                    "id": "polygons3DId"
                },
                {
                    "type": "exportedPolygons3DDGN",
                    "id": "exportedPolygons3DDGNId"
                },
                {
                    "type": "exportedPolygons3DCesium",
                    "id": "exportedPolygons3DCesiumId"
                },
                {
                    "type": "exportedPolygons3DGeoJSON",
                    "id": "exportedPolygons3DGeoJSONId"
                },
                {
                    "type": "lines3D",
                    "id": "lines3DId"
                }
                ],
                "options": {
                    "saveConfidence": "true",
                    "exportSrs": "EPSG:2841",
                    "removeSmallComponents" : "1",
                    "computeLineWidth" : "true"
                }
            };
            const s3DSettings = await S3DJobSettings.fromJson(json);
            return Promise.all([
                expect(s3DSettings.type).to.deep.equal("segmentation3D"),
                expect(s3DSettings.inputs).to.have.property("pointClouds", "pointCloudsId"),
                expect(s3DSettings.inputs).to.have.property("meshes", "meshesId"),
                expect(s3DSettings.inputs).to.have.property("pointCloudSegmentationDetector", "pointCloudSegmentationDetectorId"),
                expect(s3DSettings.inputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(s3DSettings.inputs).to.have.property("clipPolygon", "clipPolygonId"),

                expect(s3DSettings.outputs).to.have.property("segmentation3D", "segmentation3DId"),
                expect(s3DSettings.outputs).to.have.property("segmentedPointCloud", "segmentedPointCloudId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DPOD", "exportedSegmentation3DPODId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DLAS", "exportedSegmentation3DLASId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DLAZ", "exportedSegmentation3DLAZId"),
                expect(s3DSettings.outputs).to.have.property("exportedSegmentation3DPLY", "exportedSegmentation3DPLYId"),
                expect(s3DSettings.outputs).to.have.property("objects3D", "objects3DId"),
                expect(s3DSettings.outputs).to.have.property("exportedObjects3DDGN", "exportedObjects3DDGNId"),
                expect(s3DSettings.outputs).to.have.property("exportedObjects3DCesium", "exportedObjects3DCesiumId"),
                expect(s3DSettings.outputs).to.have.property("exportedObjects3DGeoJSON", "exportedObjects3DGeoJSONId"),
                expect(s3DSettings.outputs).to.have.property("exportedLocations3DSHP", "exportedLocations3DSHPId"),
                expect(s3DSettings.outputs).to.have.property("exportedLocations3DGeoJSON", "exportedLocations3DGeoJSONId"),
                expect(s3DSettings.outputs).to.have.property("exportedLines3DDGN", "exportedLines3DDGNId"),
                expect(s3DSettings.outputs).to.have.property("exportedLines3DCesium", "exportedLines3DCesiumId"),
                expect(s3DSettings.outputs).to.have.property("exportedLines3DGeoJSON", "exportedLines3DGeoJSONId"),
                expect(s3DSettings.outputs).to.have.property("polygons3D", "polygons3DId"),
                expect(s3DSettings.outputs).to.have.property("exportedPolygons3DDGN", "exportedPolygons3DDGNId"),
                expect(s3DSettings.outputs).to.have.property("exportedPolygons3DCesium", "exportedPolygons3DCesiumId"),
                expect(s3DSettings.outputs).to.have.property("exportedPolygons3DGeoJSON", "exportedPolygons3DGeoJSONId"),
                expect(s3DSettings.outputs).to.have.property("lines3D", "lines3DId"),

                expect(s3DSettings.options.saveConfidence).to.deep.equal(true),
                expect(s3DSettings.options.exportSrs).to.deep.equal("EPSG:2841"),
                expect(s3DSettings.options.computeLineWidth).to.deep.equal(true),
                expect(s3DSettings.options.removeSmallComponents).to.deep.equal(1),
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "type": "invalid",
                    "id": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "type": "segmentation3D",
                    "id": "segmentation3DId"
                }
                ]
            };
            const s3DSettings = S3DJobSettings.fromJson(json);
            return expect(s3DSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "type": "pointClouds",
                    "id": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "type": "invalid",
                    "id": "segmentation3DId"
                }
                ]
            };
            const s3DSettings = S3DJobSettings.fromJson(json);
            return expect(s3DSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : invalid");
        });
    });

    describe("Settings from json : Change detection", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "type": "pointClouds1",
                    "id": "pointClouds1Id"
                },
                {
                    "type": "pointClouds2",
                    "id": "pointClouds2Id"
                },
                {
                    "type": "meshes1",
                    "id": "meshes1Id"
                },
                {
                    "type": "meshes2",
                    "id": "meshes2Id"
                }
                ],
                "outputs": [{
                    "type": "objects3D",
                    "id": "objects3DId"
                },
                {
                    "type": "exportedLocations3DSHP",
                    "id": "exportedLocations3DSHPId"
                },
                {
                    "type": "exportedLocations3DGeoJSON",
                    "id": "exportedLocations3DGeoJSONId"
                }
                ],
                "options": {
                    "colorThresholdLow": "10",
                    "colorThresholdHigh": "100",
                    "distThresholdLow": "10",
                    "distThresholdHigh": "100",
                    "resolution": "100",
                    "minPoints": "1000",
                    "exportSrs": "EPSG:5912"
                }
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
                expect(changeDetectionSettings.outputs).to.have.property("exportedLocations3DGeoJSON", "exportedLocations3DGeoJSONId"),

                expect(changeDetectionSettings.options.colorThresholdLow).to.deep.equal(10),
                expect(changeDetectionSettings.options.colorThresholdHigh).to.deep.equal(100),
                expect(changeDetectionSettings.options.distThresholdLow).to.deep.equal(10),
                expect(changeDetectionSettings.options.distThresholdHigh).to.deep.equal(100),
                expect(changeDetectionSettings.options.resolution).to.deep.equal(100),
                expect(changeDetectionSettings.options.minPoints).to.deep.equal(1000),
                expect(changeDetectionSettings.options.exportSrs).to.deep.equal("EPSG:5912")
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "type": "invalid",
                    "id": "pointClouds1Id"
                }
                ],
                "outputs": [{
                    "type": "objects3D",
                    "id": "objects3DId"
                }
                ]
            };
            const changeDetectionSettings = ChangeDetectionJobSettings.fromJson(json);
            return expect(changeDetectionSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "type": "meshes1",
                    "id": "meshes1Id"
                }
                ],
                "outputs": [{
                    "type": "invalid",
                    "id": "objects3DId"
                }
                ]
            };
            const changeDetectionSettings = ChangeDetectionJobSettings.fromJson(json);
            return expect(changeDetectionSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : invalid");
        });
    });

    describe("Settings from json : Extract ground", () => {
        it("Valid json", async function () {
            const json = {
                "inputs": [{
                    "type": "pointClouds",
                    "id": "pointCloudsId"
                },
                {
                    "type": "meshes",
                    "id": "meshesId"
                },
                {
                    "type": "pointCloudSegmentationDetector",
                    "id": "pointCloudSegmentationDetectorId"
                },
                {
                    "type": "clipPolygon",
                    "id": "clipPolygonId"
                }
                ],
                "outputs": [{
                    "type": "segmentation3D",
                    "id": "segmentation3DId"
                },
                {
                    "type": "segmentedPointCloud",
                    "id": "segmentedPointCloudId"
                },
                {
                    "type": "exportedSegmentation3DPOD",
                    "id": "exportedSegmentation3DPODId"
                },
                {
                    "type": "exportedSegmentation3DLAS",
                    "id": "exportedSegmentation3DLASId"
                },
                {
                    "type": "exportedSegmentation3DLAZ",
                    "id": "exportedSegmentation3DLAZId"
                }
                ],
                "options": {
                    "exportSrs": "EPSG:5912"
                }
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

                expect(extractGroundSettings.options.exportSrs).to.deep.equal("EPSG:5912")
            ]);
        });

        it("Invalid input", async function () {
            const json = {
                "inputs": [{
                    "type": "invalid",
                    "id": "clipPolygonId"
                }
                ],
                "outputs": [{
                    "type": "segmentation3D",
                    "id": "segmentation3DId"
                }
                ]
            };
            const extractGroundSettings = ExtractGroundJobSettings.fromJson(json);
            return expect(extractGroundSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : invalid");
        });

        it("Invalid output", async function () {
            const json = {
                "inputs": [{
                    "type": "pointClouds",
                    "id": "pointCloudsId"
                }
                ],
                "outputs": [{
                    "type": "invalid",
                    "id": "segmentation3DId"
                }
                ]
            };
            const extractGroundSettings = ExtractGroundJobSettings.fromJson(json);
            return expect(extractGroundSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : invalid");
        });
    });
});
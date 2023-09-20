/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BentleyError } from "@itwin/core-bentley";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { CCJobQuality, CCJobSettings } from "./Utils";


export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Modeling utils unit tests", () => {
    it("Settings to json", function () {
        const ccSettings = new CCJobSettings();
        ccSettings.inputs = ["imagesId", "ccOrientationsId"];
        ccSettings.outputs.cesium3DTiles = "cesium3DTiles";
        ccSettings.outputs.contextScene = "contextScene";
        ccSettings.outputs.dgn = "dgn";
        ccSettings.outputs.esri = "esri";
        ccSettings.outputs.fbx = "fbx";
        ccSettings.outputs.las = "las";
        ccSettings.outputs.lodTreeExport = "lodTreeExport";
        ccSettings.outputs.obj = "obj";
        ccSettings.outputs.omr = "omr";
        ccSettings.outputs.opc = "opc";
        ccSettings.outputs.orientations = "orientations";
        ccSettings.outputs.orthophoto = "orthophoto";
        ccSettings.outputs.ply = "ply";
        ccSettings.outputs.pod = "pod";
        ccSettings.outputs.threeMX = "threeMX";
        ccSettings.outputs.threeSM = "threeSM";
        ccSettings.outputs.webReadyScalableMesh = "webReadyScalableMesh";
        ccSettings.engines = 8;
        ccSettings.meshQuality = CCJobQuality.EXTRA;
        ccSettings.cacheSettings = {
            useCache: "useCache",
            createCache: true
        };
        const json = ccSettings.toJson();
        return Promise.all([
            expect(json).to.have.property("inputs"),
            expect(json.inputs).to.have.length.above(0),
            expect(json.inputs).to.deep.include({"id": "imagesId"}),
            expect(json.inputs).to.deep.include({"id": "ccOrientationsId"}),
            expect(json).to.have.property("settings"),
            expect(json.settings).to.have.property("outputs"),
            expect(json.settings.processingEngines).to.deep.equal(8),
            expect(json.settings.quality).to.deep.equal(CCJobQuality.EXTRA),
            expect(json.settings.outputs).to.have.length.above(0),
            expect(json.settings.outputs).to.deep.include("Cesium 3D Tiles"),
            expect(json.settings.outputs).to.deep.include("DGN"),
            expect(json.settings.outputs).to.deep.include("WebReady ScalableMesh"),
            expect(json.settings.outputs).to.deep.include("FBX"),
            expect(json.settings.outputs).to.deep.include("ESRI i3s"),
            expect(json.settings.outputs).to.deep.include("LAS"),
            expect(json.settings.outputs).to.deep.include("LODTreeExport"),
            expect(json.settings.outputs).to.deep.include("OBJ"),
            expect(json.settings.outputs).to.deep.include("OPC"),
            expect(json.settings.outputs).to.deep.include("OMR"),
            expect(json.settings.outputs).to.deep.include("CCOrientations"),
            expect(json.settings.outputs).to.deep.include("Orthophoto/DSM"),
            expect(json.settings.outputs).to.deep.include("PLY"),
            expect(json.settings.outputs).to.deep.include("POD"),
            expect(json.settings.outputs).to.deep.include("3MX"),
            expect(json.settings.outputs).to.deep.include("3SM"),
            expect(json.settings.outputs).to.deep.include("ContextScene"),
            expect(json.settings).to.have.property("cacheSettings"),
            expect(json.settings.cacheSettings.createCache).to.deep.equal(true),
            expect(json.settings.cacheSettings.useCache).to.deep.equal("useCache"),
        ]);
    });

    it("Settings from json", async function () {
        const json = {
            "inputs": [{"id": "imagesId"}, {"id": "ccOrientationsId"}],
            "jobSettings": {
                "quality": "Extra",
                "outputs": [
                    {"format": "Cesium 3D Tiles", "id": "cesium3DTilesId"},
                    {"format": "DGN", "id": "dgnId"},
                    {"format": "WebReady ScalableMesh", "id": "webReadyScalableMeshId"},
                    {"format": "FBX", "id": "fbxId"},
                    {"format": "ESRI i3s", "id": "esriId"},
                    {"format": "LAS", "id": "lasId"},
                    {"format": "LODTreeExport", "id": "lodTreeExportId"},
                    {"format": "OBJ", "id": "objId"},
                    {"format": "OPC", "id": "opcId"},
                    {"format": "OMR", "id": "omrId"},
                    {"format": "CCOrientations", "id": "orientationsId"},
                    {"format": "Orthophoto/DSM", "id": "orthophotoId"},
                    {"format": "PLY", "id": "plyId"},
                    {"format": "POD", "id": "podId"},
                    {"format": "3MX", "id": "threeMXId"},
                    {"format": "3SM", "id": "threeSMId"},
                    {"format": "ContextScene", "id": "contextSceneId"},
                ],
                "processingEngines": 5,
                "cacheSettings": {
                    "createCache": true,
                    "useCache": "799b11bd-71cf-481a-b284-bf48f672cd9a"
                },
            }
        };
        const contextCaptureSettings = await CCJobSettings.fromJson(json);
        return Promise.all([
            expect(contextCaptureSettings.meshQuality).to.deep.equal(CCJobQuality.EXTRA),
            expect(contextCaptureSettings.engines).to.deep.equal(5),
            expect(contextCaptureSettings.cacheSettings).to.not.be.undefined,
            expect(contextCaptureSettings.cacheSettings!.createCache).to.deep.equal(true),
            expect(contextCaptureSettings.cacheSettings!.useCache).to.deep.equal("799b11bd-71cf-481a-b284-bf48f672cd9a"),

            expect(contextCaptureSettings.inputs).to.deep.include("imagesId"),
            expect(contextCaptureSettings.inputs).to.deep.include("ccOrientationsId"),

            expect(contextCaptureSettings.outputs.cesium3DTiles).to.deep.equal("cesium3DTilesId"),
            expect(contextCaptureSettings.outputs.dgn).to.deep.equal("dgnId"),
            expect(contextCaptureSettings.outputs.webReadyScalableMesh).to.deep.equal("webReadyScalableMeshId"),
            expect(contextCaptureSettings.outputs.fbx).to.deep.equal("fbxId"),
            expect(contextCaptureSettings.outputs.las).to.deep.equal("lasId"),
            expect(contextCaptureSettings.outputs.esri).to.deep.equal("esriId"),
            expect(contextCaptureSettings.outputs.lodTreeExport).to.deep.equal("lodTreeExportId"),
            expect(contextCaptureSettings.outputs.obj).to.deep.equal("objId"),
            expect(contextCaptureSettings.outputs.opc).to.deep.equal("opcId"),
            expect(contextCaptureSettings.outputs.omr).to.deep.equal("omrId"),
            expect(contextCaptureSettings.outputs.orientations).to.deep.equal("orientationsId"),
            expect(contextCaptureSettings.outputs.orthophoto).to.deep.equal("orthophotoId"),
            expect(contextCaptureSettings.outputs.ply).to.deep.equal("plyId"),
            expect(contextCaptureSettings.outputs.pod).to.deep.equal("podId"),
            expect(contextCaptureSettings.outputs.threeMX).to.deep.equal("threeMXId"),
            expect(contextCaptureSettings.outputs.threeSM).to.deep.equal("threeSMId"),
            expect(contextCaptureSettings.outputs.contextScene).to.deep.equal("contextSceneId"),
        ]);
    });

    it("Settings from json (unexpected output)", async function () {
        const json = {
            "inputs": [{"id": "imagesId"}, {"id": "ccOrientationsId"}],
            "jobSettings": {
                "outputs": [
                    {"format": "Invalid", "id": "cesium3DTilesId"},
                ],
            }
        };
        const contextCaptureSettings = CCJobSettings.fromJson(json);
        return expect(contextCaptureSettings).to.eventually.be.rejectedWith(BentleyError).and.have.property("message", "Found unexpected output name : Invalid");
    });
});
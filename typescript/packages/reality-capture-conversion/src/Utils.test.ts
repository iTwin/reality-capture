/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { RCJobSettings } from "./Utils";
chai.use(chaiAsPromised);

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reality Conversion utils unit tests", () => {
    it("Settings to json", function () {
        const ccSettings = new RCJobSettings();
        ccSettings.inputs.e57 = ["e57Id"];
        ccSettings.inputs.las = ["lasId"];
        ccSettings.inputs.laz = ["lazId"];
        ccSettings.inputs.ply = ["plyId"];
        ccSettings.inputs.opc = ["opcId"];
        ccSettings.inputs.pnts = ["pntsId"];
        ccSettings.inputs.pointcloud = ["pointcloudId"];
        ccSettings.outputs.opc = true;
        ccSettings.outputs.pnts = true;
        ccSettings.outputs.glb = true;
        ccSettings.outputs.glbc = true;
        ccSettings.options.engines = 8;
        ccSettings.options.merge = true;
        ccSettings.options.inputSrs = "EPSG:32634";
        ccSettings.options.outputSrs = "EPSG:32634";
        const json = ccSettings.toJson();
        return Promise.all([
            expect(json).to.have.property("inputs"),
            expect(json.inputs).to.have.length.above(0),
            expect(json.inputs).to.deep.include({ "id": "lasId" }),
            expect(json.inputs).to.deep.include({ "id": "lazId" }),
            expect(json.inputs).to.deep.include({ "id": "plyId" }),
            expect(json.inputs).to.deep.include({ "id": "e57Id" }),
            expect(json.inputs).to.deep.include({ "id": "opcId" }),
            expect(json.inputs).to.deep.include({ "id": "pntsId" }),
            expect(json.inputs).to.deep.include({ "id": "pointcloudId" }),
            expect(json).to.have.property("outputs"),
            expect(json.outputs).to.have.length.above(0),
            expect(json.outputs).to.deep.include("OPC"),
            expect(json.outputs).to.deep.include("PNTS"),
            expect(json.outputs).to.deep.include("GLB"),
            expect(json.outputs).to.deep.include("GLBC"),
            expect(json).to.have.property("options"),
            expect(json.options).to.have.property("processingEngines"),
            expect(json.options.processingEngines).to.deep.equal(8),
            expect(json.options).to.have.property("merge"),
            expect(json.options.processingEngines).to.deep.equal(true),
            expect(json.options).to.have.property("inputSRS"),
            expect(json.options.processingEngines).to.deep.equal("EPSG:32634"),
            expect(json.options).to.have.property("outputSRS"),
            expect(json.options.processingEngines).to.deep.equal("EPSG:32634"),
        ]);
    });

    it("Settings from json", async function () {
        const json = {
            "inputs": [{"type": "LAS", "id": "lasId"}, {"type": "LAZ", "id": "lazId"}, {"type": "PLY", "id": "plyId"}, {"type": "E57", "id": "e57Id"}, 
                {"type": "PNTS", "id": "pntsId"}, {"type": "OPC", "id": "opcId"}, {"type": "PointCloud", "id": "pointcloudId"}],
            "outputs": [{"type": "OPC", "id": "opcId"}, {"type": "PNTS", "id": "pntsId"}, {"type": "GLB", "id": "glbId"}, {"type": "GLBC", "id": "glbcId"}],
            "options": {
                "processingEngines": 8,
                "merge": true,
                "inputSRS": "EPSG:32634",
                "outputSRS": "EPSG:32634",
            },
        };
        const realityConversionSettings = await RCJobSettings.fromJson(json);
        return Promise.all([
            expect(realityConversionSettings.inputs.e57).to.have.length.above(0),
            expect(realityConversionSettings.inputs.las).to.have.length.above(0),
            expect(realityConversionSettings.inputs.laz).to.have.length.above(0),
            expect(realityConversionSettings.inputs.ply).to.have.length.above(0),
            expect(realityConversionSettings.inputs.pnts).to.have.length.above(0),
            expect(realityConversionSettings.inputs.opc).to.have.length.above(0),
            expect(realityConversionSettings.inputs.pointcloud).to.have.length.above(0),
            expect(realityConversionSettings.inputs.e57).to.deep.include("e57Id"),
            expect(realityConversionSettings.inputs.las).to.deep.include("lasId"),
            expect(realityConversionSettings.inputs.laz).to.deep.include("lazId"),
            expect(realityConversionSettings.inputs.ply).to.deep.include("plyId"),
            expect(realityConversionSettings.inputs.opc).to.deep.include("opcId"),
            expect(realityConversionSettings.inputs.pnts).to.deep.include("pntsId"),
            expect(realityConversionSettings.inputs.pointcloud).to.deep.include("pointcloudId"),
            expect(realityConversionSettings.outputs.opc).to.have.length.above(0),
            expect(realityConversionSettings.outputs.pnts).to.have.length.above(0),
            expect(realityConversionSettings.outputs.glb).to.have.length.above(0),
            expect(realityConversionSettings.outputs.glbc).to.have.length.above(0),
            expect(realityConversionSettings.outputs.opc).to.deep.include("opcId"),
            expect(realityConversionSettings.outputs.pnts).to.deep.include("pntsId"),
            expect(realityConversionSettings.outputs.glb).to.deep.include("glbId"),
            expect(realityConversionSettings.outputs.glbc).to.deep.include("glbcId"),
            expect(realityConversionSettings.options.engines).to.deep.equal(8),
            expect(realityConversionSettings.options.merge).to.deep.equal(true),
            expect(realityConversionSettings.options.inputSrs).to.deep.equal("EPSG:32634"),
            expect(realityConversionSettings.options.outputSrs).to.deep.equal("EPSG:32634"),
        ]);
    });

    it("Settings from json (unexpected input)", async function () {
        const json = {
            "inputs": [{"type": "Invalid", "id": "lasId"}],
            "outputs": [{"type": "OPC", "id": "OPCId"}],
            "options": {
                "processingEngines": 8,               
            },
        };
        const realityConversionSettings = RCJobSettings.fromJson(json);
        return expect(realityConversionSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected input type : Invalid");
    });

    it("Settings from json (unexpected output)", async function () {
        const json = {
            "inputs": [{"type": "LAS", "id": "lasId"}],
            "outputs": [{"type": "Invalid", "id": "OPCId"}],
            "options": {
                "processingEngines": 8,               
            },
        };
        const realityConversionSettings = RCJobSettings.fromJson(json);
        return expect(realityConversionSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output type : Invalid");
    });
});
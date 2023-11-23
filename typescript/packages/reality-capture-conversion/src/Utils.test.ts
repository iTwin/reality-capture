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
        ccSettings.outputs.opc = true;
        ccSettings.options.engines = 8;
        const json = ccSettings.toJson();
        return Promise.all([
            expect(json).to.have.property("inputs"),
            expect(json.inputs).to.have.length.above(0),
            expect(json.inputs).to.deep.include({ "type": "LAS", "id": "lasId" }),
            expect(json.inputs).to.deep.include({ "type": "LAZ", "id": "lazId" }),
            expect(json.inputs).to.deep.include({ "type": "PLY", "id": "plyId" }),
            expect(json.inputs).to.deep.include({ "type": "E57", "id": "e57Id" }),
            expect(json).to.have.property("outputs"),
            expect(json.outputs).to.have.length.above(0),
            expect(json.outputs).to.deep.include("OPC"),
            expect(json).to.have.property("options"),
            expect(json.options).to.have.property("processingEngines"),
            expect(json.options.processingEngines).to.deep.equal(8),
        ]);
    });

    it("Settings from json", async function () {
        const json = {
            "inputs": [{"type": "LAS", "id": "lasId"}, {"type": "LAZ", "id": "lazId"}, {"type": "PLY", "id": "plyId"}, {"type": "E57", "id": "e57Id"}],
            "outputs": [{"format": "OPC", "id": "OPCId"}],
            "options": {
                "processingEngines": 8,               
            },
        };
        const realityConversionSettings = await RCJobSettings.fromJson(json);
        return Promise.all([
            expect(realityConversionSettings.inputs.e57).to.have.length.above(0),
            expect(realityConversionSettings.inputs.las).to.have.length.above(0),
            expect(realityConversionSettings.inputs.laz).to.have.length.above(0),
            expect(realityConversionSettings.inputs.ply).to.have.length.above(0),
            expect(realityConversionSettings.inputs.e57).to.deep.include("e57Id"),
            expect(realityConversionSettings.inputs.las).to.deep.include("lasId"),
            expect(realityConversionSettings.inputs.laz).to.deep.include("lazId"),
            expect(realityConversionSettings.inputs.ply).to.deep.include("plyId"),
            expect(realityConversionSettings.outputs.opc).to.have.length.above(0),
            expect(realityConversionSettings.outputs.opc).to.deep.include("OPCId"),
            expect(realityConversionSettings.options.engines).to.deep.equal(8),
        ]);
    });

    it("Settings from json (unexpected input)", async function () {
        const json = {
            "inputs": [{"type": "Invalid", "id": "lasId"}],
            "outputs": [{"format": "OPC", "id": "OPCId"}],
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
            "outputs": [{"format": "Invalid", "id": "OPCId"}],
            "options": {
                "processingEngines": 8,               
            },
        };
        const realityConversionSettings = RCJobSettings.fromJson(json);
        return expect(realityConversionSettings).to.eventually.be.rejectedWith(Error).and.have.property("message", "Found unexpected output format : Invalid");
    });
});
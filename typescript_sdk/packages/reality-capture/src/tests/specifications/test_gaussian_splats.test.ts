import { expect } from "chai";
import { z } from "zod";
import {
    GaussianSplatsInputsSchema,
    GaussianSplatsOutputsSchema,
    GaussianSplatsOptionsSchema,
    GaussianSplatsSpecificationsSchema,
    GaussianSplatsSpecificationsCreateSchema,
    GSFormat,
    GaussianSplatsOutputsCreate
} from "../../specifications/gaussian_splats";

describe("GaussianSplatsInputsSchema", () => {
    it("should validate a valid input", () => {
        const data = { scene: "sceneId", splatsReference: "refId" };
        expect(() => GaussianSplatsInputsSchema.parse(data)).to.not.throw();
    });

    it("should require scene", () => {
        const data = { splatsReference: "refId" };
        expect(() => GaussianSplatsInputsSchema.parse(data)).to.throw(z.ZodError);
    });

    it("should allow optional splatsReference", () => {
        const data = { scene: "sceneId" };
        expect(() => GaussianSplatsInputsSchema.parse(data)).to.not.throw();
    });
});

describe("GaussianSplatsOutputsSchema", () => {
    it("should validate with both splats and splatsReference", () => {
        const data = { splats: "splatsId", splatsReference: "refId" };
        expect(() => GaussianSplatsOutputsSchema.parse(data)).to.not.throw();
    });

    it("should validate with only splatsReference", () => {
        const data = { splatsReference: "refId" };
        expect(() => GaussianSplatsOutputsSchema.parse(data)).to.not.throw();
    });

    it("should validate with empty object", () => {
        const data = {};
        expect(() => GaussianSplatsOutputsSchema.parse(data)).to.not.throw();
    });
});

describe("GaussianSplatsOptionsSchema", () => {
    it("should validate with valid format", () => {
        const data = { format: GSFormat.SPZ };
        expect(() => GaussianSplatsOptionsSchema.parse(data)).to.not.throw();
    });

    it("should validate with no format", () => {
        const data = {};
        expect(() => GaussianSplatsOptionsSchema.parse(data)).to.not.throw();
    });

    it("should throw with invalid format", () => {
        const data = { format: "INVALID" };
        expect(() => GaussianSplatsOptionsSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("GaussianSplatsSpecificationsSchema", () => {
    it("should validate a complete specification", () => {
        const data = {
            inputs: { scene: "sceneId", splatsReference: "refId" },
            outputs: { splats: "splatsId", splatsReference: "refId" },
            options: { format: GSFormat.PLY }
        };
        expect(() => GaussianSplatsSpecificationsSchema.parse(data)).to.not.throw();
    });

    it("should validate with only inputs and outputs", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: {}
        };
        expect(() => GaussianSplatsSpecificationsSchema.parse(data)).to.not.throw();
    });

    it("should throw if inputs are missing", () => {
        const data = {
            outputs: {},
            options: { format: GSFormat.SPZ }
        };
        expect(() => GaussianSplatsSpecificationsSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("GaussianSplatsSpecificationsCreateSchema", () => {
    it("should validate with all outputs", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: [GaussianSplatsOutputsCreate.SPLATS, GaussianSplatsOutputsCreate.SPLATS_REFERENCE],
            options: { format: GSFormat.THREED_TILES }
        };
        expect(() => GaussianSplatsSpecificationsCreateSchema.parse(data)).to.not.throw();
    });

    it("should validate with empty outputs array", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: []
        };
        expect(() => GaussianSplatsSpecificationsCreateSchema.parse(data)).to.not.throw();
    });

    it("should throw with invalid output", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: ["INVALID"]
        };
        expect(() => GaussianSplatsSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
    });
});
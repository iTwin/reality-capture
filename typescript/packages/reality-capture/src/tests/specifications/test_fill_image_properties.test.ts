import { expect } from "chai";
import { z } from "zod";
import {
    AltitudeReference,
    FillImagePropertiesInputsSchema,
    FillImagePropertiesOutputsSchema,
    FillImagePropertiesOptionsSchema,
    FillImagePropertiesSpecificationsSchema,
    FillImagePropertiesOutputsCreate,
    FillImagePropertiesSpecificationsCreateSchema,
    FillImagePropertiesCostSchema,
} from "../../specifications/fill_image_properties";

describe("FillImagePropertiesSchemas", () => {
    describe("FillImagePropertiesInputsSchema", () => {
        it("should validate correct input", () => {
            const validInput = {
                imageCollections: ["id1", "id2"],
                sceneToProcess: "sceneId1",
                sceneToComplete: "sceneId2",
                presets: ["/preset/path1", "/preset/path2"],
            };
            expect(() => FillImagePropertiesInputsSchema.parse(validInput)).to.not.throw();
        });

        it("should allow missing optional fields", () => {
            const validInput = {};
            expect(() => FillImagePropertiesInputsSchema.parse(validInput)).to.not.throw();
        });
    });

    describe("FillImagePropertiesOutputsSchema", () => {
        it("should validate correct output", () => {
            const validOutput = { scene: "sceneId1" };
            expect(() => FillImagePropertiesOutputsSchema.parse(validOutput)).to.not.throw();
        });

        it("should fail on missing scene", () => {
            const invalidOutput = {};
            expect(() => FillImagePropertiesOutputsSchema.parse(invalidOutput)).to.throw(z.ZodError);
        });
    });

    describe("FillImagePropertiesOptionsSchema", () => {
        it("should validate all combinations", () => {
            const validOptions1 = { recursiveImageCollections: true, altitudeReference: AltitudeReference.SEA_LEVEL };
            const validOptions2 = {};
            const validOptions3 = { altitudeReference: AltitudeReference.WGS84_ELLIPSOID };
            expect(() => FillImagePropertiesOptionsSchema.parse(validOptions1)).to.not.throw();
            expect(() => FillImagePropertiesOptionsSchema.parse(validOptions2)).to.not.throw();
            expect(() => FillImagePropertiesOptionsSchema.parse(validOptions3)).to.not.throw();
        });

        it("should fail with invalid altitudeReference", () => {
            const invalidOptions = { altitudeReference: "randomString" };
            expect(() => FillImagePropertiesOptionsSchema.parse(invalidOptions)).to.throw(z.ZodError);
        });
    });

    describe("FillImagePropertiesSpecificationsSchema", () => {
        it("should validate correct spec", () => {
            const validSpec = {
                inputs: {},
                outputs: { scene: "sceneId" },
                options: { recursiveImageCollections: false, altitudeReference: AltitudeReference.SEA_LEVEL },
            };
            expect(() => FillImagePropertiesSpecificationsSchema.parse(validSpec)).to.not.throw();
        });

        it("should allow missing options", () => {
            const validSpec = {
                inputs: {},
                outputs: { scene: "sceneId" },
            };
            expect(() => FillImagePropertiesSpecificationsSchema.parse(validSpec)).to.not.throw();
        });

        it("should fail with missing required fields", () => {
            const invalidSpec = { outputs: { scene: "sceneId" } };
            expect(() => FillImagePropertiesSpecificationsSchema.parse(invalidSpec)).to.throw(z.ZodError);
        });
    });

    describe("FillImagePropertiesSpecificationsCreateSchema", () => {
        it("should validate valid create spec", () => {
            const validCreateSpec = {
                inputs: {},
                outputs: [FillImagePropertiesOutputsCreate.SCENE],
                options: { recursiveImageCollections: true },
            };
            expect(() => FillImagePropertiesSpecificationsCreateSchema.parse(validCreateSpec)).to.not.throw();
        });

        it("should fail on outputs with invalid enum", () => {
            const invalidCreateSpec = {
                inputs: {},
                outputs: ["invalid"],
            };
            expect(() => FillImagePropertiesSpecificationsCreateSchema.parse(invalidCreateSpec)).to.throw();
        });
    });

    describe("FillImagePropertiesCostSchema", () => {
        it("should validate correct cost", () => {
            const validCost = { imageCount: 42 };
            expect(() => FillImagePropertiesCostSchema.parse(validCost)).to.not.throw();
        });

        it("should fail with non-number imageCount", () => {
            const invalidCost = { imageCount: "forty-two" };
            expect(() => FillImagePropertiesCostSchema.parse(invalidCost)).to.throw(z.ZodError);
        });

        it("should fail with missing imageCount", () => {
            const invalidCost = {};
            expect(() => FillImagePropertiesCostSchema.parse(invalidCost)).to.throw(z.ZodError);
        });
    });
});
import { expect } from "chai";
import { z } from "zod";
import {
  ChangeDetectionOutputsCreate,
  ChangeDetectionInputsSchema,
  ChangeDetectionOutputsSchema,
  ChangeDetectionOptionsSchema,
  ChangeDetectionSpecificationsCreateSchema,
  ChangeDetectionSpecificationsSchema,
} from "../../src/specifications/change_detection";

describe("change_detection specifications", () => {
  describe("ChangeDetectionInputsSchema", () => {
    it("should validate valid inputs", () => {
      const valid = {
        reference: "contextSceneId1",
        toCompare: "contextSceneId2",
      };
      expect(() => ChangeDetectionInputsSchema.parse(valid)).not.to.throw();
    });

    it("should fail when missing reference", () => {
      const invalid = { toCompare: "contextSceneId2" };
      expect(() => ChangeDetectionInputsSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should fail when missing toCompare", () => {
      const invalid = { reference: "contextSceneId1" };
      expect(() => ChangeDetectionInputsSchema.parse(invalid)).to.throw(z.ZodError);
    });
  });

  describe("ChangeDetectionOutputsSchema", () => {
    it("should validate with all outputs", () => {
      const valid = {
        objects3D: "obj3dId",
        locations3DAsSHP: "shpId",
        locations3DAsGeoJSON: "geojsonId",
        added: "addedId",
        removed: "removedId",
      };
      expect(() => ChangeDetectionOutputsSchema.parse(valid)).not.to.throw();
    });

    it("should validate with no outputs", () => {
      const valid = {};
      expect(() => ChangeDetectionOutputsSchema.parse(valid)).not.to.throw();
    });
  });

  describe("ChangeDetectionOptionsSchema", () => {
    it("should validate all options", () => {
      const valid = {
        outputCrs: "EPSG:4326",
        minPointsPerChange: 10,
        meshSamplingResolution: 0.5,
        threshold: 0.2,
        filterThreshold: 0.1,
      };
      expect(() => ChangeDetectionOptionsSchema.parse(valid)).not.to.throw();
    });

    it("should validate options with only int for minPointsPerChange", () => {
      const valid = { minPointsPerChange: 5 };
      expect(() => ChangeDetectionOptionsSchema.parse(valid)).not.to.throw();
    });

    it("should fail if minPointsPerChange is not int", () => {
      const invalid = { minPointsPerChange: 1.23 };
      expect(() => ChangeDetectionOptionsSchema.parse(invalid)).to.throw(z.ZodError);
    });
  });

  describe("ChangeDetectionSpecificationsCreateSchema", () => {
    it("should validate valid specification", () => {
      const valid = {
        inputs: { reference: "id1", toCompare: "id2" },
        outputs: [ChangeDetectionOutputsCreate.ADDED, ChangeDetectionOutputsCreate.REMOVED],
        options: { minPointsPerChange: 10 },
      };
      expect(() => ChangeDetectionSpecificationsCreateSchema.parse(valid)).not.to.throw();
    });

    it("should fail if outputs contains invalid value", () => {
      const invalid = {
        inputs: { reference: "id1", toCompare: "id2" },
        outputs: ["notValidValue"],
      };
      expect(() => ChangeDetectionSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should validate without options", () => {
      const valid = {
        inputs: { reference: "id1", toCompare: "id2" },
        outputs: [ChangeDetectionOutputsCreate.OBJECTS3D],
      };
      expect(() => ChangeDetectionSpecificationsCreateSchema.parse(valid)).not.to.throw();
    });
  });

  describe("ChangeDetectionSpecificationsSchema", () => {
    it("should validate valid specification", () => {
      const valid = {
        inputs: { reference: "id1", toCompare: "id2" },
        outputs: {
          objects3D: "objId",
          locations3DAsSHP: "shpId",
        },
        options: { meshSamplingResolution: 0.5 },
      };
      expect(() => ChangeDetectionSpecificationsSchema.parse(valid)).not.to.throw();
    });

    it("should fail if outputs is missing", () => {
      const invalid = {
        inputs: { reference: "id1", toCompare: "id2" },
      };
      expect(() => ChangeDetectionSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should validate without options", () => {
      const valid = {
        inputs: { reference: "id1", toCompare: "id2" },
        outputs: {
          objects3D: "objId"
        },
      };
      expect(() => ChangeDetectionSpecificationsSchema.parse(valid)).not.to.throw();
    });
  });
});
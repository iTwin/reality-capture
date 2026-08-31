import { expect } from "chai";
import { z } from "zod";
import {
  ChangeDetectionOutputsCreate,
  ChangeDetectionInputsSchema,
  ChangeDetectionOutputsSchema,
  ChangeDetectionOptionsSchema,
  ChangeDetectionSpecificationsCreateSchema,
  ChangeDetectionSpecificationsSchema,
} from "../../specifications/change_detection";

describe("change_detection specifications", () => {
  describe("ChangeDetectionInputsSchema", () => {
    it("should validate valid inputs", () => {
      const valid = {
        model3DA: "contextSceneId1",
        model3DB: "contextSceneId2",
      };
      expect(() => ChangeDetectionInputsSchema.parse(valid)).not.to.throw();
    });

    it("should fail when missing reference", () => {
      const invalid = { model3DB: "contextSceneId2" };
      expect(() => ChangeDetectionInputsSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should fail when missing toCompare", () => {
      const invalid = { model3DA: "contextSceneId1" };
      expect(() => ChangeDetectionInputsSchema.parse(invalid)).to.throw(z.ZodError);
    });
  });

  describe("ChangeDetectionOutputsSchema", () => {
    it("should validate with all outputs", () => {
      const valid = {
        segmentation3DA: "segmentationAId",
        segmentedModel3DA: "segmentedModelAId",
        segmentation3DB: "segmentationBId",
        segmentedModel3DB: "segmentedModelBId",
        locations3DA: "locationsAId",
        locations3DB: "locationsBId",
        locations3DAAsSHP: "shpAId",
        locations3DAAsGeoJSON: "geojsonAId",
        locations3DBAsSHP: "shpBId",
        locations3DBAsGeoJSON: "geojsonBId",
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
        minPointsPerChange: 100,
        samplingResolution: 0.5,
        growThreshold: 0.5,
        filterThreshold: 0.2,
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
        inputs: { model3DA: "id1", model3DB: "id2" },
        outputs: [ChangeDetectionOutputsCreate.SEGMENTED_MODEL3D_A, ChangeDetectionOutputsCreate.SEGMENTED_MODEL3D_B],
        options: { minPointsPerChange: 10 },
      };
      expect(() => ChangeDetectionSpecificationsCreateSchema.parse(valid)).not.to.throw();
    });

    it("should fail if outputs contains invalid value", () => {
      const invalid = {
        inputs: { model3DA: "id1", model3DB: "id2" },
        outputs: ["notValidValue"],
      };
      expect(() => ChangeDetectionSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
    });

  });

  describe("ChangeDetectionSpecificationsSchema", () => {
    it("should validate valid specification", () => {
      const valid = {
        inputs: { model3DA: "id1", model3DB: "id2" },
        outputs: {
          locations3DAAsSHP: "shpId",
        },
        options: { samplingResolution: 0.5 },
      };
      expect(() => ChangeDetectionSpecificationsSchema.parse(valid)).not.to.throw();
    });

    it("should fail if outputs is missing", () => {
      const invalid = {
        inputs: { model3DA: "id1", model3DB: "id2" },
      };
      expect(() => ChangeDetectionSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
    });
  });
});

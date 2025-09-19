import { expect } from "chai";

import {
  CalibrationOutputsCreate,
  RigSynchro,
  RotationPolicy,
  CenterPolicy,
  FocalPolicy,
  PrincipalPolicy,
  RadialPolicy,
  TangentialPolicy,
  FisheyeFocalPolicy,
  FisheyeDistortionPolicy,
  AspectRatioPolicy,
  SkewPolicy,
  TiepointsPolicy,
  PairSelection,
  KeypointsDensity,
  Tag,
  ColorEqualization,
  AdjustmentConstraints,
  RigidRegistrationPosition,
  RigidRegistrationRotation,
  RigidRegistrationScale,
  CalibrationInputsSchema,
  CalibrationOutputsSchema,
  CalibrationOptionsSchema,
  CalibrationSpecificationsSchema,
  CalibrationSpecificationsCreateSchema,
  CalibrationCostSchema
} from "../../../reality_capture/src/specifications/calibration";

describe("calibration.ts", () => {
  describe("Enums", () => {
    it("CalibrationOutputsCreate should have correct values", () => {
      expect(CalibrationOutputsCreate.SCENE).to.equal("scene");
      expect(CalibrationOutputsCreate.REPORT).to.equal("report");
      expect(CalibrationOutputsCreate.TEXTURED_TIE_POINTS).to.equal("texturedTiePoints");
    });

    it("RigSynchro should have correct values", () => {
      expect(RigSynchro.NO).to.equal("None");
      expect(RigSynchro.STRICT).to.equal("Strict");
      expect(RigSynchro.LOOSE).to.equal("Loose");
    });

    it("RotationPolicy should have correct values", () => {
      expect(RotationPolicy.COMPUTE).to.equal("Compute");
      expect(RotationPolicy.ADJUST).to.equal("Adjust");
      expect(RotationPolicy.KEEP).to.equal("Keep");
      expect(RotationPolicy.EXTEND).to.equal("Extend");
    });

    it("CenterPolicy should have correct values", () => {
      expect(CenterPolicy.COMPUTE).to.equal("Compute");
      expect(CenterPolicy.ADJUST).to.equal("Adjust");
      expect(CenterPolicy.ADJUST_WITHIN_TOLERANCE).to.equal("AdjustWithinTolerance");
      expect(CenterPolicy.KEEP).to.equal("Keep");
      expect(CenterPolicy.EXTEND).to.equal("Extend");
    });
  });

  describe("CalibrationInputsSchema", () => {
    it("should validate correct input", () => {
      const valid = {
        scene: "scene-id",
        presets: ["preset/path/one", "preset/path/two"]
      };
      expect(() => CalibrationInputsSchema.parse(valid)).to.not.throw();
    });

    it("should allow presets to be missing", () => {
      const valid = { scene: "scene-id" };
      expect(() => CalibrationInputsSchema.parse(valid)).to.not.throw();
    });

    it("should throw on missing scene", () => {
      const invalid = { presets: ["preset/path"] };
      expect(() => CalibrationInputsSchema.parse(invalid)).to.throw();
    });
  });

  describe("CalibrationOutputsSchema", () => {
    it("should validate correct output", () => {
      const valid = {
        scene: "scene-id",
        report: "bkt:/bucket/calibration/report.pdf",
        texturedTiePoints: "tp-id"
      };
      expect(() => CalibrationOutputsSchema.parse(valid)).to.not.throw();
    });

    it("should allow optional fields to be missing", () => {
      const valid = { scene: "scene-id" };
      expect(() => CalibrationOutputsSchema.parse(valid)).to.not.throw();
    });

    it("should throw on invalid report regex", () => {
      const invalid = {
        scene: "scene-id",
        report: "invalid-report-path"
      };
      expect(() => CalibrationOutputsSchema.parse(invalid)).to.throw();
    });
  });

  describe("CalibrationOptionsSchema", () => {
    it("should validate correct options", () => {
      const valid = {
        rigSynchro: RigSynchro.STRICT,
        rotationPolicy: RotationPolicy.ADJUST,
        centerPolicy: CenterPolicy.ADJUST_WITHIN_TOLERANCE,
        centerTolerance: 0.01,
        focalPolicy: FocalPolicy.ADJUST,
        principalPolicy: PrincipalPolicy.KEEP,
        radialPolicy: RadialPolicy.ADJUST,
        tangentialPolicy: TangentialPolicy.KEEP,
        fisheyeFocalPolicy: FisheyeFocalPolicy.ADJUST_SYMMETRIC,
        fisheyeDistortionPolicy: FisheyeDistortionPolicy.ADJUST_01XX0,
        aspectRatioPolicy: AspectRatioPolicy.KEEP,
        skewPolicy: SkewPolicy.ADJUST,
        tiepointsPolicy: TiepointsPolicy.COMPUTE,
        pairSelection: PairSelection.SEQUENCE,
        pairSelectionDistance: 5,
        keypointsDensity: KeypointsDensity.HIGH,
        precalibration: true,
        tagsExtraction: [Tag.QR, Tag.APRIL],
        colorEqualization: ColorEqualization.BLOCK_WISE,
        adjustmentConstraints: [AdjustmentConstraints.CONTROL_POINTS],
        rigidRegistrationPosition: RigidRegistrationPosition.CONTROL_POINTS,
        rigidRegistrationRotation: RigidRegistrationRotation.ROTATION_METADATA,
        rigidRegistrationScale: RigidRegistrationScale.AUTOMATIC,
        sceneOutputCrs: "EPSG:4326"
      };
      expect(() => CalibrationOptionsSchema.parse(valid)).to.not.throw();
    });

    it("should allow options to be missing", () => {
      expect(() => CalibrationOptionsSchema.parse({})).to.not.throw();
    });
  });

  describe("CalibrationSpecificationsSchema", () => {
    it("should validate correct specification", () => {
      const valid = {
        inputs: { scene: "scene-id", presets: ["p1"] },
        outputs: { scene: "scene-id2", report: "bkt:/bucket/report.pdf" },
        options: { rigSynchro: RigSynchro.STRICT }
      };
      expect(() => CalibrationSpecificationsSchema.parse(valid)).to.not.throw();
    });

    it("should throw on missing inputs", () => {
      const invalid = {
        outputs: { scene: "scene-id2", report: "bkt:/bucket/report.pdf" }
      };
      expect(() => CalibrationSpecificationsSchema.parse(invalid)).to.throw();
    });
  });

  describe("CalibrationSpecificationsCreateSchema", () => {
    it("should validate correct specification create", () => {
      const valid = {
        inputs: { scene: "scene-id" },
        outputs: [CalibrationOutputsCreate.SCENE, CalibrationOutputsCreate.REPORT],
        options: { rigSynchro: RigSynchro.STRICT }
      };
      expect(() => CalibrationSpecificationsCreateSchema.parse(valid)).to.not.throw();
    });

    it("should throw on outputs not being an array", () => {
      const invalid = {
        inputs: { scene: "scene-id" },
        outputs: CalibrationOutputsCreate.SCENE
      };
      expect(() => CalibrationSpecificationsCreateSchema.parse(invalid)).to.throw();
    });
  });

  describe("CalibrationCostSchema", () => {
    it("should validate correct cost", () => {
      const valid = { gpix: 1.5, mpoints: 100.0 };
      expect(() => CalibrationCostSchema.parse(valid)).to.not.throw();
    });

    it("should throw if gpix is negative", () => {
      const invalid = { gpix: -1, mpoints: 100.0 };
      expect(() => CalibrationCostSchema.parse(invalid)).to.throw();
    });

    it("should throw if mpoints is negative", () => {
      const invalid = { gpix: 1.5, mpoints: -10 };
      expect(() => CalibrationCostSchema.parse(invalid)).to.throw();
    });
  });
});
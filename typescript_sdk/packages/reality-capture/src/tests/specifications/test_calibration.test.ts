import { expect } from "chai";
import { z } from "zod";
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
} from "../../specifications/calibration";

describe("calibration.ts", () => {
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
            expect(() => CalibrationInputsSchema.parse(invalid)).to.throw(z.ZodError);
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
            expect(() => CalibrationOutputsSchema.parse(invalid)).to.throw(z.ZodError);
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
            expect(() => CalibrationSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
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
            expect(() => CalibrationSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
        });
    });

    describe("CalibrationCostSchema", () => {
        it("should validate correct cost", () => {
            const valid = { gpix: 1.5, mpoints: 100.0 };
            expect(() => CalibrationCostSchema.parse(valid)).to.not.throw();
        });

        it("should throw if gpix is negative", () => {
            const invalid = { gpix: -1, mpoints: 100.0 };
            expect(() => CalibrationCostSchema.parse(invalid)).to.throw(z.ZodError);
        });

        it("should throw if mpoints is negative", () => {
            const invalid = { gpix: 1.5, mpoints: -10 };
            expect(() => CalibrationCostSchema.parse(invalid)).to.throw(z.ZodError);
        });
    });
});
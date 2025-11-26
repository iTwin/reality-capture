import { z } from "zod";

export enum CalibrationOutputsCreate {
  SCENE = "scene",
  REPORT = "report",
  TEXTURED_TIE_POINTS = "texturedTiePoints",
}

export enum RigSynchro {
  NO = "None",
  STRICT = "Strict",
  LOOSE = "Loose",
}

export enum RotationPolicy {
  COMPUTE = "Compute",
  ADJUST = "Adjust",
  KEEP = "Keep",
  EXTEND = "Extend",
}

export enum CenterPolicy {
  COMPUTE = "Compute",
  ADJUST = "Adjust",
  ADJUST_WITHIN_TOLERANCE = "AdjustWithinTolerance",
  KEEP = "Keep",
  EXTEND = "Extend",
}

export enum FocalPolicy {
  ADJUST = "Adjust",
  KEEP = "Keep",
}

export enum PrincipalPolicy {
  ADJUST = "Adjust",
  KEEP = "Keep",
}

export enum RadialPolicy {
  ADJUST = "Adjust",
  KEEP = "Keep",
}

export enum TangentialPolicy {
  ADJUST = "Adjust",
  KEEP = "Keep",
}

export enum FisheyeFocalPolicy {
  ADJUST_SYMMETRIC = "AdjustSymmetric",
  ADJUST_ASYMMETRIC = "AdjustAsymmetric",
  KEEP = "Keep",
}

export enum FisheyeDistortionPolicy {
  ADJUST_01XX0 = "Adjust_01xx0",
  ADJUST_X1XX0 = "Adjust_x1xx0",
  ADJUST_X1XXX = "Adjust_x1xxx",
  KEEP = "Keep",
}

export enum AspectRatioPolicy {
  ADJUST = "Adjust",
  KEEP = "Keep",
}

export enum SkewPolicy {
  ADJUST = "Adjust",
  KEEP = "Keep",
}

export enum TiepointsPolicy {
  COMPUTE = "Compute",
  KEEP = "Keep",
}

export enum PairSelection {
  DEFAULT = "Default",
  SEQUENCE = "Sequence",
  LOOP = "Loop",
  EXHAUSTIVE = "Exhaustive",
  SIMILARONLY = "SimilarOnly",
}

export enum KeypointsDensity {
  NORMAL = "Normal",
  HIGH = "High",
}

export enum Tag {
  QR = "QR",
  APRIL = "April",
  CHILI = "Chili",
}

export enum ColorEqualization {
  NO = "None",
  BLOCK_WISE = "BlockWise",
  MACHINE_LEARNING = "MachineLearning"
}

export enum AdjustmentConstraints {
  NO = "None",
  CONTROL_POINTS = "ControlPoints",
  POSITION_METADATA = "PositionMetadata",
  POINT_CLOUDS = "PointClouds",
  AUTOMATIC = "Automatic",
}

export enum RigidRegistrationPosition {
  NO = "None",
  USER_CONSTRAINTS = "UserConstraints",
  CONTROL_POINTS = "ControlPoints",
  POSITION_METADATA = "PositionMetadata",
  POINT_CLOUDS = "PointClouds",
  AUTOMATIC = "Automatic",
}

export enum RigidRegistrationRotation {
  NO = "None",
  USER_CONSTRAINTS = "UserConstraints",
  CONTROL_POINTS = "ControlPoints",
  POSITION_METADATA = "PositionMetadata",
  POINT_CLOUDS = "PointClouds",
  AUTOMATIC = "Automatic",
  ROTATION_METADATA = "RotationMetadata",
}

export enum RigidRegistrationScale {
  NO = "None",
  USER_CONSTRAINTS = "UserConstraints",
  CONTROL_POINTS = "ControlPoints",
  POSITION_METADATA = "PositionMetadata",
  POINT_CLOUDS = "PointClouds",
  AUTOMATIC = "Automatic",
}

export const CalibrationInputsSchema = z.object({
    scene: z.string().describe("Reality data ID of ContextScene to process"),
    presets: z.array(z.string()).optional().describe("List of paths to preset"),
});
export type CalibrationInputs = z.infer<typeof CalibrationInputsSchema>;

export const CalibrationOutputsSchema = z.object({
    scene: z.string().describe("Reality data ID of calibrated ContextScene"),
    report: z
        .string()
        .regex(/^bkt:.+/)
        .optional()
        .describe("Path in the bucket of Calibration report"),
    texturedTiePoints: z
        .string()
        .optional()
        .describe("Reality data ID of textured tie points"),
});
export type CalibrationOutputs = z.infer<typeof CalibrationOutputsSchema>;

export const CalibrationOptionsSchema = z.object({
    rigSynchro: z.nativeEnum(RigSynchro).optional().describe("Rig synchronization mode"),
    rotationPolicy: z.nativeEnum(RotationPolicy).optional().describe("Rotation policy"),
    centerPolicy: z.nativeEnum(CenterPolicy).optional().describe("Center policy"),
    centerTolerance: z
        .number()
        .optional()
        .describe(
            "Center tolerance, use only when center policy is AdjustWithinTolerance"
        ),
    focalPolicy: z.nativeEnum(FocalPolicy).optional().describe("Focal policy"),
    principalPolicy: z.nativeEnum(PrincipalPolicy).optional().describe("Principal point policy"),
    radialPolicy: z.nativeEnum(RadialPolicy).optional().describe("Radial policy"),
    tangentialPolicy: z.nativeEnum(TangentialPolicy).optional().describe("Tangential policy"),
    fisheyeFocalPolicy: z.nativeEnum(FisheyeFocalPolicy).optional().describe("Fisheye focal policy"),
    fisheyeDistortionPolicy: z.nativeEnum(FisheyeDistortionPolicy)
        .optional()
        .describe("Fisheye distortion policy"),
    aspectRatioPolicy: z.nativeEnum(AspectRatioPolicy).optional().describe("Aspect ratio policy"),
    skewPolicy: z.nativeEnum(SkewPolicy).optional().describe("Skew policy"),
    tiepointsPolicy: z.nativeEnum(TiepointsPolicy).optional().describe("Tiepoints policy"),
    pairSelection: z.nativeEnum(PairSelection).optional().describe("Pair selection mode"),
    pairSelectionDistance: z
        .number()
        .int()
        .optional()
        .describe(
            "Pair selection distance, use only when pair selection mode is Sequence or Loop"
        ),
    keypointsDensity: z.nativeEnum(KeypointsDensity).optional().describe("Keypoints density"),
    precalibration: z.boolean().optional().describe("Enable precalibration"),
    tagsExtraction: z
        .array(z.nativeEnum(Tag))
        .optional()
        .describe("Tags to extract"),
    colorEqualization: z.nativeEnum(ColorEqualization).optional().describe("Color equalization mode"),
    adjustmentConstraints: z
        .array(z.nativeEnum(AdjustmentConstraints))
        .optional()
        .describe("Adjustment constraints"),
    rigidRegistrationPosition: z
        .nativeEnum(RigidRegistrationPosition)
        .optional()
        .describe("Rigid registration for position"),
    rigidRegistrationRotation: z
        .nativeEnum(RigidRegistrationRotation)
        .optional()
        .describe("Rigid registration for rotation"),
    rigidRegistrationScale: z
        .nativeEnum(RigidRegistrationScale)
        .optional()
        .describe("Rigid registration for scale"),
    sceneOutputCrs: z.string().optional().describe("CRS to use when producing the output ContextScene"),
});
export type CalibrationOptions = z.infer<typeof CalibrationOptionsSchema>;

export const CalibrationSpecificationsSchema = z.object({
    inputs: CalibrationInputsSchema.describe("Inputs for Calibration"),
    outputs: CalibrationOutputsSchema.describe("Outputs for Calibration"),
    options: CalibrationOptionsSchema.optional().describe("Options for Calibration"),
});
export type CalibrationSpecifications = z.infer<typeof CalibrationSpecificationsSchema>;

export const CalibrationSpecificationsCreateSchema = z.object({
    inputs: CalibrationInputsSchema.describe("Inputs for Calibration"),
    outputs: z.array(z.nativeEnum(CalibrationOutputsCreate)).describe("List of outputs for Calibration"),
    options: CalibrationOptionsSchema.optional().describe("Options for Calibration"),
});
export type CalibrationSpecificationsCreate = z.infer<typeof CalibrationSpecificationsCreateSchema>;

export const CalibrationCostSchema = z.object({
    gpix: z.number().min(0).describe("Number of GigaPixels in the overall inputs, after applying downsampling."),
    mpoints: z.number().min(0).describe("Number of MegaPoints in the overall inputs."),
});
export type CalibrationCost = z.infer<typeof CalibrationCostSchema>;
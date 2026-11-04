import { z } from "zod";

export const TrainingS3DInputsSchema = z.object({
  segmentations3D: z.array(z.string()).describe("List of 3D models to train on."),
  preset: z.string().optional().describe("Path to a preset"),
  detectorName: z.string().describe("Name of the detector to train"),
});
export type TrainingS3DInputs = z.infer<typeof TrainingS3DInputsSchema>;

export const TrainingS3DOutputsSchema = z.object({
  detector: z.string().describe("Full detector information (name/version)"),
});
export type TrainingS3DOutputs = z.infer<typeof TrainingS3DOutputsSchema>;

export enum Segmentation3DTrainingModel {
  SPLATNET = "SPLATNet",
  POINT_TRANSFORMER_V3 = "PointTransformerV3"
}

export enum PointCloudFeature {
  RGB = "RGB",
  NORMAL = "NORMAL",
  INTENSITY = "INTENSITY"
}

export const TrainingS3DOptionsSchema = z.object({
  epochs: z
    .number().int()
    .gte(1, { message: "Must be greater than or equal to 1" })
    .lte(100, { message: "Must be less than or equal to 100" })
    .describe("Number of time to iterate over the entire dataset")
    .optional(),
  spacing: z
    .number()
    .gt(0, { message: "Must be greater than 0" })
    .describe("Spacing of the pointcloud seen by the detector (in meters).")
    .optional(),
  model: z
    .nativeEnum(Segmentation3DTrainingModel)
    .describe("Training Model architecture to use.")
    .optional(),
  features: z
    .array(z.nativeEnum(PointCloudFeature))
    .describe("Features to use for the training.")
    .optional(),
  versionNumber: z
    .string()
    .regex(/^\d+(?:\.\d+)?$/, "Must be a version like '1' or '1.0'")
    .describe("String representing the version number for the newly trained detector.")
    .optional(),
});
export type TrainingS3DOptions = z.infer<typeof TrainingS3DOptionsSchema>;

export enum TrainingS3DOutputsCreate {
  DETECTOR = "detector"
}

export const TrainingS3DSpecificationsCreateSchema = z.object({
  inputs: TrainingS3DInputsSchema.describe("Inputs"),
  outputs: z
    .array(z.nativeEnum(TrainingS3DOutputsCreate))
    .describe("Outputs"),
  options: TrainingS3DOptionsSchema.describe("Options").optional(),
});
export type TrainingS3DSpecificationsCreate = z.infer<typeof TrainingS3DSpecificationsCreateSchema>;

export const TrainingS3DSpecificationsSchema = z.object({
  inputs: TrainingS3DInputsSchema.describe("Inputs"),
  outputs: TrainingS3DOutputsSchema.describe("Outputs"),
  options: TrainingS3DOptionsSchema.describe("Options").optional(),
});
export type TrainingS3DSpecifications = z.infer<typeof TrainingS3DSpecificationsSchema>;

export const Segmentation3DPairSchema = z.object({
  segmentation3DA: z
    .string()
    .describe(
      "Reality data id of ContextScene pointing to a segmented 3D model (time A)",
    ),
  segmentation3DB: z
    .string()
    .describe(
      "Reality data id of ContextScene pointing to a segmented 3D model (time B)",
    ),
});
export type Segmentation3DPair = z.infer<typeof Segmentation3DPairSchema>;

export const TrainingChangeDetectionInputsSchema = z.object({
  segmentation3DPairs: z
    .array(Segmentation3DPairSchema)
    .describe(
      "List of paired segmented 3D scenes for change detection training.",
    ),
  preset: z.string().optional().describe("Path to a preset"),
  detectorName: z.string().describe("Name of the detector to train"),
});
export type TrainingChangeDetectionInputs = z.infer<
  typeof TrainingChangeDetectionInputsSchema
>;

export const TrainingChangeDetectionOutputsSchema = z.object({
  detector: z.string().describe("Full detector information (name/version)"),
});
export type TrainingChangeDetectionOutputs = z.infer<
  typeof TrainingChangeDetectionOutputsSchema
>;

export enum TrainingChangeDetectionOutputsCreate {
  DETECTOR = "detector",
}

export enum ChangeDetectionTrainingModel {
  POINT_TRANSFORMER_V3 = "PointTransformerV3",
}

// Kept separate from PointCloudFeature (S3D): supported features may diverge.
export enum ChangeDetectionPointCloudFeature {
  RGB = "RGB",
  NORMAL = "NORMAL",
  INTENSITY = "INTENSITY",
}

export const TrainingChangeDetectionOptionsSchema = z.object({
  epochs: z
    .number()
    .int()
    .gte(1, { message: "Must be greater than or equal to 1" })
    .lte(100, { message: "Must be less than or equal to 100" })
    .describe("Number of times to iterate over the entire dataset")
    .optional(),
  spacing: z
    .number()
    .gt(0, { message: "Must be greater than 0" })
    .describe(
      "Spacing of the point cloud seen by the detector (in meters).",
    )
    .optional(),
  model: z
    .nativeEnum(ChangeDetectionTrainingModel)
    .describe("Training Model architecture to use.")
    .optional(),
  features: z
    .array(z.nativeEnum(ChangeDetectionPointCloudFeature))
    .describe("Features to use for the training.")
    .optional(),
  versionNumber: z
    .string()
    .regex(/^\d+(?:\.\d+)?$/, "Must be a version like '1' or '1.0'")
    .describe(
      "String representing the version number for the newly trained detector.",
    )
    .optional(),
});
export type TrainingChangeDetectionOptions = z.infer<
  typeof TrainingChangeDetectionOptionsSchema
>;

export const TrainingChangeDetectionSpecificationsCreateSchema = z.object({
  inputs: TrainingChangeDetectionInputsSchema.describe("Inputs"),
  outputs: z
    .array(z.nativeEnum(TrainingChangeDetectionOutputsCreate))
    .describe("Outputs"),
  options: TrainingChangeDetectionOptionsSchema.describe("Options").optional(),
});
export type TrainingChangeDetectionSpecificationsCreate = z.infer<
  typeof TrainingChangeDetectionSpecificationsCreateSchema
>;

export const TrainingChangeDetectionSpecificationsSchema = z.object({
  inputs: TrainingChangeDetectionInputsSchema.describe("Inputs"),
  outputs: TrainingChangeDetectionOutputsSchema.describe("Outputs"),
  options: TrainingChangeDetectionOptionsSchema.describe("Options").optional(),
});
export type TrainingChangeDetectionSpecifications = z.infer<
  typeof TrainingChangeDetectionSpecificationsSchema
>;
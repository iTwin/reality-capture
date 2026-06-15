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
  SPLATNET = "SPLATNet"
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
    .regex(/\d+(.\d+)?/)
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
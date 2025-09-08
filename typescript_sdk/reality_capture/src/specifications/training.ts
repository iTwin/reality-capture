import { z } from "zod";

export const TrainingO2DInputsSchema = z.object({
  scene: z.string().describe(
    "Reality data id of a ContextScene pointing to photos with annotations (in the contextscene file)."
  ),
});
export type TrainingO2DInputs = z.infer<typeof TrainingO2DInputsSchema>;

export const TrainingO2DOutputsSchema = z.object({
  detector: z.string().describe("Reality data id of the detector."),
  metrics: z
    .string()
    .regex(/^bkt:.+/, "Must start with 'bkt:'")
    .describe("Path in the bucket of the training metrics")
    .optional(),
});
export type TrainingO2DOutputs = z.infer<typeof TrainingO2DOutputsSchema>;

export const TrainingO2DOptionsSchema = z.object({
  epochs: z
    .number().int()
    .describe("Number of time to iterate over the entire dataset")
    .optional(),
  maxTrainingSplit: z
    .number()
    .gt(0.0, { message: "Must be greater than 0.0" })
    .lte(1.0, { message: "Must be less than or equal to 1.0" })
    .describe(
      "Ratio (between 0.0 excluded and 1.0 included) of training data used to train the detector, the rest will be used to evaluate the model after each epoch and compute extra evaluation metrics"
    )
    .optional(),
});
export type TrainingO2DOptions = z.infer<typeof TrainingO2DOptionsSchema>;

export enum TrainingO2DOutputsCreate {
  DETECTOR = "detector",
  METRICS = "metrics"
}

export const TrainingO2DSpecificationsCreateSchema = z.object({
  inputs: TrainingO2DInputsSchema.describe("Inputs"),
  outputs: z
    .array(z.nativeEnum(TrainingO2DOutputsCreate))
    .describe("Outputs"),
  options: TrainingO2DOptionsSchema.describe("Options").optional(),
});
export type TrainingO2DSpecificationsCreate = z.infer<typeof TrainingO2DSpecificationsCreateSchema>;

export const TrainingO2DSpecificationsSchema = z.object({
  inputs: TrainingO2DInputsSchema.describe("Inputs"),
  outputs: TrainingO2DOutputsSchema.describe("Outputs"),
  options: TrainingO2DOptionsSchema.describe("Options").optional(),
});
export type TrainingO2DSpecifications = z.infer<typeof TrainingO2DSpecificationsSchema>;

export const TrainingS3DInputsSchema = z.object({
  scene: z.string().describe(
    "Reality data id of a ContextScene pointing to photos with annotations (in the contextscene file)."
  ),
});
export type TrainingS3DInputs = z.infer<typeof TrainingS3DInputsSchema>;

export const TrainingS3DOutputsSchema = z.object({
  detector: z.string().describe("Reality data id of the detector."),
});
export type TrainingS3DOutputs = z.infer<typeof TrainingS3DOutputsSchema>;

export const TrainingS3DOptionsSchema = z.object({
  epochs: z
    .number()
    .describe("Number of time to iterate over the entire dataset")
    .optional(),
  spacing: z
    .number()
    .describe("Spacing of the pointcloud seen by the detector")
    .optional(),
  maxTrainingSplit: z
    .number()
    .gt(0.0, { message: "Must be greater than 0.0" })
    .lte(1.0, { message: "Must be less than or equal to 1.0" })
    .describe(
      "Ratio (between 0.0 excluded and 1.0 included) of training data used to train the detector, the rest will be used to evaluate the model after each epoch and compute extra evaluation metrics"
    )
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
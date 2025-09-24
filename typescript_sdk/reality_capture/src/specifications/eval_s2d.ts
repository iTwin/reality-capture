import { z } from "zod";

export const EvalS2DInputsSchema = z.object({
  reference: z.string().describe("Reality data id of ContextScene, pointing to segmented photos reference"),
  prediction: z.string().describe("Reality data id of ContextScene, pointing to segmented photos prediction"),
});
export type EvalS2DInputs = z.infer<typeof EvalS2DInputsSchema>;

export const EvalS2DOutputsSchema = z.object({
  report: z.string()
    .regex(/^bkt:.+/)
    .describe("Path in Bucket of json report with confusion matrix")
    .optional(),
  segmentedPhotos: z.string()
    .describe("Reality data id of segmented photos, annotated with confusion matrix index")
    .optional(),
  segmentation2D: z.string()
    .describe("Reality data id of ContextScene, pointing to segmented photos")
    .optional(),
});
export type EvalS2DOutputs = z.infer<typeof EvalS2DOutputsSchema>;

export enum EvalS2DOutputsCreate {
  REPORT = "report",
  SEGMENTED_PHOTOS = "segmentedPhotos",
  SEGMENTATION2D = "segmentation2D"
}

export const EvalS2DSpecificationsCreateSchema = z.object({
  inputs: EvalS2DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(EvalS2DOutputsCreate)).describe("Outputs"),
});
export type EvalS2DSpecificationsCreate = z.infer<typeof EvalS2DSpecificationsCreateSchema>;

export const EvalS2DSpecificationsSchema = z.object({
  inputs: EvalS2DInputsSchema.describe("Inputs"),
  outputs: EvalS2DOutputsSchema.describe("Outputs"),
});
export type EvalS2DSpecifications = z.infer<typeof EvalS2DSpecificationsSchema>;
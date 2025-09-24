/*import { z } from "zod";

export const EvalS3DInputsSchema = z.object({
  reference: z.string().describe("Reality data id of ContextScene, pointing to segmented point cloud reference"),
  prediction: z.string().describe("Reality data id of ContextScene, pointing to segmented point cloud prediction"),
});
export type EvalS3DInputs = z.infer<typeof EvalS3DInputsSchema>;

export const EvalS3DOutputsSchema = z.object({
  report: z.string()
    .regex(/^bkt:.+/)
    .describe("Path in Bucket of json report with confusion matrix")
    .optional(),
  segmentedPointCloud: z.string()
    .describe("Reality data id of segmented point cloud, annotated with confusion matrix index")
    .optional(),
  segmentation3D: z.string()
    .describe("Reality data id of ContextScene, pointing to segmented point cloud")
    .optional(),
});
export type EvalS3DOutputs = z.infer<typeof EvalS3DOutputsSchema>;

export enum EvalS3DOutputsCreate {
  REPORT = "report",
  SEGMENTED_POINT_CLOUD = "segmentedPointCloud",
  SEGMENTATION3D = "segmentation3D",
}

export const EvalS3DSpecificationsCreateSchema = z.object({
  inputs: EvalS3DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(EvalS3DOutputsCreate)).describe("Outputs"),
});
export type EvalS3DSpecificationsCreate = z.infer<typeof EvalS3DSpecificationsCreateSchema>;

export const EvalS3DSpecificationsSchema = z.object({
  inputs: EvalS3DInputsSchema.describe("Inputs"),
  outputs: EvalS3DOutputsSchema.describe("Outputs"),
});
export type EvalS3DSpecifications = z.infer<typeof EvalS3DSpecificationsSchema>;*/
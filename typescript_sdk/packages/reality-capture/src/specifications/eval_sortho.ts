/*import { z } from "zod";

export enum EvalSOrthoOutputsCreate {
  REPORT = "report",
  SEGMENTED_PHOTOS = "segmentedPhotos",
  SEGMENTATION2D = "segmentation2D",
}

export const EvalSOrthoInputsSchema = z.object({
  reference: z.string().describe(
    "Reality data id of ContextScene, pointing to segmented photos reference"
  ),
  prediction: z.string().describe(
    "Reality data id of ContextScene, pointing to segmented photos prediction"
  ),
});
export type EvalSOrthoInputs = z.infer<typeof EvalSOrthoInputsSchema>;

export const EvalSOrthoOutputsSchema = z.object({
  report: z
    .string()
    .regex(/^bkt:.+$/)
    .describe("Path in Bucket of json report with confusion matrix")
    .optional(),
  segmentedPhotos: z
    .string()
    .describe(
      "Reality data id of segmented photos, annotated with confusion matrix index"
    )
    .optional(),
  segmentation2D: z
    .string()
    .describe(
      "Reality data id of ContextScene, pointing to segmented photos"
    )
    .optional(),
});
export type EvalSOrthoOutputs = z.infer<typeof EvalSOrthoOutputsSchema>;

export const EvalSOrthoSpecificationsCreateSchema = z.object({
  inputs: EvalSOrthoInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(EvalSOrthoOutputsCreate)).describe("Outputs"),
});
export type EvalSOrthoSpecificationsCreate = z.infer<typeof EvalSOrthoSpecificationsCreateSchema>;

export const EvalSOrthoSpecificationsSchema = z.object({
  inputs: EvalSOrthoInputsSchema.describe("Inputs"),
  outputs: EvalSOrthoOutputsSchema.describe("Outputs"),
});
export type EvalSOrthoSpecifications = z.infer<typeof EvalSOrthoSpecificationsSchema>;*/
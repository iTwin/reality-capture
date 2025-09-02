import { z } from "zod";
import { ModelingReference, TilingOptions } from "./tiling";
import { Export, ExportCreate } from "./production";

// ReconstructionInputs
export const ReconstructionInputsSchema = z.object({
  scene: z.string().describe("Reality data id of ContextScene to process"),
  regionOfInterest: z
    .string()
    .regex(/^bkt:.+/)
    .describe(
      "Path in the bucket to region of interest file, used for tiling region of interest"
    )
    .optional(),
  extent: z
    .string()
    .regex(/^bkt:.+/)
    .describe(
      "Path in the bucket to region of interest file, used for export extent"
    )
    .optional(),
  modelingReference: z
    .string()
    .describe("Reality data id of modeling reference to process")
    .optional(),
  presets: z
    .array(z.string())
    .describe("List of paths to preset")
    .optional()
});
export type ReconstructionInputs = z.infer<typeof ReconstructionInputsSchema>;

// ReconstructionOutputs
export const ReconstructionOutputsSchema = z.object({
  modelingReference: ModelingReference.schema
    .optional()
    .describe("Modeling reference"),
  exports: z
    .array(Export.schema)
    .optional()
    .describe("List of exports")
});
export type ReconstructionOutputs = z.infer<typeof ReconstructionOutputsSchema>;

// ReconstructionOutputsCreate
export const ReconstructionOutputsCreateSchema = z.object({
  modelingReference: z
    .boolean()
    .optional()
    .describe("Modeling reference"),
  exports: z
    .array(ExportCreate.schema)
    .optional()
    .describe("Exports")
});
export type ReconstructionOutputsCreate = z.infer<typeof ReconstructionOutputsCreateSchema>;

// ReconstructionSpecificationsCreate
export const ReconstructionSpecificationsCreateSchema = z.object({
  inputs: ReconstructionInputsSchema.describe("Inputs"),
  outputs: ReconstructionOutputsCreateSchema.describe("Outputs"),
  options: TilingOptions.schema
    .optional()
    .describe("Options")
});
export type ReconstructionSpecificationsCreate = z.infer<typeof ReconstructionSpecificationsCreateSchema>;

// ReconstructionSpecifications
export const ReconstructionSpecificationsSchema = z.object({
  inputs: ReconstructionInputsSchema.describe("Inputs"),
  outputs: ReconstructionOutputsSchema.describe("Outputs"),
  options: TilingOptions.schema
    .optional()
    .describe("Options")
});
export type ReconstructionSpecifications = z.infer<typeof ReconstructionSpecificationsSchema>;

// ReconstructionCost
export const ReconstructionCostSchema = z.object({
  gpix: z
    .number()
    .min(0)
    .describe("Number of GigaPixels in the overall inputs."),
  mpoints: z
    .number()
    .min(0)
    .describe("Number of MegaPoints in the overall inputs.")
});
export type ReconstructionCost = z.infer<typeof ReconstructionCostSchema>;
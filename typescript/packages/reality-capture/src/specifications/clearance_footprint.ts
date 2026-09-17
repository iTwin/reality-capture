import { z } from "zod";

export const ClearanceFootprintInputsSchema = z.object({
  segmentation3D: z.string().describe("Reality data id of ContextScene"),
  objects3D: z.string().describe("Reality data id of ContextScene, annotated with embedded 3D objects"),
});
export type ClearanceFootprintInputs = z.infer<typeof ClearanceFootprintInputsSchema>;

export const ClearanceFootprintOutputsSchema = z.object({
  footprints: z.string().optional().describe("Reality data id of ContextScene, annotated with embedded 3D footprints"),
});
export type ClearanceFootprintOutputs = z.infer<typeof ClearanceFootprintOutputsSchema>;

export enum ClearanceFootprintOutputsCreate {
  FOOTPRINTS = "footprints",
}

export const ClearanceFootprintOptionsSchema = z.object({
  sourceLabel: z.string().optional().describe("Name of the label of the class to be projected."),
  targetLabel: z.string().optional().describe("Name of the label of the class where the projection will be applied."),
});
export type ClearanceFootprintOptions = z.infer<typeof ClearanceFootprintOptionsSchema>;

export const ClearanceFootprintSpecificationsCreateSchema = z.object({
  inputs: ClearanceFootprintInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(ClearanceFootprintOutputsCreate)).describe("Outputs"),
  options: ClearanceFootprintOptionsSchema.optional().describe("Options"),
});
export type ClearanceFootprintSpecificationsCreate = z.infer<typeof ClearanceFootprintSpecificationsCreateSchema>;

export const ClearanceFootprintSpecificationsSchema = z.object({
  inputs: ClearanceFootprintInputsSchema.describe("Inputs"),
  outputs: ClearanceFootprintOutputsSchema.describe("Outputs"),
  options: ClearanceFootprintOptionsSchema.optional().describe("Options"),
});
export type ClearanceFootprintSpecifications = z.infer<typeof ClearanceFootprintSpecificationsSchema>;
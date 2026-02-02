import { z } from "zod";

export const ClearanceInputsSchema = z.object({
  model3d: z.string().describe("Reality data id of a point cloud"),
  clearanceFootprint: z.string().describe("Reality data id of Cbuilding footprints."),
});
export type ClearanceInputs = z.infer<typeof ClearanceInputsSchema>;

export const ClearanceOutputsSchema = z.object({
  ovfPoints: z.string()
    .describe("Reality data id of OVF Clearance Points")
    .optional(),
  ovfLines: z.string()
    .describe("Reality data id of OVF Clearance Lines")
    .optional(),
  ovfAreas: z.string()
    .describe("Reality data id of OVF Clearance Areas")
    .optional(),
});
export type ClearanceOutputs = z.infer<typeof ClearanceOutputsSchema>;

export enum ClearanceOutputsCreate {
    OVF_POINTS = "ovfPoints",
    OVF_LINES = "ovfLines",
    OVF_AREAS = "ovfAreas"
}

export const ClearanceSpecificationsCreateSchema = z.object({
  inputs: ClearanceInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(ClearanceOutputsCreate)).describe("Outputs"),
});
export type ClearanceSpecificationsCreate = z.infer<typeof ClearanceSpecificationsCreateSchema>;

export const ClearanceSpecificationsSchema = z.object({
  inputs: ClearanceInputsSchema.describe("Inputs"),
  outputs: ClearanceOutputsSchema.describe("Outputs"),
});
export type ClearanceSpecifications = z.infer<typeof ClearanceSpecificationsSchema>;
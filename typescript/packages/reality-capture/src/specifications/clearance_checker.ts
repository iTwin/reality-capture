import { z } from "zod";

export const ClearanceCheckerInputsSchema = z.object({
  model3D: z.string().describe("Reality data id of a 3D model (mesh, point cloud, a ContextScene with embedded 3D model) to process"),
  footprints: z.string().describe("Reality data id of ContextScene, annotated with embedded 3D footprints"),
});
export type ClearanceCheckerInputs = z.infer<typeof ClearanceCheckerInputsSchema>;

export const ClearanceCheckerOutputsSchema = z.object({
  clearance: z.string().optional().describe("Reality data id of ContextScene, annotated with embedded 3D clearance"),
});
export type ClearanceCheckerOutputs = z.infer<typeof ClearanceCheckerOutputsSchema>;

export enum ClearanceCheckerOutputsCreate {
  CLEARANCE = "clearance",
}

export const ClearanceCheckerSpecificationsCreateSchema = z.object({
  inputs: ClearanceCheckerInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(ClearanceCheckerOutputsCreate)).describe("Outputs"),
});
export type ClearanceCheckerSpecificationsCreate = z.infer<typeof ClearanceCheckerSpecificationsCreateSchema>;

export const ClearanceCheckerSpecificationsSchema = z.object({
  inputs: ClearanceCheckerInputsSchema.describe("Inputs"),
  outputs: ClearanceCheckerOutputsSchema.describe("Outputs"),
});
export type ClearanceCheckerSpecifications = z.infer<typeof ClearanceCheckerSpecificationsSchema>;
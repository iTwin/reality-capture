import { z } from "zod";

export const EvalO3DInputsSchema = z.object({
  reference: z.string().describe("Reality data id of ContextScene, annotated with embedded 3D object references"),
  prediction: z.string().describe("Reality data id of ContextScene, annotated with embedded 3D object predictions"),
});
export type EvalO3DInputs = z.infer<typeof EvalO3DInputsSchema>;

export const EvalO3DOutputsSchema = z.object({
  report: z
    .string()
    .regex(/^bkt:.+/)
    .describe("Path in Bucket of json report with binary classification")
    .optional(),
  objects3d: z
    .string()
    .describe("Reality data id of ContextScene, annotated with classified embedded 3D objects")
    .optional(),
});
export type EvalO3DOutputs = z.infer<typeof EvalO3DOutputsSchema>;

export enum EvalO3DOutputsCreate {
  REPORT = "report",
  OBJECTS3D = "objects3D",
}

export const EvalO3DOptionsSchema = z.object({
  thresholdIOU: z
    .number()
    .describe("Intersection over union threshold")
    .optional(),
});
export type EvalO3DOptions = z.infer<typeof EvalO3DOptionsSchema>;

export const EvalO3DSpecificationsCreateSchema = z.object({
  inputs: EvalO3DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(EvalO3DOutputsCreate)).describe("Outputs"),
  options: EvalO3DOptionsSchema.describe("Options").optional(),
});
export type EvalO3DSpecificationsCreate = z.infer<typeof EvalO3DSpecificationsCreateSchema>;

export const EvalO3DSpecificationsSchema = z.object({
  inputs: EvalO3DInputsSchema.describe("Inputs"),
  outputs: EvalO3DOutputsSchema.describe("Outputs"),
  options: EvalO3DOptionsSchema.describe("Options").optional(),
});
export type EvalO3DSpecifications = z.infer<typeof EvalO3DSpecificationsSchema>;
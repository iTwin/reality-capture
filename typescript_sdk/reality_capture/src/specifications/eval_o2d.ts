import { z } from "zod";

export const EvalO2DInputsSchema = z.object({
  reference: z.string().describe("Reality data id of ContextScene, annotated with embedded 2D object references"),
  prediction: z.string().describe("Reality data id of ContextScene, annotated with embedded 2D object predictions"),
});
export type EvalO2DInputs = z.infer<typeof EvalO2DInputsSchema>;

export const EvalO2DOutputsSchema = z.object({
  report: z.string()
    .regex(/^bkt:.+/)
    .describe("Path in Bucket of json report with binary classification.")
    .optional(),
  objects2D: z.string()
    .describe("Reality data id of ContextScene, annotated with classified embedded 2D objects")
    .optional(),
});
export type EvalO2DOutputs = z.infer<typeof EvalO2DOutputsSchema>;

export enum EvalO2DOutputsCreate {
  REPORT = "report",
  OBJECTS2D = "objects2D",
}

export const EvalO2DOptionsSchema = z.object({
  thresholdIOU: z.number()
    .describe("Intersection over union threshold")
    .optional(),
});
export type EvalO2DOptions = z.infer<typeof EvalO2DOptionsSchema>;

export const EvalO2DSpecificationsCreateSchema = z.object({
  inputs: EvalO2DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(EvalO2DOutputsCreate)).describe("Outputs"),
  options: EvalO2DOptionsSchema.describe("Options").optional(),
});
export type EvalO2DSpecificationsCreate = z.infer<typeof EvalO2DSpecificationsCreateSchema>;

export const EvalO2DSpecificationsSchema = z.object({
  inputs: EvalO2DInputsSchema.describe("Inputs"),
  outputs: EvalO2DOutputsSchema.describe("Outputs"),
  options: EvalO2DOptionsSchema.describe("Options").optional(),
});
export type EvalO2DSpecifications = z.infer<typeof EvalO2DSpecificationsSchema>;
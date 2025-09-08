import { z } from "zod";

export enum PCConversionOutputsCreate {
  OPC = "opc",
  PNTS = "pnts",
  GLB = "glb",
  GLBC = "glbc"
}

export const PCConversionInputsSchema = z.object({
  pointClouds: z.array(z.string()).describe("Reality data Ids of point clouds to convert")
}).strict();
export type PCConversionInputs = z.infer<typeof PCConversionInputsSchema>;

export const PCConversionOutputsSchema = z.object({
  opc: z.string().optional().describe("Id of the conversion as Orbit Point Cloud."),
  pnts: z.string().optional().describe("Id of the conversion as Cesium 3D Point Cloud"),
}).superRefine((data, ctx) => {
  // one and only one field must be provided
  if ((data.opc && data.pnts) || (!data.opc && !data.pnts)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Exactly one of 'opc' or 'pnts' must be provided.",
      path: ["opc", "pnts"],
    });
  }
});
export type PCConversionOutputs = z.infer<typeof PCConversionOutputsSchema>;

export const PCConversionOptionsSchema = z.object({
  merge: z.boolean().optional().describe(
    "If true, when possible and if relevant, all the files in the input reality data will be merged as one file."
  ),
}).strict();
export type PCConversionOptions = z.infer<typeof PCConversionOptionsSchema>;

export const PointCloudConversionSpecificationsCreateSchema = z.object({
  inputs: PCConversionInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(PCConversionOutputsCreate)).describe("Outputs"),
  options: PCConversionOptionsSchema.optional().describe("Options"),
}).strict();
export type PointCloudConversionSpecificationsCreate = z.infer<typeof PointCloudConversionSpecificationsCreateSchema>;

export const PointCloudConversionSpecificationsSchema = z.object({
  inputs: PCConversionInputsSchema.describe("Inputs"),
  outputs: PCConversionOutputsSchema.describe("Outputs"),
  options: PCConversionOptionsSchema.optional().describe("Options"),
}).strict();
export type PointCloudConversionSpecifications = z.infer<typeof PointCloudConversionSpecificationsSchema>;
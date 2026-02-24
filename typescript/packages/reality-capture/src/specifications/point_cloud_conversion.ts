import { z } from "zod";

export const PCConversionInputsSchema = z.object({
  pointCloud: z
    .string()
    .describe("Reality data Id of point cloud(s) to convert"),
});
export type PCConversionInputs = z.infer<typeof PCConversionInputsSchema>;

export enum PCConversionFormat {
  OPC = "OPC",
  THREE_D_TILES_PNTS = "3DTilesPnts",
  THREE_D_TILES_GLBC = "3DTilesGlbc",
  LAS = "LAS",
  LAZ = "LAZ",
  E57 = "E57",
  POD = "POD",
}

export const PCConversionOptionsSchema = z.object({
  outputFormat: z
    .nativeEnum(PCConversionFormat)
    .describe("Output format for the conversion.")
    .optional(),
  inputCrs: z.string().describe("CRS for the input data").optional(),
  outputCrs: z.string().describe("CRS for the output data").optional(),
});
export type PCConversionOptions = z.infer<typeof PCConversionOptionsSchema>;

export const PointCloudConversionSpecificationsCreateSchema = z.object({
  inputs: PCConversionInputsSchema.describe("Inputs"),
  options: PCConversionOptionsSchema.describe("Options").optional(),
});
export type PointCloudConversionSpecificationsCreate = z.infer<
  typeof PointCloudConversionSpecificationsCreateSchema
>;

export const PointCloudConversionSpecificationsSchema = z.object({
  inputs: PCConversionInputsSchema.describe("Inputs"),
  output: z.string().describe("Reality Data id of the converted point cloud"),
  options: PCConversionOptionsSchema.describe("Options").optional(),
});
export type PointCloudConversionSpecifications = z.infer<
  typeof PointCloudConversionSpecificationsSchema
>;

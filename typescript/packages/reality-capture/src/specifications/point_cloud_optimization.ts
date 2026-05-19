import { z } from "zod";

export const PCOptimizationInputsSchema = z.object({
  pointClouds: z
    .array(z.string())
    .describe("Reality data Ids of point cloud(s) to convert"),
});
export type PCOptimizationInputs = z.infer<typeof PCOptimizationInputsSchema>;

export enum PCOptimizationFormat {
  OPC = "OPC",
  THREE_D_TILES_PNTS = "3DTilesPnts",
  THREE_D_TILES_GLBC = "3DTilesGlbc",
  LAS = "LAS",
  LAZ = "LAZ",
  E57 = "E57",
  POD = "POD",
}

export const PCOptimizationOptionsSchema = z.object({
  outputFormat: z
    .nativeEnum(PCOptimizationFormat)
    .describe("Output format for the conversion.")
    .optional(),
  inputCrs: z.string().describe("CRS for the input data").optional(),
  outputCrs: z.string().describe("CRS for the output data").optional(),
});
export type PCOptimizationOptions = z.infer<typeof PCOptimizationOptionsSchema>;

export const PCOptimizationSpecificationsCreateSchema = z.object({
  inputs: PCOptimizationInputsSchema.describe("Inputs"),
  options: PCOptimizationOptionsSchema.describe("Options").optional(),
});
export type PCOptimizationSpecificationsCreate = z.infer<
  typeof PCOptimizationSpecificationsCreateSchema
>;

export const PCOptimizationSpecificationsSchema = z.object({
  inputs: PCOptimizationInputsSchema.describe("Inputs"),
  output: z.string().describe("Reality Data id of the converted point cloud"),
  options: PCOptimizationOptionsSchema.describe("Options").optional(),
});
export type PCOptimizationSpecifications = z.infer<
  typeof PCOptimizationSpecificationsSchema
>;

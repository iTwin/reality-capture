import { z } from "zod";

export const VectorOptimizationInputsSchema = z.object({
  vectors: z
    .array(z.string())
    .describe("Reality data Ids of vectors to consolidate"),
});
export type VectorOptimizationInputs = z.infer<
  typeof VectorOptimizationInputsSchema
>;

export enum VectorOptimizationFormat {
  GEO_JSON = "GeoJSON",
  FEATURE_DB = "FeatureDB",
}

export const VectorOptimizationOptionsSchema = z.object({
  outputFormat: z
    .nativeEnum(VectorOptimizationFormat)
    .describe("Output format for the conversion.")
    .optional(),
  inputCrs: z.string().describe("CRS for the input data").optional(),
  outputCrs: z.string().describe("CRS for the output data").optional(),
  featureClassDisplayName: z.string().describe("Display class name").optional(),
});
export type VectorOptimizationOptions = z.infer<
  typeof VectorOptimizationOptionsSchema
>;

export const VectorOptimizationSpecificationsCreateSchema = z.object({
  inputs: VectorOptimizationInputsSchema.describe("Inputs"),
  options: VectorOptimizationOptionsSchema.describe("Options").optional(),
});
export type VectorOptimizationSpecificationsCreate = z.infer<
  typeof VectorOptimizationSpecificationsCreateSchema
>;

export const VectorOptimizationSpecificationsSchema = z.object({
  inputs: VectorOptimizationInputsSchema.describe("Inputs"),
  output: z
    .string()
    .describe("Reality Data id of the vector data or Feature DB index (fdb:)"),
  options: VectorOptimizationOptionsSchema.describe("Options").optional(),
});
export type VectorOptimizationSpecifications = z.infer<
  typeof VectorOptimizationSpecificationsSchema
>;

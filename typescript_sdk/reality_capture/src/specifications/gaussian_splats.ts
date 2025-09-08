import { z } from "zod";

export const GaussianSplatsInputsSchema = z.object({
  scene: z.string().describe("Reality data ID of ContextScene to process."),
  splatsReference: z.string().optional().describe("Reality data ID of the Gaussian Splats Reference.")
});
export type GaussianSplatsInputs = z.infer<typeof GaussianSplatsInputsSchema>;

export const GaussianSplatsOutputsSchema = z.object({
  splats: z.string().optional().describe("Reality data ID of Gaussian Splats."),
  splatsReference: z.string().optional().describe("Reality data ID of the Gaussian Splats Reference.")
});
export type GaussianSplatsOutputs = z.infer<typeof GaussianSplatsOutputsSchema>;

export enum GaussianSplatsOutputsCreate {
  SPLATS = "Splats",
  SPLATS_REFERENCE = "SplatsReference"
}

export enum GSFormat {
  SPZ = "SPZ",
  THREED_TILES = "3DTiles",
  PLY = "PLY"
}

export const GaussianSplatsOptionsSchema = z.object({
  format: z.nativeEnum(GSFormat).optional().describe("Format of the Gaussian Splats")
});
export type GaussianSplatsOptions = z.infer<typeof GaussianSplatsOptionsSchema>;

export const GaussianSplatsSpecificationsSchema = z.object({
  inputs: GaussianSplatsInputsSchema.describe("Inputs"),
  outputs: GaussianSplatsOutputsSchema.describe("Outputs"),
  options: GaussianSplatsOptionsSchema.optional().describe("Options")
});
export type GaussianSplatsSpecifications = z.infer<typeof GaussianSplatsSpecificationsSchema>;

export const GaussianSplatsSpecificationsCreateSchema = z.object({
  inputs: GaussianSplatsInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(GaussianSplatsOutputsCreate)).describe("Outputs"),
  options: GaussianSplatsOptionsSchema.optional().describe("Options")
});
export type GaussianSplatsSpecificationsCreate = z.infer<typeof GaussianSplatsSpecificationsCreateSchema>;
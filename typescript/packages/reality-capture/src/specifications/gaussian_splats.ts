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

export enum GSQuality {
  MEDIUM = "Medium",
  STANDARD = "Standard",
  HIGH = "High"
}

export const GaussianSplatsOptionsSchema = z.object({
    export_format: z.nativeEnum(GSFormat).optional().describe("Format of the Gaussian Splats"),
    reference_quality: z.nativeEnum(GSQuality).optional().describe("Quality to use to generate the Splats Reference"),
    reference_tile_size: z.number().optional().describe("Tile size for the Splats Reference")
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
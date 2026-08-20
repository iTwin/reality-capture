import { z } from "zod";

export const TileMapOptimizationInputsSchema = z.object({
  tileMaps: z
    .array(z.string())
    .describe("Reality data Ids of tile maps to convert"),
});
export type TileMapOptimizationInputs = z.infer<
  typeof TileMapOptimizationInputsSchema
>;

export enum TileMapOptimizationFormat {
  XYZ_TILE_MAP = "XYZTileMap",
}

export enum TileMapImageFormat {
  JPG = "JPG",
  PNG = "PNG",
}

export const TileMapOptimizationOptionsSchema = z.object({
  outputFormat: z
    .nativeEnum(TileMapOptimizationFormat)
    .describe("Output format for the conversion.")
    .optional(),
  inputCrs: z.string().describe("CRS for the input data").optional(),
  outputCrs: z.string().describe("CRS for the output data").optional(),
  topLevel: z
    .number()
    .describe("Top level of the tile map to generate.")
    .optional(),
  bottomLevel: z
    .number()
    .describe("Bottom level of the tile map to generate.")
    .optional(),
  imageFormat: z
    .nativeEnum(TileMapImageFormat)
    .describe("Image format")
    .optional(),
  jpgQuality: z
    .number()
    .min(10)
    .max(99)
    .describe("Quality of JPG tiles to generate")
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#[a-fA-F0-9]{6}$/)
    .describe("Background color to use for tiles")
    .optional(),
});
export type TileMapOptimizationOptions = z.infer<
  typeof TileMapOptimizationOptionsSchema
>;

export const TileMapOptimizationSpecificationsCreateSchema = z.object({
  inputs: TileMapOptimizationInputsSchema.describe("Inputs"),
  options: TileMapOptimizationOptionsSchema.describe("Options").optional(),
});
export type TileMapOptimizationSpecificationsCreate = z.infer<
  typeof TileMapOptimizationSpecificationsCreateSchema
>;

export const TileMapOptimizationSpecificationsSchema = z.object({
  inputs: TileMapOptimizationInputsSchema.describe("Inputs"),
  output: z.string().describe("Reality Data id of the tile map"),
  options: TileMapOptimizationOptionsSchema.describe("Options").optional(),
});
export type TileMapOptimizationSpecifications = z.infer<
  typeof TileMapOptimizationSpecificationsSchema
>;

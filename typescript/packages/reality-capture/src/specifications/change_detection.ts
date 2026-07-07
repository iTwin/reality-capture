import { z } from "zod";

export enum ChangeDetectionOutputsCreate {
  SEGMENTATION3D_A = "segmentation3DA",
  SEGMENTED_MODEL3D_A = "segmentedModel3DA",
  SEGMENTATION3D_B = "segmentation3DB",
  SEGMENTED_MODEL3D_B = "segmentedModel3DB",
  LOCATIONS3D_A = "locations3DA",
  LOCATIONS3D_A_AS_SHP = "locations3DAAsSHP",
  LOCATIONS3D_A_AS_GEOJSON = "locations3DAAsGeoJSON",
  LOCATIONS3D_B = "locations3DB",
  LOCATIONS3D_B_AS_SHP = "locations3DBAsSHP",
  LOCATIONS3D_B_AS_GEOJSON = "locations3DBAsGeoJSON"
}

export const ChangeDetectionInputsSchema = z.object({
  model3DA: z.string().describe("Reality data id of ContextScene, point cloud, GS or mesh"),
  model3DB: z.string().describe("Reality data id of ContextScene, point cloud, GS or mesh"),
  extent: z.string().describe("Path in the bucket of the clipping polygon to apply").regex(/^bkt:.+/, {
    message: "Path in the bucket to the extent file must start with 'bkt:'",
  }).optional(),
  // Add preset in a different release
  /*preset: z.string().describe("Path in the bucket of a preset file to use").regex(/^bkt:.+/, {
    message: "Path in the bucket to the preset file must start with 'bkt:'",
  }).optional(),*/
});
export type ChangeDetectionInputs = z.infer<typeof ChangeDetectionInputsSchema>;

export const ChangeDetectionOutputsSchema = z.object({
  segmentation3DA: z.string().optional().describe("ContextScene CD on Model3D A"),
  segmentedModel3DA: z.string().optional().describe("Model3D A with CD segmentation"),
  segmentation3DB: z.string().optional().describe("ContextScene CD on Model3D B"),
  segmentedModel3DB: z.string().optional().describe("Model3D B with CD segmentation"),
  locations3DA: z.string().optional().describe("Reality data id of locations of changes A"),
  locations3DAAsSHP: z.string().optional().describe("Reality data id of locations of changes A as SHP format"),
  locations3DAAsGeoJSON: z.string().optional().describe("Reality data id of locations of changes A as GeoJSON file"),
  locations3DB: z.string().optional().describe("Reality data id of locations of changes B"),
  locations3DBAsSHP: z.string().optional().describe("Reality data id of locations of changes B as SHP format"),
  locations3DBAsGeoJSON: z.string().optional().describe("Reality data id of locations of changes B as GeoJSON file"),
});
export type ChangeDetectionOutputs = z.infer<typeof ChangeDetectionOutputsSchema>;

export const ChangeDetectionOptionsSchema = z.object({
  minPointsPerChange: z.number().int().optional().describe("Minimum number of points in a region to be considered as a change"),
  samplingResolution: z.number().optional().describe("Target point cloud resolution when starting from meshes"),
  growThreshold: z.number().optional().describe("Low threshold to detect spatial changes (hysteresis detection)"),
  filterThreshold: z.number().optional().describe("High threshold to detect spatial changes (hysteresis detection)"),
});
export type ChangeDetectionOptions = z.infer<typeof ChangeDetectionOptionsSchema>;

export const ChangeDetectionSpecificationsCreateSchema = z.object({
  inputs: ChangeDetectionInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(ChangeDetectionOutputsCreate)).describe("Outputs"),
  options: ChangeDetectionOptionsSchema.optional().describe("Options"),
});
export type ChangeDetectionSpecificationsCreate = z.infer<typeof ChangeDetectionSpecificationsCreateSchema>;

export const ChangeDetectionSpecificationsSchema = z.object({
  inputs: ChangeDetectionInputsSchema.describe("Inputs"),
  outputs: ChangeDetectionOutputsSchema.describe("Outputs"),
  options: ChangeDetectionOptionsSchema.optional().describe("Options"),
});
export type ChangeDetectionSpecifications = z.infer<typeof ChangeDetectionSpecificationsSchema>;
/*import { z } from "zod";

export enum ChangeDetectionOutputsCreate {
  OBJECTS3D = "objects3D",
  LOCATIONS3D_AS_SHP = "locations3DAsSHP",
  LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON",
  ADDED = "added",
  REMOVED = "removed",
}

export const ChangeDetectionInputsSchema = z.object({
  reference: z.string().describe("Reality data id of ContextScene, point cloud or mesh"),
  toCompare: z.string().describe("Reality data id of ContextScene, point cloud or mesh"),
  extent: z.string().describe("Path in the bucket of the clipping polygon to apply").regex(/^bkt:.+/, {
    message: "Path in the bucket to the extent file must start with 'bkt:'",
  }).optional(),
});
export type ChangeDetectionInputs = z.infer<typeof ChangeDetectionInputsSchema>;

export const ChangeDetectionOutputsSchema = z.object({
  objects3D: z.string().optional().describe("Reality data id of ContextScene, annotated with embedded 3D objects"),
  locations3DAsSHP: z.string().optional().describe("Reality data id of 3D objects locations as SHP format"),
  locations3DAsGeoJSON: z.string().optional().describe("Reality data id of 3D objects locations as GeoJSON file"),
  added: z.string().optional().describe("Points in toCompare not in reference as OPC"),
  removed: z.string().optional().describe("Point in reference not in toCompare as OPC"),
});
export type ChangeDetectionOutputs = z.infer<typeof ChangeDetectionOutputsSchema>;

export const ChangeDetectionOptionsSchema = z.object({
  outputCrs: z.string().optional().describe("CRS used by locations3DAsSHP output"),
  minPointsPerChange: z.number().int().optional().describe("Minimum number of points in a region to be considered as a change"),
  meshSamplingResolution: z.number().optional().describe("Target point cloud resolution when starting from meshes"),
  threshold: z.number().optional().describe("High threshold to detect spatial changes (hysteresis detection)"),
  filterThreshold: z.number().optional().describe("Low threshold to detect spatial changes (hysteresis detection)"),
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
export type ChangeDetectionSpecifications = z.infer<typeof ChangeDetectionSpecificationsSchema>;*/
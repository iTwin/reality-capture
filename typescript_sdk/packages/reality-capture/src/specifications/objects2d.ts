/*import { z } from "zod";

export const Objects2DInputsSchema = z.object({
  photos: z.string().describe("Reality data id of ContextScene, pointing to photos to process"),
  photoObjectDetector: z.string().optional().describe(
    "Either reality data id of photo object detector or photo object detector identifier from the AI Detectors library"
  ),
  model3D: z.string().optional().describe(
    "Reality data id of ContextScene, pointing to a collection of point clouds/meshes to process, or a point cloud, or a mesh."
  ),
  objects2D: z.string().optional().describe(
    "Reality data id of ContextScene, annotated with embedded 2D objects, this input replaces photoObjectDetector input"
  ),
});
export type Objects2DInputs = z.infer<typeof Objects2DInputsSchema>;

export const Objects2DOutputsSchema = z.object({
  objects2D: z.string().optional().describe(
    "Reality data id of ContextScene, annotated with embedded 2D objects"
  ),
  objects3D: z.string().optional().describe(
    "Reality data id of ContextScene, annotated with embedded 3D objects"
  ),
  objects3DAs3DTiles: z.string().optional().describe(
    "Reality data id of 3D objects as 3D Tiles file, objects3d output must be defined"
  ),
  objects3DAsGeoJSON: z.string().optional().describe(
    "Reality data id of 3D objects as GeoJSON file, objects3d output must be defined"
  ),
  locations3DAsSHP: z.string().optional().describe(
    "Reality data id of 3D objects locations as SHP file, objects3d output must be defined"
  ),
  locations3DAsGeoJSON: z.string().optional().describe(
    "Reality data id of 3D objects locations as GeoJSON file, objects3d output must be defined"
  ),
});
export type Objects2DOutputs = z.infer<typeof Objects2DOutputsSchema>;

export enum Objects2DOutputsCreate {
  OBJECTS2D = "objects2D",
  OBJECTS3D = "objects3D",
  OBJECTS3D_AS_3DTILES = "objects3DAs3DTiles",
  OBJECTS3D_AS_GEOJSON = "objects3DAsGeoJSON",
  LOCATIONS3D_AS_SHP = "locations3DAsSHP",
  LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"
}

export const Objects2DOptionsSchema = z.object({
  useTiePoints: z.boolean().optional().describe(
    "Improve detection using tie points in oriented photos."
  ),
  maxDist: z.number().optional().describe(
    "Maximum distance between photos and 3D objects"
  ),
  crs: z.string().optional().describe(
    "CRS used by ``locations3d_as_shp`` outputs"
  ),
  minPhotos: z.number().optional().describe(
    "Minimum number of 2D objects to generate a 3D object"
  ),
});
export type Objects2DOptions = z.infer<typeof Objects2DOptionsSchema>;

export const Objects2DSpecificationsCreateSchema = z.object({
  inputs: Objects2DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(Objects2DOutputsCreate)).describe("Outputs"),
  options: Objects2DOptionsSchema.optional().describe("Options"),
});
export type Objects2DSpecificationsCreate = z.infer<typeof Objects2DSpecificationsCreateSchema>;

export const Objects2DSpecificationsSchema = z.object({
  inputs: Objects2DInputsSchema.describe("Inputs"),
  outputs: Objects2DOutputsSchema.describe("Outputs"),
  options: Objects2DOptionsSchema.optional().describe("Options"),
});
export type Objects2DSpecifications = z.infer<typeof Objects2DSpecificationsSchema>;*/
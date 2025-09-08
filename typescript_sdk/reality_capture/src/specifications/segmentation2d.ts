import { z } from "zod";

export enum Segmentation2DOutputsCreate {
  SEGMENTATION2D = "segmentation2D",
  SEGMENTED_PHOTOS = "segmentedPhotos",
  LINES3D = "lines3D",
  LINES3D_AS_3DTILES = "lines3DAs3DTiles",
  LINES3D_AS_GEOJSON = "lines3DAsGeoJSON",
  POLYGONS3D = "polygons3D",
  POLYGONS3D_AS_3DTILES = "polygons3DAs3DTiles",
  POLYGONS3D_AS_GEOJSON = "polygons3DAsGeoJSON",
}

export const Segmentation2DInputsSchema = z.object({
  photos: z.string().describe("Reality data id of ContextScene, pointing to photos to process"),
  photoSegmentationDetector: z.string()
    .optional()
    .describe("Either reality data id of photo segmentation detector or photo segmentation detector identifier from the AI Detectors library"),
  model3D: z.string()
    .optional()
    .describe("Reality data id of ContextScene, pointing to a collection of point clouds/meshes to process, or a point cloud, or a mesh."),
  segmentation2D: z.string()
    .optional()
    .describe("Reality data id of ContextScene, pointing to segmented photos, this input replaces photo_segmentation_detector input"),
});
export type Segmentation2DInputs = z.infer<typeof Segmentation2DInputsSchema>;

export const Segmentation2DOutputsSchema = z.object({
  segmentation2D: z.string()
    .optional()
    .describe("Reality data id of ContextScene, pointing to segmented photos"),
  segmentedPhotos: z.string()
    .optional()
    .describe("Reality data id of segmented photos"),
  lines3D: z.string()
    .optional()
    .describe("Reality data id of ContextScene, annotated with embedded 3D lines"),
  lines3DAs3DTiles: z.string()
    .optional()
    .describe("Reality data id of 3D lines as 3D Tiles file, lines3d output must be defined"),
  lines3DAsGeoJSON: z.string()
    .optional()
    .describe("Reality data id of 3D lines as GeoJSON file, lines3d output must be defined"),
  polygons3D: z.string()
    .optional()
    .describe("Reality data id of ContextScene, annotated with embedded 3D polygons"),
  polygons3DAs3DTiles: z.string()
    .optional()
    .describe("Reality data id of 3D polygons as 3D Tiles file, polygons3d output must be defined"),
  polygons3DAsGeoJSON: z.string()
    .optional()
    .describe("Reality data id of 3D polygons as GeoJSON file, polygons3d output must be defined"),
});
export type Segmentation2DOutputs = z.infer<typeof Segmentation2DOutputsSchema>;

export const Segmentation2DOptionsSchema = z.object({
  computeLineWidth: z.boolean()
    .optional()
    .describe("Estimation 3D line width at each vertex"),
  removeSmallLines: z.number()
    .optional()
    .describe("Remove 3D lines with total length smaller than this value"),
  minPhotos: z.number()
    .int()
    .optional()
    .describe("Minimum number of 2D detection to generate a 3D detection"),
});
export type Segmentation2DOptions = z.infer<typeof Segmentation2DOptionsSchema>;

export const Segmentation2DSpecificationsCreateSchema = z.object({
  inputs: Segmentation2DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(Segmentation2DOutputsCreate)).describe("Outputs"),
  options: Segmentation2DOptionsSchema.optional().describe("Options"),
});
export type Segmentation2DSpecificationsCreate = z.infer<typeof Segmentation2DSpecificationsCreateSchema>;

export const Segmentation2DSpecificationsSchema = z.object({
  inputs: Segmentation2DInputsSchema.describe("Inputs"),
  outputs: Segmentation2DOutputsSchema.describe("Outputs"),
  options: Segmentation2DOptionsSchema.optional().describe("Options"),
});
export type Segmentation2DSpecifications = z.infer<typeof Segmentation2DSpecificationsSchema>;
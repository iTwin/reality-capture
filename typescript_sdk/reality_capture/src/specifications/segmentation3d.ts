/*import { z } from "zod";

export enum Segmentation3DOutputsCreate {
  SEGMENTATION3D = "segmentation3D",
  SEGMENTED_POINT_CLOUD = "segmentedPointCloud",
  SEGMENTATION3D_AS_POD = "segmentation3DAsPOD",
  SEGMENTATION3D_AS_LAS = "segmentation3DAsLAS",
  SEGMENTATION3D_AS_LAZ = "segmentation3DAsLAZ",
  SEGMENTATION3D_AS_PLY = "segmentation3DAsPLY",
  OBJECTS3D = "objects3D",
  OBJECTS3D_AS_3DTILES = "objects3DAs3DTiles",
  OBJECTS3D_AS_GEOJSON = "objects3DAsGeoJSON",
  LOCATIONS3D_AS_SHP = "locations3DAsSHP",
  LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON",
  LINES3D = "lines3D",
  LINES3D_AS_3DTILES = "lines3DAs3DTiles",
  LINES3D_AS_GEOJSON = "lines3DAsGeoJSON",
  POLYGONS3D = "polygons3D",
  POLYGONS3D_AS_3DTILES = "polygons3DAs3DTiles",
  POLYGONS3D_AS_GEOJSON = "polygons3DAsGeoJSON"
}

export const Segmentation3DInputsSchema = z.object({
  model3D: z.string().optional().describe("Reality data id of ContextScene, pointing to a collection of point clouds/meshes to process, or a point cloud, or a mesh."),
  pointCloudSegmentationDetector: z.string().optional().describe("Either reality data id of point cloud segmentation object detector or point cloud segmentation detector identifier from the AI Detectors library"),
  segmentation3D: z.string().optional().describe("Reality data id of ContextScene, pointing to a segmented point cloud, this input replaces point_cloud_segmentation_detector, point_clouds and meshes inputs"),
  extent: z.string()
    .regex(/^bkt:.+/)
    .optional()
    .describe("Path in the bucket of the clipping polygon to apply")
});
export type Segmentation3DInputs = z.infer<typeof Segmentation3DInputsSchema>;

export const Segmentation3DOutputsSchema = z.object({
  segmentation3D: z.string().optional().describe("Reality data id of ContextScene, pointing to the segmented point cloud"),
  segmentedPointCloud: z.string().optional().describe("Reality data id of the 3D segmentation as OPC file"),
  segmentation3DAsPOD: z.string().optional().describe("Reality data id of the segmented point cloud as POD file, segmentation3D output must be defined"),
  segmentation3DAsLAS: z.string().optional().describe("Reality data id of the segmented point cloud as LAS file, segmentation3D output must be defined"),
  segmentation3DAsLAZ: z.string().optional().describe("Reality data id of the segmented point cloud as LAZ file, segmentation3D output must be defined"),
  segmentation3DAsPLY: z.string().optional().describe("Reality data id of the segmented point cloud as PLY file, segmentation3D output must be defined"),
  objects3D: z.string().optional().describe("Reality data id of ContextScene, annotated with embedded 3D objects"),
  objects3DAs3DTiles: z.string().optional().describe("Reality data id of 3D objects as 3D Tiles file, objects3d output must be defined"),
  objects3DAsGeoJSON: z.string().optional().describe("Reality data id of 3D objects as GeoJSON file, objects3d output must be defined"),
  locations3DAsSHP: z.string().optional().describe("Reality data id of 3D objects locations as SHP file, objects3d output must be defined"),
  locations3DAsGeoJSON: z.string().optional().describe("Reality data id of 3D objects locations as GeoJSON file, objects3d output must be defined"),
  lines3D: z.string().optional().describe("Reality data id of ContextScene, annotated with embedded 3D lines"),
  lines3DAs3DTiles: z.string().optional().describe("Reality data id of 3D lines as 3D Tiles file, lines3d output must be defined"),
  lines3DAsGeoJSON: z.string().optional().describe("Reality data id of 3D lines as GeoJSON file, lines3d output must be defined"),
  polygons3D: z.string().optional().describe("Reality data id of ContextScene, annotated with embedded 3D polygons"),
  polygons3DAs3DTiles: z.string().optional().describe("Reality data id of 3D polygons as 3D Tiles file, polygons3d output must be defined"),
  polygons3DAsGeoJSON: z.string().optional().describe("Reality data id of 3D polygons as GeoJSON file, polygons3d output must be defined")
});
export type Segmentation3DOutputs = z.infer<typeof Segmentation3DOutputsSchema>;

export const Segmentation3DOptionsSchema = z.object({
  crs: z.string().optional().describe("CRS used by POD, LAS, LAZ, PLY, DGN and SHP outputs"),
  saveConfidence: z.boolean().optional().describe("Save confidence in 3D segmentation"),
  computeLineWidth: z.boolean().optional().describe("Estimation 3D line width at each vertex"),
  removeSmallLines: z.number().optional().describe("Remove 3D lines with total length smaller than this value"),
  keepInputResolution: z.boolean().optional().describe("To make segmentation 3D output exact same point input ")
});
export type Segmentation3DOptions = z.infer<typeof Segmentation3DOptionsSchema>;

export const Segmentation3DSpecificationsCreateSchema = z.object({
  inputs: Segmentation3DInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(Segmentation3DOutputsCreate)).describe("Outputs"),
  options: Segmentation3DOptionsSchema.optional().describe("Options")
});
export type Segmentation3DSpecificationsCreate = z.infer<typeof Segmentation3DSpecificationsCreateSchema>;

export const Segmentation3DSpecificationsSchema = z.object({
  inputs: Segmentation3DInputsSchema.describe("Inputs"),
  outputs: Segmentation3DOutputsSchema.describe("Outputs"),
  options: Segmentation3DOptionsSchema.optional().describe("Options")
});
export type Segmentation3DSpecifications = z.infer<typeof Segmentation3DSpecificationsSchema>;*/
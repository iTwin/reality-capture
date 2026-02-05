import { z } from "zod";
import { BoundingBoxSchema, Point3dSchema } from "./geometry";

export const ImportPCInputsSchema = z.object({
  scene: z.string().describe("Reality data id of ContextScene to process"),
  crsData: z.string().regex(/^bkt:.+/).optional().describe("Path in the bucket for CRS data."),
});
export type ImportPCInputs = z.infer<typeof ImportPCInputsSchema>;

export const ImportPCOutputsSchema = z.object({
  scanCollection: z.string().describe("Output reality data id for scan collection"),
  scene: z.string().optional().describe("Output reality data id for context scene referencing scan collection")
});
export type ImportPCOutputs = z.infer<typeof ImportPCOutputsSchema>;

export const ImportPCSpecificationsSchema = z.object({
  inputs: ImportPCInputsSchema.describe("Inputs for importing a point cloud"),
  outputs: ImportPCOutputsSchema.describe("Outputs for point cloud import")
});
export type ImportPCSpecifications = z.infer<typeof ImportPCSpecificationsSchema>;

export enum ImportPCOutputsCreate {
  SCAN_COLLECTION = "scanCollection",
  SCENE = "scene",
}

export const ImportPCSpecificationsCreateSchema = z.object({
  inputs: ImportPCInputsSchema.describe("Inputs for importing a point cloud"),
  outputs: z.array(z.nativeEnum(ImportPCOutputsCreate)).describe("List of outputs for point cloud import")
});
export type ImportPCSpecificationsCreate = z.infer<typeof ImportPCSpecificationsCreateSchema>;

export const ImportPCCostSchema = z.object({
  mpoints: z.number().min(0).describe("Number of megapoints inside the point clouds")
});
export type ImportPCCost = z.infer<typeof ImportPCCostSchema>;

export const Point3dTimeSchema = Point3dSchema.extend({
  t: z.number().describe("Timestamp of point")
});
export type Point3dTime = z.infer<typeof Point3dTimeSchema>;

export const ScanSchema = z.object({
  name: z.string().describe("Name of the scan"),
  numPoints: z.number().int().describe("Number of points in the scan"),
  hasColor: z.boolean().describe("True if Scan has color information"),
  hasIntensity: z.boolean().describe("True if Scan has intensity information"),
  hasClassification: z.boolean().describe("True if Scan has classification information"),
  position: Point3dSchema.optional().describe("Scanner position if scan is static"),
  trajectories: z.array(z.array(Point3dTimeSchema)).optional().describe("List of trajectories if scan was mobile")
});
export type Scan = z.infer<typeof ScanSchema>;

export const PodMetadataSchema = z.object({
  minRes: z.number().describe("Minimum resolution of the point cloud"),
  maxRes: z.number().describe("Maximum resolution of the point cloud"),
  meanRes: z.number().describe("Mean resolution of the point cloud"),
  medRes: z.number().describe("Median resolution of the point cloud"),
  minIntensity: z.number().int().min(-32768).max(32767).describe("Minimum intensity"),
  maxIntensity: z.number().int().min(-32768).max(32767).describe("Maximum intensity"),
  crs: z.string().describe("Coordinate Reference System definition"),
  bounding: BoundingBoxSchema.describe("Bounding box of the PointCloud"),
  scans: z.array(ScanSchema).describe("List of scans")
});
export type PodMetadata = z.infer<typeof PodMetadataSchema>;
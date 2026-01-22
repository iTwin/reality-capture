import { z } from "zod";

export const SegmentationOrthophotoInputsSchema = z.object({
  orthophoto: z.string().describe("Reality data id of ContextScene, pointing to orthophotos to process"),
  orthophotoSegmentationDetector: z.string().describe(
    "Either reality data id of orthophoto segmentation detector or orthophoto segmentation detector identifier from the AI Detectors library"
  ),
});
export type SegmentationOrthophotoInputs = z.infer<typeof SegmentationOrthophotoInputsSchema>;

export const SegmentationOrthophotoOutputsSchema = z.object({
  segmentation2D: z.string().optional().describe(
    "Reality data id of ContextScene, pointing to segmented orthophotos"
  ),
  segmentedPhotos: z.string().optional().describe(
    "Reality data id of segmented orthophotos"
  ),
  polygons2D: z.string().optional().describe(
    "Reality data id of ContextScene, annotated with embedded 2D polygons"
  ),
  polygons2DAsSHP: z.string().optional().describe(
    "Reality data id of 2D polygons as SHP file, polygons2d output must be defined"
  ),
  polygons2DAsGeoJSON: z.string().optional().describe(
    "Reality data id of 2D polygons as GeoJSON file, polygons2d output must be defined"
  ),
  lines2D: z.string().optional().describe(
    "Reality data id of ContextScene, annotated with embedded 2D lines"
  ),
  lines2DAsSHP: z.string().optional().describe(
    "Reality data id of 2D lines as SHP file, lines2d output must be defined"
  ),
  lines2DAsGeoJSON: z.string().optional().describe(
    "Reality data id of 2D lines as GeoJSON file, lines2d output must be defined"
  ),
});
export type SegmentationOrthophotoOutputs = z.infer<typeof SegmentationOrthophotoOutputsSchema>;

export enum SegmentationOrthophotoOutputsCreate {
  SEGMENTATION2D = "segmentation2D",
  SEGMENTED_PHOTOS = "segmentedPhotos",
  POLYGONS2D = "polygons2D",
  POLYGONS2D_AS_SHP = "polygons2DAsSHP",
  POLYGONS2D_AS_GEOJSON = "polygons2DAsGeoJSON",
  LINES2D = "lines2D",
  LINES2D_AS_SHP = "lines2DAsSHP",
  LINES2D_AS_GEOJSON = "lines2DAsGeoJSON",
}

export const SegmentationOrthophotoSpecificationsCreateSchema = z.object({
  inputs: SegmentationOrthophotoInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(SegmentationOrthophotoOutputsCreate)).describe("Outputs"),
});
export type SegmentationOrthophotoSpecificationsCreate = z.infer<typeof SegmentationOrthophotoSpecificationsCreateSchema>;

export const SegmentationOrthophotoSpecificationsSchema = z.object({
  inputs: SegmentationOrthophotoInputsSchema.describe("Inputs"),
  outputs: SegmentationOrthophotoOutputsSchema.describe("Outputs"),
});
export type SegmentationOrthophotoSpecifications = z.infer<typeof SegmentationOrthophotoSpecificationsSchema>;
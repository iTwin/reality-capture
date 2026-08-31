import { z } from "zod";
import { URLSchema } from "./reality_data";

export enum DetectorExport {
  OBJECTS = "Objects",
  LINES = "Lines",
  POLYGONS = "Polygons",
  LOCATIONS = "Locations",
}

export enum DetectorStatus {
  AWAITING_DATA = "AwaitingData",
  READY = "Ready",
}

export enum DetectorType {
  PHOTO_OBJECT_DETECTOR = "PhotoObjectDetector",
  PHOTO_SEGMENTATION_DETECTOR = "PhotoSegmentationDetector",
  ORTHOPHOTO_SEGMENTATION_DETECTOR = "OrthophotoSegmentationDetector",
  POINT_CLOUD_SEGMENTATION_DETECTOR = "PointCloudSegmentationDetector",
}

export const CapabilitiesSchema = z.object({
  labels: z.array(z.string()).describe("Labels of the detector version."),
  exports: z
    .array(z.nativeEnum(DetectorExport))
    .describe("Exports of the detector version."),
});
export type Capabilities = z.infer<typeof CapabilitiesSchema>;

export const DetectorVersionCreateSchema = z.object({
  versionNumber: z.string().describe("Version number."),
  capabilities: CapabilitiesSchema.describe("Capabilities of the version."),
});
export type DetectorVersionCreate = z.infer<typeof DetectorVersionCreateSchema>;

export const DetectorVersionSchema = DetectorVersionCreateSchema.extend({
  creationDate: z.coerce.date().describe("Creation date of the version."),
  status: z.nativeEnum(DetectorStatus).describe("Status of the version."),
  downloadUrl: z
    .string()
    .optional()
    .describe(
      "URL to download the detector version. It is present only if the version status is 'Ready'.",
    ),
  creatorId: z.string().optional().describe("User Id of the version creator."),
});
export type DetectorVersion = z.infer<typeof DetectorVersionSchema>;

export const DetectorUpdateSchema = z.object({
  displayName: z.string().optional().describe("Display name of the detector."),
  description: z.string().optional().describe("Description of the detector."),
  documentationUrl: z
    .string()
    .optional()
    .describe("Documentation URL for the detector."),
});
export type DetectorUpdate = z.infer<typeof DetectorUpdateSchema>;

export const DetectorBaseSchema = DetectorUpdateSchema.extend({
  name: z.string().describe("Name of the detector."),
  type: z.nativeEnum(DetectorType).describe("Type of the detector."),
});
export type DetectorBase = z.infer<typeof DetectorBaseSchema>;

export const DetectorSchema = DetectorBaseSchema.extend({
  versions: z
    .array(DetectorVersionSchema)
    .describe("All existing versions of the detector."),
});
export type Detector = z.infer<typeof DetectorSchema>;

export const DetectorResponseSchema = z.object({
  detector: DetectorSchema.describe("Detector."),
});
export type DetectorResponse = z.infer<typeof DetectorResponseSchema>;

export const DetectorMinimalSchema = DetectorBaseSchema.extend({
  latestVersion: z
    .string()
    .optional()
    .describe(
      "The latest version of the detector with 'Ready' status, if any.",
    ),
});
export type DetectorMinimal = z.infer<typeof DetectorMinimalSchema>;

export const DetectorsMinimalResponseSchema = z.object({
  detectors: z
    .array(DetectorMinimalSchema)
    .describe("List of minimal detectors."),
});
export type DetectorsMinimalResponse = z.infer<
  typeof DetectorsMinimalResponseSchema
>;

export const DetectorVersionCreationLinksSchema = z.object({
  completeUrl: URLSchema.describe(
    "URL to mark the completion of the detector version creation process.",
  ),
  uploadUrl: URLSchema.describe("URL to upload the detector zip file."),
});
export type DetectorVersionCreationLinks = z.infer<
  typeof DetectorVersionCreationLinksSchema
>;

export const DetectorVersionWithLinksSchema = z.object({
  version: DetectorVersionSchema.describe("Detector version details."),
  _links: DetectorVersionCreationLinksSchema.describe(
    "Contains the hyperlinks related to the detector version creation.",
  ),
});
export type DetectorVersionWithLinks = z.infer<
  typeof DetectorVersionWithLinksSchema
>;

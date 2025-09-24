import { z } from "zod";

export enum TouchLevel {
  GEOMETRY = "Geometry",
  GEOMETRY_AND_TEXTURE = "GeometryAndTexture"
}

export enum TouchUpExportOutputsCreate {
  TOUCH_UP_DATA = "touchUpData"
}

export enum TouchUpImportOutputsCreate {
  IMPORT_INFO = "importInfo"
}

export const TouchUpExportInputsSchema = z.object({
  modelingReference: z.string().describe("Reality data id of Modeling Reference"),
  tilesToTouchUp: z.array(z.string()).optional().describe("List of tiles to export for touch up"),
});
export type TouchUpExportInputs = z.infer<typeof TouchUpExportInputsSchema>;

export const TouchUpExportOptionsSchema = z.object({
  level: z.nativeEnum(TouchLevel).optional().describe("Touch Up level"),
  crs: z.string().optional().describe("Export CRS"),
});
export type TouchUpExportOptions = z.infer<typeof TouchUpExportOptionsSchema>;

export const TouchUpExportOutputsSchema = z.object({
  touchUpData: z.string().describe("Reality Data id for touch up data"),
});
export type TouchUpExportOutputs = z.infer<typeof TouchUpExportOutputsSchema>;

export const TouchUpExportSpecificationsSchema = z.object({
  inputs: TouchUpExportInputsSchema.describe("Inputs"),
  outputs: TouchUpExportOutputsSchema.describe("Outputs"),
  options: TouchUpExportOptionsSchema.optional().describe("Options"),
});
export type TouchUpExportSpecifications = z.infer<typeof TouchUpExportSpecificationsSchema>;

export const TouchUpExportSpecificationsCreateSchema = z.object({
  inputs: TouchUpExportInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(TouchUpExportOutputsCreate)).describe("Outputs"),
  options: TouchUpExportOptionsSchema.optional().describe("Options"),
});
export type TouchUpExportSpecificationsCreate = z.infer<typeof TouchUpExportSpecificationsCreateSchema>;

export const TouchUpExportCostSchema = z.object({
  tileCount: z.number().min(0).describe("Number of tiles to export"),
});
export type TouchUpExportCost = z.infer<typeof TouchUpExportCostSchema>;

export const TouchUpImportInputsSchema = z.object({
  modelingReference: z.string().describe("Reality data id of Modeling Reference"),
  touchUpData: z.string().describe("Reality Data id for touch up data"),
});
export type TouchUpImportInputs = z.infer<typeof TouchUpImportInputsSchema>;

export const TouchUpImportOutputsSchema = z.object({
  importInfo: z
    .string()
    .regex(/^bkt:.+/, { message: "Must start with 'bkt:'" })
    .optional()
    .describe("Folder in bucket containing the information about what was imported"),
});
export type TouchUpImportOutputs = z.infer<typeof TouchUpImportOutputsSchema>;

export const TouchUpImportSpecificationsCreateSchema = z.object({
  inputs: TouchUpImportInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(TouchUpImportOutputsCreate)).describe("Outputs"),
});
export type TouchUpImportSpecificationsCreate = z.infer<typeof TouchUpImportSpecificationsCreateSchema>;

export const TouchUpImportSpecificationsSchema = z.object({
  inputs: TouchUpImportInputsSchema.describe("Inputs"),
  outputs: TouchUpImportOutputsSchema.describe("Outputs"),
});
export type TouchUpImportSpecifications = z.infer<typeof TouchUpImportSpecificationsSchema>;

export const TouchUpImportCostSchema = z.object({
  tileCount: z.number().min(0).describe("Number of tiles to import"),
});
export type TouchUpImportCost = z.infer<typeof TouchUpImportCostSchema>;

export const ImportTileInfoSchema = z.object({
  tileName: z.string().describe("Name of an imported tile"),
  level: z.nativeEnum(TouchLevel).describe("Touch up level of imported tile"),
});
export type ImportTileInfo = z.infer<typeof ImportTileInfoSchema>;

export const ImportInfoSchema = z.object({
  importInfo: z.array(ImportTileInfoSchema).describe("List of tiles imported"),
});
export type ImportInfo = z.infer<typeof ImportInfoSchema>;
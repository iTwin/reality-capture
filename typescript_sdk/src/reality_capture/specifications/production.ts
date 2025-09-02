import { z } from "zod";
import { Point3d } from "./geometry";
import { GeometricPrecision } from "./tiling";

export enum Format {
  THREEMX = "3MX",
  THREESM = "3SM",
  THREED_TILES = "3DTiles",
  OSGB = "OSGB",
  SPACEYES = "SpacEyes",
  OBJ = "OBJ",
  S3C = "S3C",
  I3S = "I3S",
  LOD_TREE = "LodTree",
  COLLADA = "Collada",
  OCP = "OCP",
  KML = "KML",
  DGN = "DGN",
  SUPER_MAP = "SuperMap",
  LAS = "LAS",
  POD = "POD",
  PLY = "PLY",
  OPC = "OPC",
  ORTHOPHOTO_DSM = "OrthophotoDSM",
  FBX = "FBX"
}

export enum ColorSource {
  NO = "None",
  VISIBLE = "Visible",
  THERMAL = "Thermal",
  RESOLUTION = "Resolution"
}

export enum ThermalUnit {
  ABSOLUTE = "Absolute",
  CELSIUS = "Celsius",
  FAHRENHEIT = "Fahrenheit"
}

export enum LODScope {
  TILE_WISE = "TileWise",
  ACROSS_TILES = "AcrossTiles"
}

export enum LODType {
  NONE = "None",
  UNARY = "Unary",
  QUADTREE = "Quadtree",
  OCTREE = "Octree",
  ADAPTIVE = "Adaptive",
  BING_MAPS = "BingMaps"
}

export enum CesiumCompression {
  NO = "None",
  DRACO = "Draco"
}

export enum I3SVersion {
  V1_6 = "v1_6",
  V1_8 = "v1_8"
}

export enum SamplingStrategy {
  RESOLUTION = "Resolution",
  ABSOLUTE = "Absolute"
}

export enum LasCompression {
  NONE = "None",
  LAZ = "LAZ"
}

export enum ProjectionMode {
  HIGHEST_POINT = "HighestPoint",
  LOWEST_POINT = "LowestPoint"
}

export enum OrthoFormat {
  GEOTIFF = "GeoTIFF",
  JPEG = "JPEG",
  KML_SUPER_OVERLAY = "KML_SuperOverlay",
  NONE = "None"
}

export enum DSMFormat {
  GEOTIFF = "GeoTIFF",
  XYZ = "XYZ",
  ASC = "ASC",
  NONE = "None"
}

export enum OrthoColorSource {
  REFERENCE_3D_MODEL_VISIBLE = "Reference3dModelVisible",
  OPTIMIZED_COMPUTATION_VISIBLE = "OptimizedComputationVisible",
  REFERENCE_3D_MODEL_THERMAL = "Reference3dModelThermal",
  OPTIMIZED_COMPUTATION_THERMAL = "OptimizedComputationThermal"
}

export const ProductionInputsSchema = z.object({
  scene: z.string().describe("Reality data id of ContextScene to process"),
  modelingReference: z.string().describe("Reality data id of modeling reference to process"),
  extent: z.string()
    .regex(/^bkt:.+/)
    .optional()
    .describe("Path in the bucket to region of interest file, used for export extent"),
  presets: z.array(z.string()).optional().describe("List of paths to preset"),
});
export type ProductionInputs = z.infer<typeof ProductionInputsSchema>;

export const Options3MXSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  generateWebApp: z.boolean().optional().describe("Flag to generate a web application"),
});
export type Options3MX = z.infer<typeof Options3MXSchema>;

export const Options3SMSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  crs: z.string().optional().describe("Coordinate reference system"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
});
export type Options3SM = z.infer<typeof Options3SMSchema>;

export const Options3DTilesSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  crs: z.string().optional().describe("Coordinate reference system"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  compress: z.nativeEnum(CesiumCompression).optional().describe("Compression type"),
});
export type Options3DTiles = z.infer<typeof Options3DTilesSchema>;

export const OptionsOSGBSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
});
export type OptionsOSGB = z.infer<typeof OptionsOSGBSchema>;

export const OptionsSpacEyesSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  disableLighting: z.boolean().optional().describe("Flag to disable lighting"),
});
export type OptionsSpacEyes = z.infer<typeof OptionsSpacEyesSchema>;

export const OptionsOBJSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
  doublePrecision: z.boolean().optional().describe("Flag for double precision"),
});
export type OptionsOBJ = z.infer<typeof OptionsOBJSchema>;

export const OptionsS3CSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
});
export type OptionsS3C = z.infer<typeof OptionsS3CSchema>;

export const OptionsI3SSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  crs: z.string().optional().describe("Coordinate reference system"),
  version: z.nativeEnum(I3SVersion).optional().describe("I3S version"),
});
export type OptionsI3S = z.infer<typeof OptionsI3SSchema>;

export const OptionsLodTreeExportSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
});
export type OptionsLodTreeExport = z.infer<typeof OptionsLodTreeExportSchema>;

export const OptionsColladaSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
});
export type OptionsCollada = z.infer<typeof OptionsColladaSchema>;

export const OptionsOCPSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  crs: z.string().optional().describe("Coordinate reference system"),
});
export type OptionsOCP = z.infer<typeof OptionsOCPSchema>;

export const OptionsKMLSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  heightOffset: z.number().optional().describe("Height offset"),
});
export type OptionsKML = z.infer<typeof OptionsKMLSchema>;

export const OptionsDGNSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
});
export type OptionsDGN = z.infer<typeof OptionsDGNSchema>;

export const OptionsSuperMapSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  crs: z.string().optional().describe("Coordinate reference system"),
});
export type OptionsSuperMap = z.infer<typeof OptionsSuperMapSchema>;

export const OptionsFBXSchema = z.object({
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
  textureColorSourceResMin: z.number().min(0).optional().describe("Minimum resolution for the texture color source"),
  textureColorSourceResMax: z.number().min(0).optional().describe("Maximum resolution for the texture color source"),
  textureColorSourceThermalUnit: z.nativeEnum(ThermalUnit).optional().describe("Thermal unit for the texture color source"),
  textureColorSourceThermalMin: z.number().optional().describe("Minimum thermal value for the texture color source"),
  textureColorSourceThermalMax: z.number().optional().describe("Maximum thermal value for the texture color source"),
  textureSharpening: z.boolean().optional().describe("Enable or disable texture sharpening."),
  maximumTextureSize: z.number().int().optional().describe("Maximum texture size"),
  textureCompression: z.number().int().min(0).max(100).optional().describe("JPG compression of texture file"),
  lodScope: z.nativeEnum(LODScope).optional().describe("Level of detail scope"),
  lodType: z.nativeEnum(LODType).optional().describe("Level of detail type"),
  crs: z.string().optional().describe("Coordinate reference system"),
  crsOrigin: Point3d.optional().describe("Origin of the coordinate reference system"),
});
export type OptionsFBX = z.infer<typeof OptionsFBXSchema>;

export const OptionsLASSchema = z.object({
  crs: z.string().optional().describe("Coordinate reference system"),
  samplingStrategy: z.nativeEnum(SamplingStrategy).optional().describe("Sampling strategy"),
  samplingDistance: z.number().optional().describe("Sampling distance"),
  compress: z.nativeEnum(LasCompression).optional().describe("Compression type"),
  mergePointClouds: z.boolean().optional().describe("Flag to merge point clouds"),
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
});
export type OptionsLAS = z.infer<typeof OptionsLASSchema>;

export const OptionsPODSchema = z.object({
  crs: z.string().optional().describe("Coordinate reference system"),
  samplingStrategy: z.nativeEnum(SamplingStrategy).optional().describe("Sampling strategy"),
  samplingDistance: z.number().optional().describe("Sampling distance"),
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
});
export type OptionsPOD = z.infer<typeof OptionsPODSchema>;

export const OptionsPLYSchema = z.object({
  crs: z.string().optional().describe("Coordinate reference system"),
  samplingStrategy: z.nativeEnum(SamplingStrategy).optional().describe("Sampling strategy"),
  samplingDistance: z.number().optional().describe("Sampling distance"),
  mergePointClouds: z.boolean().optional().describe("Flag to merge point clouds"),
  includeNormals: z.boolean().optional().describe("Flag to include normals"),
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
});
export type OptionsPLY = z.infer<typeof OptionsPLYSchema>;

export const OptionsOPCSchema = z.object({
  crs: z.string().optional().describe("Coordinate reference system"),
  samplingStrategy: z.nativeEnum(SamplingStrategy).optional().describe("Sampling strategy"),
  samplingDistance: z.number().optional().describe("Sampling distance"),
  textureColorSource: z.nativeEnum(ColorSource).optional().describe("Source of the texture color"),
});
export type OptionsOPC = z.infer<typeof OptionsOPCSchema>;

export const OptionsOrthoDSMSchema = z.object({
  crs: z.string().optional().describe("Coordinate reference system"),
  samplingDistance: z.number().optional().describe("Sampling distance"),
  projectionMode: z.nativeEnum(ProjectionMode).optional().describe("Projection mode"),
  mergeParts: z.boolean().optional().describe("Flag to merge parts"),
  orthoFormat: z.nativeEnum(OrthoFormat).optional().describe("Ortho format"),
  noDataColor: z.string().optional().describe("No data color"),
  colorSource: z.nativeEnum(OrthoColorSource).optional().describe("Color source"),
  dsmFormat: z.nativeEnum(DSMFormat).optional().describe("DSM format"),
  noDataValue: z.number().optional().describe("No data value"),
  noDataTransparency: z.boolean().optional().describe("No data transparency"),
});
export type OptionsOrthoDSM = z.infer<typeof OptionsOrthoDSMSchema>;

export const ExportCreateSchema = z.object({
  format: z.nativeEnum(Format).describe("Export format"),
  options: z.union([
    Options3MXSchema,
    Options3SMSchema,
    Options3DTilesSchema,
    OptionsOSGBSchema,
    OptionsSpacEyesSchema,
    OptionsOBJSchema,
    OptionsS3CSchema,
    OptionsI3SSchema,
    OptionsLodTreeExportSchema,
    OptionsColladaSchema,
    OptionsOCPSchema,
    OptionsKMLSchema,
    OptionsDGNSchema,
    OptionsSuperMapSchema,
    OptionsLASSchema,
    OptionsPODSchema,
    OptionsPLYSchema,
    OptionsOPCSchema,
    OptionsOrthoDSMSchema,
    OptionsFBXSchema
  ]).optional().describe("Options associated to format"),
  name: z.string().min(3).optional().describe("Name used for the reality data."),
});
export type ExportCreate = z.infer<typeof ExportCreateSchema>;

export const ExportSchema = ExportCreateSchema.extend({
  location: z.string().describe("Reality data id of the export"),
});
export type Export = z.infer<typeof ExportSchema>;

export const ProductionOutputsSchema = z.object({
  exports: z.array(ExportSchema).describe("List of exports"),
});
export type ProductionOutputs = z.infer<typeof ProductionOutputsSchema>;

export const ProductionOutputsCreateSchema = z.object({
  exports: z.array(ExportCreateSchema).describe("List of exports"),
});
export type ProductionOutputsCreate = z.infer<typeof ProductionOutputsCreateSchema>;

export const ProductionSpecificationsSchema = z.object({
  inputs: ProductionInputsSchema.describe("Inputs"),
  outputs: ProductionOutputsSchema.describe("Outputs"),
});
export type ProductionSpecifications = z.infer<typeof ProductionSpecificationsSchema>;

export const ProductionSpecificationsCreateSchema = z.object({
  inputs: ProductionInputsSchema.describe("Inputs"),
  outputs: ProductionOutputsCreateSchema.describe("Outputs"),
});
export type ProductionSpecificationsCreate = z.infer<typeof ProductionSpecificationsCreateSchema>;

export const ProductionCostSchema = z.object({
  gpix: z.number().min(0).describe("Number of GigaPixels in the overall inputs, after applying downsampling."),
  mpoints: z.number().min(0).describe("Number of MegaPoints in the overall inputs."),
  geometricPrecision: GeometricPrecision.optional().describe("Geometric precision used in Tiling"),
});
export type ProductionCost = z.infer<typeof ProductionCostSchema>;
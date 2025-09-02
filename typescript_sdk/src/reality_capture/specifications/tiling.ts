import { z } from "zod";
import { BoundingBox, Point3d, RegionOfInterest } from "./geometry";

// Enums
export enum ModelingReferenceType {
  ORTHOPHOTO = "Orthophoto",
  COMPLETE = "Complete",
}

export enum TilingMode {
  NO_TILING = "NoTiling",
  REGULAR_PLANAR_GRID = "RegularPlanarGrid",
  REGULAR_VOLUMETRIC_GRID = "RegularVolumetricGrid",
  ADAPTIVE = "Adaptive",
}

export enum GeometricPrecision {
  MEDIUM = "Medium",
  HIGH = "High",
  EXTRA = "Extra",
  ULTRA = "Ultra",
}

export enum TilingPairSelection {
  GENERIC = "Generic",
  STRUCTURED_AERIAL = "StructuredAerial",
  REGION_OF_INTEREST = "RegionOfInterest",
}

export enum PhotoUsedForGeometry {
  EXCLUDE_THERMAL = "ExcludeThermal",
  INCLUDE_THERMAL = "IncludeThermal",
  NO = "None",
}

export enum HoleFilling {
  SMALL_HOLES = "SmallHoles",
  ALL_HOLES = "AllHoles",
}

export enum Simplification {
  STANDARD = "Standard",
  PLANAR_RELATIVE = "PlanarRelative",
  PLANAR_ABSOLUTE = "PlanarAbsolute",
}

export enum ColorCorrection {
  NO = "None",
  STANDARD = "Standard",
  STANDARD_WITH_THERMAL = "StandardWithThermal",
  BLOCK_WISE = "BlockWise",
  BLOCK_WISE_WITH_THERMAL = "BlockWiseWithThermal",
}

export enum UntexturedRepresentation {
  INPAINTING_COMPLETION = "InpaintingCompletion",
  UNIFORM_COLOR = "UniformColor",
}

export enum PointCloudColorSource {
  NO = "None",
  COLOR = "Color",
  INTENSITY = "Intensity",
  SCALED_INTENSITY = "ScaledIntensity",
}

export enum TextureSource {
  PHOTOS_FIRST = "PhotosFirst",
  POINT_CLOUDS_FIRST = "PointCloudsFirst",
  SMART = "Smart",
}

export enum TilingOutputsCreate {
  MODELING_REFERENCE = "modelingReference",
}

// Zod Schemas

export const TilingInputsSchema = z.object({
  scene: z.string().describe("Reality data id of ContextScene to process"),
  regionOfInterest: z
    .string()
    .regex(/^bkt:.+/)
    .describe("Path in the bucket to region of interest file")
    .optional(),
  presets: z.array(z.string()).describe("List of paths to preset").optional(),
});

export type TilingInputs = z.infer<typeof TilingInputsSchema>;

export const TilingOptionsSchema = z.object({
  modelingReferenceType: z.nativeEnum(ModelingReferenceType).describe("Modeling Reference Type").optional(),
  tilingMode: z.nativeEnum(TilingMode).describe("Tiling Mode").optional(),
  tilingValue: z.number().describe("Tiling Value").gte(0).optional(),
  tilingOrigin: Point3d.describe("Tiling origin").optional(),
  discardEmptyTiles: z.boolean().describe("Discard emtpy tiles").optional(),
  crs: z.string().describe("Coordinate Reference System").optional(),
  geometricPrecision: z.nativeEnum(GeometricPrecision).describe("Geometric precision").optional(),
  pairSelection: z.nativeEnum(TilingPairSelection).describe("Pair selection").optional(),
  photoUsedForGeometry: z.nativeEnum(PhotoUsedForGeometry).describe("Photo used for geometry").optional(),
  holeFilling: z.nativeEnum(HoleFilling).describe("Hole Filling").optional(),
  simplification: z.nativeEnum(Simplification).describe("Simplification").optional(),
  planarSimplificationTolerance: z.number().describe("Planar simplification tolerance").optional(),
  pointCloudColorSource: z.nativeEnum(PointCloudColorSource).describe("Point cloud color source").optional(),
  colorCorrection: z.nativeEnum(ColorCorrection).describe("Color correction").optional(),
  untexturedRepresentation: z.nativeEnum(UntexturedRepresentation).describe("Untextured representation").optional(),
  untexturedColor: z
    .string()
    .regex(/^#[a-fA-F0-9]{6}$/)
    .describe("Untextured color")
    .optional(),
  textureSource: z.nativeEnum(TextureSource).describe("Texture source").optional(),
  orthoResolution: z.number().describe("Ortho resolution").optional(),
  geometryResolutionLimit: z.number().describe("Geometry resolution limit").optional(),
  textureResolutionLimit: z.number().describe("Texture resolution limit").optional(),
});
export type TilingOptions = z.infer<typeof TilingOptionsSchema>;

export const ModelingReferenceSchema = z.object({
  location: z.string().describe("Reality data id of modeling reference"),
});
export type ModelingReference = z.infer<typeof ModelingReferenceSchema>;

export const TilingOutputsSchema = z.object({
  modelingReference: ModelingReferenceSchema.describe("Modeling reference"),
});
export type TilingOutputs = z.infer<typeof TilingOutputsSchema>;

export const TilingSpecificationsSchema = z.object({
  inputs: TilingInputsSchema.describe("Inputs"),
  outputs: TilingOutputsSchema.describe("Outputs"),
  options: TilingOptionsSchema.optional().describe("Options"),
});
export type TilingSpecifications = z.infer<typeof TilingSpecificationsSchema>;

export const TilingSpecificationsCreateSchema = z.object({
  inputs: TilingInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(TilingOutputsCreate)).describe("Outputs"),
  options: TilingOptionsSchema.optional().describe("Options"),
});
export type TilingSpecificationsCreate = z.infer<typeof TilingSpecificationsCreateSchema>;

export const TilingCostSchema = z.object({
  gpix: z.number().describe("Number of GigaPixels in the overall inputs, after applying downsampling.").gte(0),
  mpoints: z.number().describe("Number of MegaPoints in the overall inputs.").gte(0),
});
export type TilingCost = z.infer<typeof TilingCostSchema>;

export const LayoutTileSchema = z.object({
  name: z.string().describe("Tile name"),
  boxTight: BoundingBox.describe("Tight box encompassing the tile"),
  boxOverlapping: BoundingBox.describe(
    "Overlapping box encompassing the tile and a bit of its neighbors"
  ),
  memoryUsage: z.number().describe("Memory usage of the tile").gte(0),
});
export type LayoutTile = z.infer<typeof LayoutTileSchema>;

export const LayoutSchema = z.object({
  tiles: z.array(LayoutTileSchema).describe("List of tiles in the layout"),
  enuDefinition: z.string().describe("Definition of the Internal Coordinate System"),
  crsDefinition: z.string().describe("Definition of the Layout Coordinate System"),
  roi: RegionOfInterest.describe("Region of interest of the layout"),
});
export type Layout = z.infer<typeof LayoutSchema>;
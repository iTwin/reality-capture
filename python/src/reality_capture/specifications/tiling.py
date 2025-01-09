from pydantic import BaseModel, Field, constr
from typing import Optional
from enum import Enum
from geometry import BoundingBox, Point3d


class TilingInputs(BaseModel):
    scene: str = Field(description="Reality data id of ContextScene to process")
    region_of_interest: Optional[str] = Field(description="Path to region of interest file prefix by reality data id",
                                              alias="regionOfInterest",
                                              default=None)
    preset: Optional[str] = Field(default=None, description="Path to preset")


class ReferenceModelType(Enum):
    ORTHOPHOTO = "Orthophoto"
    COMPLETE = "Complete"


class TilingMode(Enum):
    NO_TILING = "NoTiling"
    REGULAR_PLANAR_GRID = "RegularPlanarGrid"
    REGULAR_VOLUMETRIC_GRID = "RegularVolumetricGrid"
    ADAPTIVE = "Adaptive"


class GeometricPrecision(Enum):
    MEDIUM = "Medium"
    HIGH = "High"
    EXTRA = "Extra"
    ULTRA = "Ultra"


class TilingPairSelection(Enum):
    GENERIC = "Generic"
    STRUCTURED_AERIAL = "StructuredAerial"
    REGION_OF_INTEREST = "RegionOfInterest"


class PhotoUsedForGeometry(Enum):
    EXCLUDE_THERMAL = "ExcludeThermal"
    INCLUDE_THERMAL = "IncludeThermal"
    NO = "None"


class HoleFilling(Enum):
    SMALL_HOLES = "SmallHoles"
    ALL_HOLES = "AllHoles"


class Simplification(Enum):
    STANDARD = "Standard"
    PLANAR_RELATIVE = "PlanarRelative"
    PLANAR_ABSOLUTE = "PlanarAbsolute"


class ColorCorrection(Enum):
    NO = "None"
    STANDARD = "Standard"
    STANDARD_WITH_THERMAL = "StandardWithThermal"
    BLOCK_WISE = "BlockWise"
    BLOCK_WISE_WITH_THERMAL = "BlockWiseWithThermal"


class UntexturedRepresentation(Enum):
    INPAINTING_COMPLETION = "InpaintingCompletion"
    UNIFORM_COLOR = "UniformColor"


class PointCloudColorSource(Enum):
    NO = "None"
    COLOR = "Color"
    INTENSITY = "Intensity"
    SCALED_INTENSITY = "ScaledIntensity"


class TextureSource(Enum):
    PHOTOS_FIRST = "PhotosFirst"
    POINT_CLOUDS_FIRST = "PointCloudsFirst"
    SMART = "Smart"


class ReferenceModelOptions(BaseModel):
    ref_model_type: Optional[ReferenceModelType] = Field(description="Reference Model Type", alias="referenceModelType",
                                                         default=None)
    tiling_mode: Optional[TilingMode] = Field(description="Tiling Mode", alias="tilingMode", default=None)
    tiling_value: Optional[float] = Field(description="Tiling Value", alias="tilingValue", ge=0, default=None)
    tiling_origin: Optional[Point3d] = Field(description="Tiling origin", alias="tilingOrigin", default=None)
    discard_empty_tiles: Optional[bool] = Field(description="Discard emtpy tiles", alias="discardEmptyTiles",
                                                default=None)
    srs: Optional[str] = Field(description="Spatial Reference System", default=None)
    geometric_precision: Optional[GeometricPrecision] = Field(description="Geometric precision",
                                                              alias="geometricPrecision", default=None)
    pair_selection: Optional[TilingPairSelection] = Field(description="Pair selection", alias="pairSelection",
                                                          default=None)
    photo_used_for_geometry: Optional[PhotoUsedForGeometry] = Field(description="Photo used for geometry",
                                                                    alias="photoUsedForGeometry", default=None)
    hole_filling: Optional[HoleFilling] = Field(description="Hole Filling", alias="holeFilling", default=None)
    simplification: Optional[Simplification] = Field(description="Simplification", default=None)
    planar_simplification_tolerance: Optional[float] = Field(description="Planar simplification tolerance",
                                                             alias="planarSimplificationTolerance", default=None)
    point_cloud_color_source: Optional[PointCloudColorSource] = Field(description="Point cloud color source",
                                                                      alias="pointCloudColorSource", default=None)
    color_correction: Optional[ColorCorrection] = Field(description="Color correction", alias="colorCorrection",
                                                        default=None)
    untextured_representation: Optional[UntexturedRepresentation] = Field(description="Untextured representation",
                                                                          alias="untexturedRepresentation",
                                                                          default=None)
    untextured_color: Optional[constr(pattern=r'^#[a-fA-F0-9]{6}$')] = Field(description="Untextured color",
                                                                             alias="untexturedColor", default=None)
    texture_source: Optional[TextureSource] = Field(description="Texture source", alias="textureSource", default=None)
    ortho_resolution: Optional[float] = Field(description="Ortho resolution", alias="orthoResolution", default=None)
    geometry_resolution_limit: Optional[float] = Field(description="Geometry resolution limit",
                                                       alias="geometryResolutionLimit", default=None)
    texture_resolution_limit: Optional[float] = Field(description="Texture resolution limit",
                                                      alias="textureResolutionLimit", default=None)


class ReferenceModel(BaseModel):
    reference_model_path: str = Field(description="Reality data id of reference model", alias="referenceModelPath")


class TilingOutputs(BaseModel):
    reference_model: ReferenceModel = Field(description="Reference model", alias="referenceModel")


class TilingOutputsCreate(BaseModel):
    REFERENCE_MODEL = "referenceModel"


class TilingSpecifications(BaseModel):
    inputs: TilingInputs = Field(description="Inputs")
    outputs: TilingOutputs = Field(description="Outputs")
    options: ReferenceModelOptions = Field(description="Options")


class TilingSpecificationsCreate(BaseModel):
    inputs: TilingInputs = Field(description="Inputs")
    outputs: list[TilingOutputsCreate] = Field(description="Outputs")
    options: ReferenceModelOptions = Field(description="Options")


class Coords2d(BaseModel):
    x: float = Field(description="X coordinate")
    y: float = Field(description="Y coordinate")


class Polygon2DWithHoles(BaseModel):
    outsideBounds: list[Coords2d] = Field(description="Outside bounds of the polygon")
    holes: Optional[list[list[Coords2d]]] = Field(default=None, description="List of holes boundaries if any")


class RegionOfInterest(BaseModel):
    srs: str = Field(description="Definition of the Region of Interest Coordinate System")
    polygons: list[Polygon2DWithHoles] = Field(description="List of polygons")
    altitude_min: float = Field(description="Minimum altitude", alias="altitudeMin")
    altitude_max: float = Field(description="Maximum altitude", alias="altitudeMax")


class LayoutTile(BaseModel):
    name: str = Field(description="Tile name")
    box_tight: BoundingBox = Field(description="Tight box encompassing the tile", alias="boxTight")
    box_overlapping: BoundingBox = Field(description="Overlapping box encompassing the tile and a bit of its neighbors",
                                         alias="boxOverlapping")
    memory_usage: float = Field(description="Memory usage of the tile", alias="memoryUsage", ge=0)


class Layout(BaseModel):
    tiles: list[LayoutTile] = Field(description="List of tiles in the layout")
    enu_definition: str = Field(description="Definition of the Internal Coordinate System", alias="enuDefinition")
    srs_definition: str = Field(description="Definition of the Layout Coordinate System", alias="srsDefinition")
    roi: RegionOfInterest = Field(description="Region of interest of the layout")

from pydantic import BaseModel, Field
from typing import Optional, Union
from enum import Enum


class ProductionInputs(BaseModel):
    scene: str = Field(description="Reality data id of ContextScene to process")
    reference_model: str = Field(description="Reality data id of reference model to process", alias="referenceModel")
    preset: Optional[str] = Field(default=None, description="Path to preset")


class Format(Enum):
    THREEMX = "ThreeMX"
    THREESM = "ThreeSM"
    THREED_TILES = "3DTiles"
    OSGB = "OSGB"
    SPACEYES = "SpacEyes"
    OBJ = "OBJ"
    S3C = "S3C"
    I3S = "I3S"
    LOD_TREE = "LodTree"
    COLLADA = "Collada"
    OCP = "OCP"
    KML = "KML"
    DGN = "DGN"
    SUPER_MAP = "SuperMap"
    LAS = "Las"
    POD = "POD"
    PLY = "Ply"
    OPC = "OPC"
    ORTHOPHOTO_DSM = "OrthophotoDSM"


class ColorSource(Enum):
    VISIBLE = "Visible"
    THERMAL = "Thermal"
    RESOLUTION = "Resolution"


class ThermalUnit(Enum):
    ABSOLUTE = "Absolute"
    CELSIUS = "Celsius"
    FAHRENHEIT = "Fahrenheit"


class LODScope(Enum):
    TILE_WISE = "TileWise"
    ACROSS_TILES = "AcrossTiles"


class LODType(Enum):
    NONE = "None"
    UNARY = "Unary"
    QUADTREE = "Quadtree"
    OCTREE = "Octree"
    ADAPTIVE = "Adaptive"
    BING_MAPS = "BingMaps"


class Options3MX(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color "
                                                                                 "source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color "
                                                                          "source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color "
                                                                          "source")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    srs_origin: Optional[str] = Field(None, alias="srsOrigin", description="Origin of the spatial reference system")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    generate_web_app: Optional[bool] = Field(None, alias="generateWebApp",
                                             description="Flag to generate a web application")


class Options3SM(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")


class CesiumCompression(Enum):
    NO = "None"
    DRACO = "Draco"


class Options3DTiles(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    compress: Optional[CesiumCompression] = Field(None, alias="compress", description="Compression type")


class OptionsOSGB(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    srs_origin: Optional[str] = Field(None, alias="srsOrigin", description="Origin of the spatial reference system")


class OptionsSpacEyes(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    disable_lighting: Optional[bool] = Field(None, alias="disableLighting", description="Flag to disable lighting")


class OptionsOBJ(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    maximum_texture_size: Optional[int] = Field(None, alias="maximumTextureSize", description="Maximum texture size")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    srs_origin: Optional[str] = Field(None, alias="srsOrigin", description="Origin of the spatial reference system")
    double_precision: Optional[bool] = Field(None, alias="doublePrecision", description="Flag for double precision")


class OptionsS3C(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    srs_origin: Optional[str] = Field(None, alias="srsOrigin", description="Origin of the spatial reference system")


class I3SVersion(Enum):
    V1_6 = "v1_6"
    V1_8 = "v1_8"


class OptionsI3S(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    version: Optional[I3SVersion] = Field(None, alias="version", description="I3S version")


class OptionsLodTreeExport(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")


class OptionsCollada(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    srs_origin: Optional[str] = Field(None, alias="srsOrigin", description="Origin of the spatial reference system")


class OptionsOCP(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    srs: Optional[str] = Field(None, description="Spatial reference system")


class OptionsKML(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    height_offset: Optional[float] = Field(None, alias="heightOffset", description="Height offset")


class OptionsDGN(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    lod_type: Optional[LODType] = Field(None, alias="lodType", description="Level of detail type")
    srs: Optional[str] = Field(None, description="Spatial reference system")
    srs_origin: Optional[str] = Field(None, alias="srsOrigin", description="Origin of the spatial reference system")


class OptionsSuperMap(BaseModel):
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")
    texture_color_source_res_min: Optional[float] = Field(None, alias="textureColorSourceResMin",
                                                          description="Minimum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_res_max: Optional[float] = Field(None, alias="textureColorSourceResMax",
                                                          description="Maximum resolution for the texture color source",
                                                          ge=0)
    texture_color_source_thermal_unit: Optional[ThermalUnit] = Field(None, alias="textureColorSourceThermalUnit",
                                                                     description="Thermal unit for the texture color source")
    texture_color_source_thermal_min: Optional[float] = Field(None, alias="textureColorSourceThermalMin",
                                                              description="Minimum thermal value for the texture color source")
    texture_color_source_thermal_max: Optional[float] = Field(None, alias="textureColorSourceThermalMax",
                                                              description="Maximum thermal value for the texture color source")
    lod_scope: Optional[LODScope] = Field(None, alias="lodScope", description="Level of detail scope")
    srs: Optional[str] = Field(None, description="Spatial reference system")


class SamplingStrategy(Enum):
    RESOLUTION = "Resolution"
    ABSOLUTE = "Absolute"


class LasCompression(Enum):
    NONE = "None"
    LAZ = "LAZ"


class OptionsLAS(BaseModel):
    srs: Optional[str] = Field(None, description="Spatial reference system")
    sampling_strategy: Optional[SamplingStrategy] = Field(None, alias="samplingStrategy",
                                                          description="Sampling strategy")
    sampling_distance: Optional[float] = Field(None, alias="samplingDistance", description="Sampling distance")
    compress: Optional[LasCompression] = Field(None, description="Compression type")
    merge_point_clouds: Optional[bool] = Field(None, alias="mergePointClouds", description="Flag to merge point clouds")
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")


class OptionsPOD(BaseModel):
    srs: Optional[str] = Field(None, description="Spatial reference system")
    sampling_strategy: Optional[SamplingStrategy] = Field(None, alias="samplingStrategy",
                                                          description="Sampling strategy")
    sampling_distance: Optional[float] = Field(None, alias="samplingDistance", description="Sampling distance")
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")


class OptionsPLY(BaseModel):
    srs: Optional[str] = Field(None, description="Spatial reference system")
    sampling_strategy: Optional[SamplingStrategy] = Field(None, alias="samplingStrategy",
                                                          description="Sampling strategy")
    sampling_distance: Optional[float] = Field(None, alias="samplingDistance", description="Sampling distance")
    merge_point_clouds: Optional[bool] = Field(None, alias="mergePointClouds", description="Flag to merge point clouds")
    include_normals: Optional[bool] = Field(None, alias="includeNormals", description="Flag to include normals")
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")


class OptionsOPC(BaseModel):
    srs: Optional[str] = Field(None, description="Spatial reference system")
    sampling_strategy: Optional[SamplingStrategy] = Field(None, alias="samplingStrategy",
                                                          description="Sampling strategy")
    sampling_distance: Optional[float] = Field(None, alias="samplingDistance", description="Sampling distance")
    texture_color_source: Optional[ColorSource] = Field(None, alias="textureColorSource",
                                                        description="Source of the texture color")


class ProjectionMode(Enum):
    HIGHEST_POINT = "HighestPoint"
    LOWEST_POINT = "LowestPoint"


class OrthoFormat(Enum):
    GEOTIFF = "GeoTIFF"
    JPEG = "JPEG"
    KML_SUPER_OVERLAY = "KML_SuperOverlay"
    NONE = "None"


class DSMFormat(Enum):
    GEOTIFF = "GeoTIFF"
    XYZ = "XYZ"
    ASC = "ASC"
    NONE = "None"


class OrthoColorSource(Enum):
    REFERENCE_3D_MODEL_VISIBLE = "Reference3dModelVisible"
    OPTIMIZED_COMPUTATION_VISIBLE = "OptimizedComputationVisible"
    REFERENCE_3D_MODEL_THERMAL = "Reference3dModelThermal"
    OPTIMIZED_COMPUTATION_THERMAL = "OptimizedComputationThermal"


class OptionsOrthoDSM(BaseModel):
    srs: Optional[str] = Field(None, description="Spatial reference system")
    sampling_distance: Optional[float] = Field(None, alias="samplingDistance", description="Sampling distance")
    extent_file: Optional[str] = Field(None, alias="extentFile", description="Extent file")
    projection_mode: Optional[ProjectionMode] = Field(None, alias="projectionMode", description="Projection mode")
    merge_parts: Optional[bool] = Field(None, alias="mergeParts", description="Flag to merge parts")
    ortho_format: Optional[OrthoFormat] = Field(None, alias="orthoFormat", description="Ortho format")
    no_data_color: Optional[str] = Field(None, alias="noDataColor", description="No data color")
    color_source: Optional[OrthoColorSource] = Field(None, alias="colorSource", description="Color source")
    dsm_format: Optional[DSMFormat] = Field(None, alias="dsmFormat", description="DSM format")
    no_data_value: Optional[float] = Field(None, alias="noDataValue", description="No data value")
    no_data_transparency: Optional[bool] = Field(None, alias="noDataTransparency", description="No data transparency")


class ExportCreate(BaseModel):
    format: Format = Field(description="Export format")
    options: Optional[Union[Options3MX, Options3SM, Options3DTiles, OptionsOSGB, OptionsSpacEyes, OptionsOBJ, OptionsS3C,
                            OptionsI3S, OptionsLodTreeExport, OptionsCollada, OptionsOCP, OptionsKML, OptionsDGN,
                            OptionsSuperMap, OptionsLAS, OptionsPOD, OptionsPLY, OptionsOPC, OptionsOrthoDSM]] = Field(
        description="Options associated to format")


class Export(ExportCreate):
    export_path: str = Field(alias="exportPath", description="Reality data id of the export")


class ProductionOutputs(BaseModel):
    exports: list[Export] = Field(description="List of exports")


class ProductionOutputsCreate(BaseModel):
    exports: list[ExportCreate] = Field(description="List of exports")


class ProductionOptions(BaseModel):
    extent: Optional[str] = Field(None, description="Path to Region of Interest.")


class ProductionSpecifications(BaseModel):
    inputs: ProductionInputs = Field(description="Inputs")
    outputs: ProductionOutputs = Field(description="Outputs")
    options: ProductionOptions = Field(description="Options")


class ProductionSpecificationsCreate(BaseModel):
    inputs: ProductionInputs = Field(description="Inputs")
    outputs: ProductionOutputsCreate = Field(description="Outputs")
    options: ProductionOptions = Field(description="Options")

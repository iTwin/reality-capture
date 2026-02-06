from pydantic import BaseModel, Field, constr
from typing import Optional
from enum import Enum


class TileMapOptimizationInputs(BaseModel):
    tile_maps: list[str] = Field(description="Reality data Ids of tile maps to convert", alias="tileMaps")


class TileMapOptimizationFormat(Enum):
    XYZ_TILE_MAP = "XYZTileMap"


class TileMapImageFormat(Enum):
    JPG = "JPG"
    PNG = "PNG"


class TileMapOptimizationOptions(BaseModel):
    out_format: Optional[TileMapOptimizationFormat] = Field(None, description="Output format for the conversion.",
                                                            alias="format")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")
    top_level: Optional[int] = Field(None, description="Top level of the tile map to generate.", alias="topLevel")
    bottom_level: Optional[int] = Field(None, description="Bottom level of the tile map to generate.",
                                        alias="bottomLevel")
    image_format: Optional[TileMapImageFormat] = Field(None, alias="imageFormat", description="Image format")
    jpg_quality: Optional[int] = Field(None, description="Quality of JPG tiles to generate", alias="jpgQuality",
                                       ge=10, le=99)
    background_color: Optional[constr(pattern=r'^#[a-fA-F0-9]{6}$')] = (
        Field(None, description="Background color to use for tiles", alias="backgroundColor"))


class TileMapOptimizationSpecificationsCreate(BaseModel):
    inputs: TileMapOptimizationInputs = Field(description="Inputs")
    options: Optional[TileMapOptimizationOptions] = Field(None, description="Options")


class TileMapOptimizationSpecifications(BaseModel):
    inputs: TileMapOptimizationInputs = Field(description="Inputs")
    outputs: str = Field(description="Reality Data id of the tile map")
    options: Optional[TileMapOptimizationOptions] = Field(None, description="Options")

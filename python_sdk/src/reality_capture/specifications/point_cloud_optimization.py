from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PCOptimizationInputs(BaseModel):
    point_clouds: list[str] = Field(description="Reality data Ids of point cloud(s) to convert", alias="pointClouds")


class PCOptimizationFormat(Enum):
    OPC = "OPC"
    THREE_D_TILES_PNTS = "3DTilesPnts"
    THREE_D_TILES_GLBC = "3DTilesGlbc"
    LAS = "LAS"
    LAZ = "LAZ"
    E57 = "E57"
    POD = "POD"


class PCOptimizationOptions(BaseModel):
    output_format: Optional[PCOptimizationFormat] = Field(None, description="Output format for the conversion.",
                                                       alias="outputFormat")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")


class PCOptimizationSpecificationsCreate(BaseModel):
    inputs: PCOptimizationInputs = Field(description="Inputs")
    options: Optional[PCOptimizationOptions] = Field(None, description="Options")


class PCOptimizationSpecifications(BaseModel):
    inputs: PCOptimizationInputs = Field(description="Inputs")
    output: str = Field(description="Reality Data id of the converted point cloud")
    options: Optional[PCOptimizationOptions] = Field(None, description="Options")

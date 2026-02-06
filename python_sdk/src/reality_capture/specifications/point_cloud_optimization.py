from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PCOptimizationInputs(BaseModel):
    point_clouds: list[str] = Field(description="Reality data Ids of point cloud(s) to convert", alias="pointClouds")


class PCOptimizationFormat(Enum):
    OPC = "OPC"
    PNTS = "PNTS"
    CESIUM_3D_Tiles = "Cesium3DTiles"
    LAS = "LAS"


class PCOptimizationOptions(BaseModel):
    out_format: Optional[PCOptimizationFormat] = Field(None, description="Output format for the conversion.",
                                                       alias="format")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")


class PCOptimizationSpecificationsCreate(BaseModel):
    inputs: PCOptimizationInputs = Field(description="Inputs")
    options: Optional[PCOptimizationOptions] = Field(None, description="Options")


class PCOptimizationSpecifications(BaseModel):
    inputs: PCOptimizationInputs = Field(description="Inputs")
    outputs: str = Field(description="Reality Data id of the converted point cloud")
    options: Optional[PCOptimizationOptions] = Field(None, description="Options")

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PCConversionInputs(BaseModel):
    point_cloud: str = Field(description="Reality data Id of point cloud(s) to convert", alias="pointCloud")


class PCConversionFormat(Enum):
    OPC = "OPC"
    PNTS = "PNTS"
    CESIUM_3D_Tiles = "Cesium3DTiles"
    LAS = "LAS"


class PCConversionOptions(BaseModel):
    out_format: Optional[PCConversionFormat] = Field(None, description="Output format for the conversion.",
                                                     alias="format")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")


class PointCloudConversionSpecificationsCreate(BaseModel):
    inputs: PCConversionInputs = Field(description="Inputs")
    options: Optional[PCConversionOptions] = Field(None, description="Options")


class PointCloudConversionSpecifications(BaseModel):
    inputs: PCConversionInputs = Field(description="Inputs")
    outputs: str = Field(description="Reality Data id of the converted point cloud")
    options: Optional[PCConversionOptions] = Field(None, description="Options")

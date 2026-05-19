from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PCConversionInputs(BaseModel):
    point_cloud: str = Field(description="Reality data Id of point cloud(s) to convert", alias="pointCloud")


class PCConversionFormat(Enum):
    OPC = "OPC"
    THREE_D_TILES_PNTS = "3DTilesPnts"
    THREE_D_TILES_GLBC = "3DTilesGlbc"
    LAS = "LAS"
    LAZ = "LAZ"
    E57 = "E57"
    POD = "POD"


class PCConversionOptions(BaseModel):
    output_format: Optional[PCConversionFormat] = Field(None, description="Output format for the conversion.",
                                                     alias="outputFormat")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")


class PointCloudConversionSpecificationsCreate(BaseModel):
    inputs: PCConversionInputs = Field(description="Inputs")
    options: Optional[PCConversionOptions] = Field(None, description="Options")


class PointCloudConversionSpecifications(BaseModel):
    inputs: PCConversionInputs = Field(description="Inputs")
    output: str = Field(description="Reality Data id of the converted point cloud")
    options: Optional[PCConversionOptions] = Field(None, description="Options")

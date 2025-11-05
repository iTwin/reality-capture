from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class MeshSamplingInputs(BaseModel):
    meshes: list[str] = Field(description="Reality data Ids of meshes to sample")


class MeshSamplingFormat(Enum):
    OPC = "OPC"
    PNTS = "PNTS"
    CESIUM_3D_Tiles = "Cesium3DTiles"
    LAS = "LAS"


class MeshSamplingOptions(BaseModel):
    out_format: Optional[MeshSamplingFormat] = Field(None, description="Output format for the conversion.",
                                                     alias="format")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")
    sampling: Optional[float] = Field(None, description="Sampling value in meter")


class MeshSamplingSpecificationsCreate(BaseModel):
    inputs: MeshSamplingInputs = Field(description="Inputs")
    options: Optional[MeshSamplingOptions] = Field(None, description="Options")


class MeshSamplingSpecifications(BaseModel):
    inputs: MeshSamplingInputs = Field(description="Inputs")
    outputs: str = Field(description="Reality Data id of the sampled point cloud")
    options: Optional[MeshSamplingOptions] = Field(None, description="Options")

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class MeshSamplingInputs(BaseModel):
    meshes: list[str] = Field(description="Reality data Ids of meshes to sample")


class MeshSamplingFormat(Enum):
    OPC = "OPC"
    THREE_D_TILES_PNTS = "3DTilesPnts"
    THREE_D_TILES_GLBC = "3DTilesGlbc"
    LAS = "LAS"
    LAZ = "LAZ"
    E57 = "E57"
    POD = "POD"


class MeshSamplingOptions(BaseModel):
    output_format: Optional[MeshSamplingFormat] = Field(None, description="Output format for the conversion.",
                                                     alias="outputFormat")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")
    sampling: Optional[float] = Field(None, description="Sampling value in meter")


class MeshSamplingSpecificationsCreate(BaseModel):
    inputs: MeshSamplingInputs = Field(description="Inputs")
    options: Optional[MeshSamplingOptions] = Field(None, description="Options")


class MeshSamplingSpecifications(BaseModel):
    inputs: MeshSamplingInputs = Field(description="Inputs")
    output: str = Field(description="Reality Data id of the sampled point cloud")
    options: Optional[MeshSamplingOptions] = Field(None, description="Options")

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MeshOptimizationInputs(BaseModel):
    meshes: list[str] = Field(description="Reality Data IDs of the input mesh containers.")


class MeshOptimizationFormat(Enum):
    THREE_D_TILES_1_0 = "3DTiles_1.0"
    THREE_D_TILES_1_1 = "3DTiles_1.1"
    THREE_D_TILES_2_0 = "3DTiles_2.0"
    I3S_1_8 = "I3S_1.8"


class MeshOptimizationOptions(BaseModel):
    output_format: Optional[MeshOptimizationFormat] = Field(
        None, description="Output format for the optimized mesh.", alias="outputFormat"
    )
    output_crs: Optional[str] = Field(
        None, description="CRS for the output data.", alias="outputCrs"
    )


class MeshOptimizationSpecificationsCreate(BaseModel):
    inputs: MeshOptimizationInputs = Field(description="Inputs")
    options: Optional[MeshOptimizationOptions] = Field(None, description="Options")


class MeshOptimizationSpecifications(BaseModel):
    inputs: MeshOptimizationInputs = Field(description="Inputs")
    output: str = Field(description="Reality Data ID of the optimized mesh.")
    options: Optional[MeshOptimizationOptions] = Field(None, description="Options")

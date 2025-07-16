from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class GaussianSplatsInputs(BaseModel):
    scene: str = Field(description="Reality data ID of ContextScene to process.")
    splats_reference: Optional[str] = Field(None, description="Reality data ID of the Gaussian Splats Reference.")


class GaussianSplatsOutputs(BaseModel):
    splats: Optional[str] = Field(description="Reality data ID of Gaussian Splats.")
    splats_reference: Optional[str] = Field(None, description="Reality data ID of the Gaussian Splats Reference.")


class GaussianSplatsOutputsCreate(Enum):
    SPLATS = "Splats"
    SPLATS_REFERENCE = "SplatsReference"


class GSFormat(Enum):
    SPZ = "SPZ"
    THREED_TILES = "3DTiles"
    PLY = "PLY"


class GaussianSplatsOptions(BaseModel):
    format: Optional[GSFormat] = Field(default=None, description="Format of the Gaussian Splats")


class GaussianSplatsSpecifications(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: GaussianSplatsOutputs = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(description="Options")


class GaussianSplatsSpecificationsCreate(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: list[GaussianSplatsOutputsCreate] = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(description="Options")
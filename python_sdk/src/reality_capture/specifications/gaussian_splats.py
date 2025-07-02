from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class GaussianSplatsInputs(BaseModel):
    scene: str = Field(description="Reality data ID of ContextScene to process")
    presets: Optional[list[str]] = Field(default=None, description="List of paths to preset")


class GaussianSplatsOutputs(BaseModel):
    splats: str = Field(description="Reality data ID of Gaussian Splats")


class GaussianSplatsOutputsCreate(Enum):
    SPLATS = "Splats"


class GSFormat(Enum):
    SPZ = "SPZ"
    THREED_TILES = "3DTiles"
    PLY = "PLY"


class GSQuality(Enum):
    MODERATE = "Moderate"
    STANDARD = "Standard"
    MAXIMUM = "Maximum"


class GSCleaning(Enum):
    NONE = "None"
    MINIMAL = "Minimal"
    MODERATE = "Moderate"
    EXTENSIVE = "Extensive"


class GaussianSplatsOptions(BaseModel):
    format: Optional[GSFormat] = Field(default=None, description="Format of the Gaussian Splats")
    quality: Optional[GSQuality] = Field(default=None, description="Quality of the Gaussian Splats")
    cleaning: Optional[GSCleaning] = Field(default=None, description="Cleaning level for the Gaussian Splats")

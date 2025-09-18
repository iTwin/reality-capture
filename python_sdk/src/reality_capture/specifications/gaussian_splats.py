from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class GaussianSplatsInputs(BaseModel):
    scene: str = Field(description="Reality data ID of ContextScene to process.")
    splats_reference: Optional[str] = Field(None, description="Reality data ID of the Gaussian Splats Reference.",
                                            alias="splatsReference")
    region_of_interest: Optional[str] = Field(description="Path in the bucket to region of interest file",
                                              alias="regionOfInterest",
                                              default=None,
                                              pattern=r"^bkt:.+")


class GaussianSplatsOutputs(BaseModel):
    splats: Optional[str] = Field(description="Reality data ID of Gaussian Splats.")
    splats_reference: Optional[str] = Field(None, description="Reality data ID of the Gaussian Splats Reference.",
                                            alias="splatsReference")


class GaussianSplatsOutputsCreate(Enum):
    SPLATS = "splats"
    SPLATS_REFERENCE = "splatsReference"


class GSFormat(Enum):
    SPZ = "SPZ"
    THREED_TILES = "3DTiles"
    PLY = "PLY"


class GSImageSize(Enum):
    SMALL = "Small"
    MEDIUM = "Medium"
    LARGE = "Large"
    FULL = "Full"


class GaussianSplatsOptions(BaseModel):
    export_format: Optional[GSFormat] = Field(default=None, description="Format of the exported Gaussian Splats",
                                              alias="exportFormat")
    reference_image_size: Optional[GSImageSize] = Field(default=None,
                                                        description="Size of images to use to "
                                                                    "generate the Splats Reference",
                                                        alias="referenceImageSize")


class GaussianSplatsSpecifications(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: GaussianSplatsOutputs = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(description="Options")


class GaussianSplatsSpecificationsCreate(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: list[GaussianSplatsOutputsCreate] = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(description="Options")
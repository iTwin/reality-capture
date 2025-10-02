from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class GaussianSplatsInputs(BaseModel):
    scene: str = Field(description="Reality data ID of ContextScene to process.")
    splats_reference: Optional[str] = Field(default=None,
                                            description="Reality data ID of the Gaussian Splats Reference.",
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


class GSImageQuality(Enum):
    MEDIUM = "Medium"
    STANDARD = "Standard"
    HIGH = "High"


class GSSplatsDensity(Enum):
    MEDIUM = "Medium"
    STANDARD = "Standard"
    HIGH = "High"


class GaussianSplatsOptions(BaseModel):
    export_format: Optional[GSFormat] = Field(default=None, description="Format of the exported Gaussian Splats",
                                              alias="exportFormat")
    reference_image_quality: Optional[GSImageQuality] = Field(default=None,
                                                              description="Image quality to use to "
                                                                          "generate the Splats Reference",
                                                              alias="referenceImageQuality")
    reference_splats_density: Optional[GSSplatsDensity] = Field(default=None,
                                                               description="Splats density to use to "
                                                                           "generate the Splats Reference",
                                                               alias="referenceSplatsDensity")
    reference_tile_size: Optional[float] = Field(default=None, description="Tile size for the Splats Reference",
                                                 alias="referenceTileSize")


class GaussianSplatsSpecifications(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: GaussianSplatsOutputs = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(description="Options")


class GaussianSplatsSpecificationsCreate(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: list[GaussianSplatsOutputsCreate] = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(description="Options")
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
    crs_data: Optional[str] = Field(default=None, description="Path in the bucket for CRS data.", alias="crsData",
                                    pattern=r"^bkt:.+")

class GaussianSplatsOutputs(BaseModel):
    splats: Optional[str] = Field(default=None, description="Reality data ID of Gaussian Splats.")
    splats_reference: Optional[str] = Field(default=None, description="Reality data ID of the Gaussian Splats Reference.",
                                            alias="splatsReference")


class GaussianSplatsOutputsCreate(Enum):
    SPLATS = "splats"
    SPLATS_REFERENCE = "splatsReference"


class GSFormat(Enum):
    SPZ = "SPZ"
    THREED_TILES = "3DTiles"
    PLY = "PLY"


class GSQuality(Enum):
    MEDIUM = "Medium"
    STANDARD = "Standard"
    HIGH = "High"


class GaussianSplatsOptions(BaseModel):
    export_crs: Optional[str] = Field(default=None, description="CRS for the exported gaussian splats",
                                      alias="exportCrs")
    export_format: Optional[GSFormat] = Field(default=None, description="Format of the exported Gaussian Splats",
                                              alias="exportFormat")
    reference_quality: Optional[GSQuality] = Field(default=None,
                                                              description="Quality to use to "
                                                                          "generate the Splats Reference",
                                                              alias="referenceQuality")
    reference_tile_size: Optional[float] = Field(default=None, description="Tile size for the Splats Reference",
                                                 alias="referenceTileSize")


class GaussianSplatsSpecifications(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: GaussianSplatsOutputs = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(default=None, description="Options")


class GaussianSplatsSpecificationsCreate(BaseModel):
    inputs: GaussianSplatsInputs = Field(description="Inputs")
    outputs: list[GaussianSplatsOutputsCreate] = Field(description="Outputs")
    options: Optional[GaussianSplatsOptions] = Field(default=None, description="Options")
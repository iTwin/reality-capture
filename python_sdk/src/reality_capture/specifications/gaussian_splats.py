from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class GaussianSplatsInputs(BaseModel):
    scene: str = Field(description="Reality data ID (cloud) or local path (on-premise) of ContextScene to process.")
    splats_reference: Optional[str] = Field(default=None,
                                            description="Reality data ID (cloud) or local path (on-premise) of the Gaussian Splats Reference.",
                                            alias="splatsReference")
    region_of_interest: Optional[str] = Field(description="Path to region of interest file (bucket path in cloud, local path on-premise)",
                                              alias="regionOfInterest",
                                              default=None)
    crs_data: Optional[str] = Field(default=None,
                                    description="Path to CRS data file (bucket path in cloud, local path on-premise).",
                                    alias="crsData")
    preset: Optional[str] = Field(default=None, description="Path to preset")


class GaussianSplatsOutputs(BaseModel):
    splats: Optional[str] = Field(default=None, description="Reality data ID (cloud) or local path (on-premise) of Gaussian Splats.")
    splats_reference: Optional[str] = Field(default=None,
                                            description="Reality data ID (cloud) or local path (on-premise) of the Gaussian Splats Reference.",
                                            alias="splatsReference")


class GaussianSplatsOutputsCreate(Enum):
    SPLATS = "splats"
    SPLATS_REFERENCE = "splatsReference"


class GSFormat(str, Enum):
    PLY = "PLY"
    SPZ = "SPZ"
    THREED_TILES = "3DTiles"
    THREED_TILES_LOD = "3DTilesLOD"


class GSQuality(str, Enum):
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


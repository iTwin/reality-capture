from pydantic import BaseModel, Field
from typing import Optional
from reality_capture.specifications.tiling import ModelingReference, TilingOptions
from reality_capture.specifications.production import Export, ExportCreate


class ReconstructionInputs(BaseModel):
    scene: str = Field(description="Reality data id of ContextScene to process")
    region_of_interest: Optional[str] = Field(description="Path in the bucket to region of interest file, "
                                                          "used for tiling region of interest",
                                              pattern=r"^bkt:.+",
                                              alias="regionOfInterest", default=None)
    extent: Optional[str] = Field(None, description="Path in the bucket to region of interest file, "
                                                    "used for export extent",
                                  pattern=r"^bkt:.+")
    modeling_reference: Optional[str] = Field(None, description="Reality data id of modeling reference to process",
                                              alias="modelingReference")
    presets: Optional[list[str]] = Field(default=None, description="List of paths to preset")
    crs_data: Optional[str] = Field(default=None, description="Path in the bucket for CRS data.", alias="crsData",
                                    pattern=r"^bkt:.+")


class ReconstructionOutputs(BaseModel):
    modeling_reference: Optional[ModelingReference] = Field(None, description="Modeling reference",
                                                            alias="modelingReference")
    exports: Optional[list[Export]] = Field(None, description="List of exports")


class ReconstructionOutputsCreate(BaseModel):
    modeling_reference: Optional[bool] = Field(None, description="Modeling reference", alias="modelingReference")
    exports: Optional[list[ExportCreate]] = Field(None, description="Exports")


class ReconstructionSpecificationsCreate(BaseModel):
    inputs: ReconstructionInputs = Field(description="Inputs")
    outputs: ReconstructionOutputsCreate = Field(description="Outputs")
    options: Optional[TilingOptions] = Field(None, description="Options")


class ReconstructionSpecifications(BaseModel):
    inputs: ReconstructionInputs = Field(description="Inputs")
    outputs: ReconstructionOutputs = Field(description="Outputs")
    options: Optional[TilingOptions] = Field(None, description="Options")


class ReconstructionCost(BaseModel):
    gpix: float = Field(description="Number of GigaPixels in the overall inputs.", ge=0)
    mpoints: float = Field(description="Number of MegaPoints in the overall inputs.", ge=0)

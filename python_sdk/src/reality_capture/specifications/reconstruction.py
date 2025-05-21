from pydantic import BaseModel, Field
from typing import Optional
from reality_capture.specifications.tiling import ReferenceModel, TilingOptions
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
    reference_model: Optional[str] = Field(None, description="Reality data id of reference model to process",
                                           alias="referenceModel")
    presets: Optional[list[str]] = Field(default=None, description="List of paths to preset")


class ReconstructionOutputs(BaseModel):
    reference_model: Optional[ReferenceModel] = Field(None, description="Reference Model", alias="referenceModel")
    exports: Optional[list[Export]] = Field(None, description="List of exports")


class ReconstructionOutputsCreate(BaseModel):
    reference_model: Optional[bool] = Field(None, description="Reference Model", alias="referenceModel")
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

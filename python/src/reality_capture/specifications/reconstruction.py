from pydantic import BaseModel, Field
from typing import Optional, Union
from tiling import ReferenceModel, TilingOptions, TilingOutputsCreate
from production import Export, ExportCreate, ProductionOptions


class ReconstructionInputs(BaseModel):
    scene: str = Field(description="Reality data id of ContextScene to process")
    region_of_interest: Optional[str] = Field(description="Path to region of interest file prefix by reality data id",
                                              alias="regionOfInterest", default=None)
    reference_model: Optional[str] = Field(None, description="Reality data id of reference model to process",
                                           alias="referenceModel")
    preset: Optional[str] = Field(default=None, description="Path to preset")


class ReconstructionOutputs(BaseModel):
    reference_model: Optional[ReferenceModel] = Field(None, description="Reference Model", alias="referenceModel")
    exports: Optional[list[Export]] = Field(description="List of exports")


class ReconstructionOptions(TilingOptions, ProductionOptions):
    pass


class ReconstructionSpecificationsCreate(BaseModel):
    inputs: ReconstructionInputs = Field(description="Inputs")
    outputs: list[Union[TilingOutputsCreate, ExportCreate]] = Field(description="Outputs")
    options: ReconstructionOptions = Field(description="Options")


class ReconstructionSpecifications(BaseModel):
    inputs: ReconstructionInputs = Field(description="Inputs")
    outputs: ReconstructionOutputs = Field(description="Outputs")
    options: ReconstructionOptions = Field(description="Options")

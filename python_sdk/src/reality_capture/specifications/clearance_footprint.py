from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ClearanceFootprintInput(BaseModel):
    segmentation3d: str = Field(alias="segmentation3D",
                                description="Reality data id of ContextScene")
    objects3d: str = Field(alias="objects3D",
                           description="Reality data id of ContextScene, annotated with embedded 3D objects")

class ClearanceFootprintOutputs(BaseModel):
    footprints: Optional[str] = Field(None, alias="footprints",
                                      description="Reality data id of ContextScene, annotated with embedded 3D footprints")


class ClearanceFootprintOutputsCreate(Enum):
    FOOTPRINTS = "footprints"


class ClearanceFootprintOptions(BaseModel):
    source_label: Optional[str] = Field(None, alias="sourceLabel", description="Name of the label of the class to be projected.")
    target_label: Optional[str] = Field(None, alias="targetLabel", description="Name of the label of the class where the projection will be applied.")


class ClearanceFootprintSpecificationsCreate(BaseModel):
    inputs: ClearanceFootprintInput = Field(description="Inputs")
    outputs: list[ClearanceFootprintOutputsCreate] = Field(description="Outputs")
    options: Optional[ClearanceFootprintOptions] = Field(None, description="Options")


class ClearanceFootprintSpecifications(BaseModel):
    inputs: ClearanceFootprintInput = Field(description="Inputs")
    outputs: ClearanceFootprintOutputs = Field(description="Outputs")
    options: Optional[ClearanceFootprintOptions] = Field(None, description="Options")


from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ClearanceFootprintInputs(BaseModel):
    segmentation3d: str = Field(alias="segmentation3D",
                                description="Reality data id of ContextScene")
    objects3d: str = Field(alias="objects3D",
                           description="Reality data id of ContextScene, annotated with embedded 3D objects")

class ClearanceFootprintOutputs(BaseModel):
    footprints: Optional[str] = Field(None, alias="footprints",
                                      description="Reality data id of ContextScene, annotated with embedded 3D footprints")


class ClearanceFootprintOutputsCreate(Enum):
    FOOTPRINTS = "footprints"


class ClearanceFootprintSpecificationsCreate(BaseModel):
    inputs: ClearanceFootprintInputs = Field(description="Inputs")
    outputs: list[ClearanceFootprintOutputsCreate] = Field(description="Outputs")


class ClearanceFootprintSpecifications(BaseModel):
    inputs: ClearanceFootprintInputs = Field(description="Inputs")
    outputs: ClearanceFootprintOutputs = Field(description="Outputs")


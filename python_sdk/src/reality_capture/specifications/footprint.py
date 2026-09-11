from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class FootprintsInput(BaseModel):
    segmentation3d: str = Field(alias="segmentation3D",
                                description="Reality data id of ContextScene")
    objects3d: str = Field(alias="objects3D",
                           description="Reality data id of ContextScene, annotated with embedded 3D objects")

class FootprintsOutputs(BaseModel):
    footprints: Optional[str] = Field(None, alias="footprints",
                                      description="Reality data id of ContextScene, annotated with embedded 3D footprints")


class FootprintsOutputsCreate(Enum):
    FOOTPRINTS = "footprints"


class FootprintsSpecificationsCreate(BaseModel):
    inputs: FootprintsInput = Field(description="Inputs")
    outputs: list[FootprintsOutputsCreate] = Field(description="Outputs")


class FootprintsSpecifications(BaseModel):
    inputs: FootprintsInput = Field(description="Inputs")
    outputs: FootprintsOutputs = Field(description="Outputs")

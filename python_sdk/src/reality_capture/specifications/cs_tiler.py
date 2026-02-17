from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class CSTilerInputs(BaseModel):
    scene: str = Field(description="ContextScene reality data id to tile")

class CSObject(Enum):
    CAMERAS = "Cameras"
    TIE_POINTS = "TiePoints"
    ANNOTATIONS = "Annotations"


class CSTilerOptions(BaseModel):
    object_to_tile: Optional[CSObject] = Field(None, description="Object to tile inside the ContextScene.")


class ContextSceneTilerSpecificationsCreate(BaseModel):
    inputs: CSTilerInputs = Field(description="Inputs")
    options: Optional[CSTilerOptions] = Field(None, description="Options")


class ContextSceneTilerSpecifications(BaseModel):
    inputs: CSTilerInputs = Field(description="Inputs")
    output: str = Field(description="Reality Data id of tiled ContextScene")
    options: Optional[CSTilerOptions] = Field(None, description="Options")

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ClearanceCheckerInput(BaseModel):
    model_3d: str = Field(alias="model3D",
                          description="Reality data id of a 3D model (mesh, point cloud, a ContextScene with embedded 3D model) to process")
    footprints: str = Field(alias="footprints",
                            description="Reality data id of ContextScene, annotated with embedded 3D footprints")


class ClearanceOutputs(BaseModel):
    clearance: Optional[str] = Field(None, alias="clearance",
                                      description="Reality data id of ContextScene, annotated with embedded 3D clearance")


class ClearanceOutputsCreate(Enum):
    CLEARANCE = "clearance"


class ClearanceSpecificationsCreate(BaseModel):
    inputs: ClearanceInput = Field(description="Inputs")
    outputs: list[ClearanceOutputsCreate] = Field(description="Outputs")


class ClearanceSpecifications(BaseModel):
    inputs: ClearanceInput = Field(description="Inputs")
    outputs: ClearanceOutputs = Field(description="Outputs")

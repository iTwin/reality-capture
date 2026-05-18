from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ClearanceInputs(BaseModel):
    model_3d: str = Field(alias="model3d", description="Reality data id of a point cloud.")
    clearance_footprint: str = Field(alias="clearanceFootprint", description="Reality data id of building footprints.")


class ClearanceOutputs(BaseModel):
    ovf_points: Optional[str] = Field(None, alias="ovfPoints", description="Reality data id of OVF Clearance Points")
    ovf_lines: Optional[str] = Field(None, alias="ovfLines", description="Reality data id of OVF Clearance Lines")
    ovf_areas: Optional[str] = Field(None, alias="ovfAreas", description="Reality data id of OVF Clearance Areas")


class ClearanceOutputsCreate(Enum):
    OVF_POINTS = "ovfPoints"
    OVF_LINES = "ovfLines"
    OVF_AREAS = "ovfAreas"


class ClearanceSpecificationsCreate(BaseModel):
    inputs: ClearanceInputs = Field(description="Inputs")
    outputs: list[ClearanceOutputsCreate] = Field(description="Outputs")


class ClearanceSpecifications(BaseModel):
    inputs: ClearanceInputs = Field(description="Inputs")
    outputs: ClearanceOutputs = Field(description="Outputs")

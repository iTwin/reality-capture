from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class VolumeInputs(BaseModel):
    model_3d: str = Field(alias="model3d", description="Reality data id of a point cloud.")
    region_of_interest: str = Field(alias="regionOfInterest", pattern=r"^bkt:.+",
                                    description="Path to region of interest for volume computation.")


class VolumeOutputs(BaseModel):
    volume: Optional[str] = Field(None, description="Reality data id of OVF Clearance Points", pattern=r"^bkt:.+")


class VolumeOutputsCreate(Enum):
    VOLUME = "volume"


class VolumeSpecificationsCreate(BaseModel):
    inputs: VolumeInputs = Field(description="Inputs")
    outputs: list[VolumeOutputsCreate] = Field(description="Outputs")


class VolumeSpecifications(BaseModel):
    inputs: VolumeInputs = Field(description="Inputs")
    outputs: VolumeOutputs = Field(description="Outputs")

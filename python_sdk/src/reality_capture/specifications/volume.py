from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class VolumeInputs(BaseModel):
    model_3d: str = Field(alias="model3d", description="Reality data id of a point cloud.")
    footprint: str = Field(alias="footprint", pattern=r"^bkt:.+",
                           description="Path in the bucket to footprint for volume computation.")


class VolumeOutputs(BaseModel):
    volume: Optional[str] = Field(None, description="Path in the bucket to volume information.", pattern=r"^bkt:.+")


class VolumeOutputsCreate(Enum):
    VOLUME = "volume"


class VolumeSpecificationsCreate(BaseModel):
    inputs: VolumeInputs = Field(description="Inputs")
    outputs: list[VolumeOutputsCreate] = Field(description="Outputs")


class VolumeSpecifications(BaseModel):
    inputs: VolumeInputs = Field(description="Inputs")
    outputs: VolumeOutputs = Field(description="Outputs")

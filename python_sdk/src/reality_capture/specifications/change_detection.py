from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ChangeDetectionInputs(BaseModel):
    model_3d_a: str = Field(alias="model3dA", description="Reality data id of ContextScene, point cloud or mesh")
    model_3d_b: str = Field(alias="model3dB", description="Reality data id of ContextScene, point cloud or mesh")
    extent: Optional[str] = Field(None, alias="extent", pattern=r"^bkt:.+",
                                  description="Path in the bucket of the clipping polygon to apply")


class ChangeDetectionOutputs(BaseModel):
    objects3d: Optional[str] = Field(None, alias="objects3D",
                                     description="Reality data id of ContextScene, annotated with embedded 3D objects")
    classified_model_a: Optional[str] = Field(None, description="Model A with change classification", alias="changesInModelB")
    classified_model_b: Optional[str] = Field(None, description="Model B with change classification", alias="changesInModelA")


class ChangeDetectionOutputsCreate(Enum):
    OBJECTS_3D = "objects3d"
    CLASSIFIED_MODEL_A = "classifiedModelA"
    CLASSIFIED_MODEL_B = "classifiedModelB"


class ChangeDetectionOptions(BaseModel):
    threshold: Optional[float] = Field(None, description="High threshold to detect spatial changes "
                                                         "(hysteresis detection)")
    filter_threshold: Optional[float] = Field(None, alias="filterThreshold",
                                              description="Low threshold to detect spatial changes "
                                                          "(hysteresis detection)")


class ChangeDetectionSpecificationsCreate(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: list[ChangeDetectionOutputsCreate] = Field(description="Outputs")
    options: Optional[ChangeDetectionOptions] = Field(None, description="Options")


class ChangeDetectionSpecifications(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: ChangeDetectionOutputs = Field(description="Outputs")
    options: Optional[ChangeDetectionOptions] = Field(None, description="Options")

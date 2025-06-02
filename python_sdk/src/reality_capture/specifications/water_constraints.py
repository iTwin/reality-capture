from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class WaterConstraintsInputs(BaseModel):
    scene: str = Field(description="Reality data id of ContextScene")
    modeling_reference: str = Field(alias="modelingReference", description="Reality data id of Modeling Reference")
    water_detector: Optional[str] = Field(alias="waterDetector", description="Path to water detector", default=None)


class WaterConstraintsOptions(BaseModel):
    force_horizontal: Optional[bool] = Field(None, alias="forceHorizontal",
                                             description="Force constraints to be horizontal")


class WaterConstraintsOutputsCreate(Enum):
    CONSTRAINTS = "constraints"


class WaterConstraintsOutputs(BaseModel):
    constraints: str = Field(description="Path in the bucket of output constraints",
                             pattern=r"^bkt:.+")


class WaterConstraintsSpecificationsCreate(BaseModel):
    inputs: WaterConstraintsInputs = Field(description="Inputs")
    outputs: list[WaterConstraintsOutputsCreate] = Field(description="Outputs")
    options: WaterConstraintsOptions = Field(description="Options")


class WaterConstraintsSpecifications(BaseModel):
    inputs: WaterConstraintsInputs = Field(description="Inputs")
    outputs: WaterConstraintsOutputs = Field(description="Outputs")
    options: WaterConstraintsOptions = Field(description="Options")


class WaterConstraintsCost(BaseModel):
    gpix: float = Field(description="Number of GigaPixels in the overall inputs.", ge=0)

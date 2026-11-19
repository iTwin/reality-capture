from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class WaterConstraintsInputs(BaseModel):
    scene: str = Field(description="Reality data ID (cloud) or local path (on-premise) of ContextScene")
    modeling_reference: str = Field(alias="modelingReference", description="Reality data ID (cloud) or local path (on-premise) of Modeling Reference")
    crs_data: Optional[str] = Field(default=None,
                                    description="Path to CRS data file (bucket path in cloud, local path on-premise).",
                                    alias="crsData")


class WaterConstraintsOptions(BaseModel):
    force_horizontal: Optional[bool] = Field(None, alias="forceHorizontal",
                                             description="Force constraints to be horizontal")


class WaterConstraintsOutputsCreate(Enum):
    CONSTRAINTS = "constraints"


class WaterConstraintsOutputs(BaseModel):
    constraints: str = Field(description="Path to output constraints file (bucket path in cloud, local path on-premise)")


class WaterConstraintsSpecificationsCreate(BaseModel):
    inputs: WaterConstraintsInputs = Field(description="Inputs")
    outputs: list[WaterConstraintsOutputsCreate] = Field(description="Outputs")
    options: Optional[WaterConstraintsOptions] = Field(None, description="Options")


class WaterConstraintsSpecifications(BaseModel):
    inputs: WaterConstraintsInputs = Field(description="Inputs")
    outputs: WaterConstraintsOutputs = Field(description="Outputs")
    options: Optional[WaterConstraintsOptions] = Field(None, description="Options")


class WaterConstraintsCost(BaseModel):
    gpix: float = Field(description="Number of GigaPixels in the overall inputs.", ge=0)


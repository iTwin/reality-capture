from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class EvalO2DInputs(BaseModel):
    reference: str = Field(description="Reality data id of ContextScene, annotated with embedded 2D object references")
    prediction: str = Field(description="Reality data id of ContextScene, "
                                        "annotated with embedded 2D object predictions")


class EvalO2DOutputs(BaseModel):
    report: str = Field(description="Reality data id of json report with binary classification.")
    objects2d: str = Field(alias="objects2D", description="Reality data id of ContextScene, "
                                                          "annotated with classified embedded 2D objects")


class EvalO2DOutputsCreate(Enum):
    REPORT = "report"
    OBJECTS2D = "objects2D"


class EvalO2DOptions(BaseModel):
    threshold_iou: Optional[int] = Field(None, alias="thresholdIOU", description="Intersection over union threshold")


class EvalO2DSpecificationsCreate(BaseModel):
    inputs: EvalO2DInputs = Field(description="Inputs")
    outputs: list[EvalO2DOutputsCreate] = Field(description="Outputs")
    options: Optional[EvalO2DOptions] = Field(None, description="Options")


class EvalO2DSpecifications(BaseModel):
    inputs: EvalO2DInputs = Field(description="Inputs")
    outputs: EvalO2DOutputs = Field(description="Outputs")
    options: Optional[EvalO2DOptions] = Field(None, description="Options")

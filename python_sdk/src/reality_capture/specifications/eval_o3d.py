from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class EvalO3DInputs(BaseModel):
    reference: str = Field(description="Reality data id of ContextScene, annotated with embedded 3D object references")
    prediction: str = Field(description="Reality data id of ContextScene, "
                                        "annotated with embedded 3D object predictions")


class EvalO3DOutputs(BaseModel):
    report: str = Field(description="Reality data id of json report with binary classification")
    objects3d: str = Field(alias="objects3D", description="Reality data id of ContextScene, "
                                                          "annotated with classified embedded 3D objects")


class EvalO3DOutputsCreate(Enum):
    REPORT = "report"
    OBJECTS3D = "objects3D"


class EvalO3DOptions(BaseModel):
    threshold_iou: Optional[int] = Field(None, alias="thresholdIOU", description="Intersection over union threshold")


class EvalO3DSpecificationsCreate(BaseModel):
    inputs: EvalO3DInputs = Field(description="Inputs")
    outputs: list[EvalO3DOutputsCreate] = Field(description="Outputs")
    options: Optional[EvalO3DOptions] = Field(None, description="Options")


class EvalO3DSpecifications(BaseModel):
    inputs: EvalO3DInputs = Field(description="Inputs")
    outputs: EvalO3DOutputs = Field(description="Outputs")
    options: Optional[EvalO3DOptions] = Field(None, description="Options")

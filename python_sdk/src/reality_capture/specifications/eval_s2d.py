from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class EvalS2DInputs(BaseModel):
    reference: str = Field(description="Reality data ID (cloud) or local path (on-premise) of ContextScene, "
                                       "pointing to segmented photos reference")
    prediction: str = Field(description="Reality data ID (cloud) or local path (on-premise) of ContextScene, "
                                        "pointing to segmented photos prediction")


class EvalS2DOutputs(BaseModel):
    report: Optional[str] = Field(None,
                                  description="Path to JSON report file with confusion matrix (bucket path in cloud, local path on-premise)")
    segmented_photos: Optional[str] = Field(None, alias="segmentedPhotos",
                                            description="Reality data ID (cloud) or local path (on-premise) of segmented photos, "
                                                        "annotated with confusion matrix index")
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D",
                                          description="Reality data ID (cloud) or local path (on-premise) of ContextScene, "
                                                      "pointing to segmented photos")


class EvalS2DOutputsCreate(Enum):
    REPORT = "report"
    SEGMENTED_PHOTOS = "segmentedPhotos"
    SEGMENTATION2D = "segmentation2D"


class EvalS2DSpecificationsCreate(BaseModel):
    inputs: EvalS2DInputs = Field(description="Inputs")
    outputs: list[EvalS2DOutputsCreate] = Field(description="Outputs")


class EvalS2DSpecifications(BaseModel):
    inputs: EvalS2DInputs = Field(description="Inputs")
    outputs: EvalS2DOutputs = Field(description="Outputs")


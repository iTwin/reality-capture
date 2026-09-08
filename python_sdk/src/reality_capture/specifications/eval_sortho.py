from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class EvalSOrthoInputs(BaseModel):
    reference: str = Field(description="Reality data ID (cloud) or local path (on-premise) of ContextScene, "
                                       "pointing to segmented photos reference")
    prediction: str = Field(description="Reality data ID (cloud) or local path (on-premise) of ContextScene, "
                                        "pointing to segmented photos prediction")


class EvalSOrthoOutputs(BaseModel):
    report: Optional[str] = Field(None,
                                  description="Path to JSON report file with confusion matrix (bucket path in cloud, local path on-premise)")
    segmented_photos: Optional[str] = Field(None, alias="segmentedPhotos",
                                            description="Reality data ID (cloud) or local path (on-premise) of segmented photos, "
                                                        "annotated with confusion matrix index")
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D",
                                          description="Reality data ID (cloud) or local path (on-premise) of ContextScene, "
                                                      "pointing to segmented photos")


class EvalSOrthoOutputsCreate(Enum):
    REPORT = "report"
    SEGMENTED_PHOTOS = "segmentedPhotos"
    SEGMENTATION2D = "segmentation2D"


class EvalSOrthoSpecificationsCreate(BaseModel):
    inputs: EvalSOrthoInputs = Field(description="Inputs")
    outputs: list[EvalSOrthoOutputsCreate] = Field(description="Outputs")


class EvalSOrthoSpecifications(BaseModel):
    inputs: EvalSOrthoInputs = Field(description="Inputs")
    outputs: EvalSOrthoOutputs = Field(description="Outputs")


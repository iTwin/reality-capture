from pydantic import BaseModel, Field
from enum import Enum


class EvalSOrthoInputs(BaseModel):
    reference: str = Field(description="Reality data id of ContextScene, "
                                       "pointing to segmented photos reference")
    prediction: str = Field(description="Reality data id of ContextScene, "
                                        "pointing to segmented photos prediction")


class EvalSOrthoOutputs(BaseModel):
    report: str = Field(description="Reality data id of json report with confusion matrix")
    segmented_photos: str = Field(alias="segmentedPhotos", description="Reality data id of segmented photos, "
                                                                       "annotated with confusion matrix index")
    segmentation2d: str = Field(alias="segmentation2D", description="Reality data id of ContextScene, "
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

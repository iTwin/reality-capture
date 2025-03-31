from pydantic import BaseModel, Field
from enum import Enum


class EvalS2DInputs(BaseModel):
    reference: str = Field(description="Reality data id of ContextScene, "
                                       "pointing to segmented photos reference")
    prediction: str = Field(description="Reality data id of ContextScene, "
                                        "pointing to segmented photos prediction")


class EvalS2DOutputs(BaseModel):
    report: str = Field(description="Reality data id of json report with confusion matrix")
    segmented_photos: str = Field(alias="segmentedPhotos", description="Reality data id of segmented photos, "
                                                                       "annotated with confusion matrix index")
    segmentation2d: str = Field(alias="segmentation2D", description="Reality data id of ContextScene, "
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

from pydantic import BaseModel, Field
from enum import Enum


class EvalS3DInputs(BaseModel):
    reference: str = Field(description="Reality data id of ContextScene, "
                                       "pointing to segmented point cloud reference")
    prediction: str = Field(description="Reality data id of ContextScene, "
                                        "pointing to segmented point cloud prediction")


class EvalS3DOutputs(BaseModel):
    report: str = Field(description="Reality data id of json report with confusion matrix")
    segmented_point_cloud: str = Field(alias="segmentedPointCloud", description="Reality data id of segmented point "
                                                                                "cloud, annotated with "
                                                                                "confusion matrix index")
    segmentation3d: str = Field(alias="segmentation3D", description="Reality data id of ContextScene, "
                                                                    "pointing to segmented point cloud")


class EvalS3DOutputsCreate(Enum):
    REPORT = "report"
    SEGMENTED_POINT_CLOUD = "segmentedPointCloud"
    SEGMENTATION3D = "segmentation3D"


class EvalS3DSpecificationsCreate(BaseModel):
    inputs: EvalS3DInputs = Field(description="Inputs")
    outputs: list[EvalS3DOutputsCreate] = Field(description="Outputs")


class EvalS3DSpecifications(BaseModel):
    inputs: EvalS3DInputs = Field(description="Inputs")
    outputs: EvalS3DOutputs = Field(description="Outputs")

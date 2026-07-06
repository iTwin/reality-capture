from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TrainingS3DInputs(BaseModel):
    segmentations_3d: list[str] = Field(
        description="List of 3D models to train on.",
        alias="segmentations3D"
    )
    preset: Optional[str] = Field(default=None, description="Path to a preset")
    detector_name: str = Field(description="Name of the detector to train", alias="detectorName")


class TrainingS3DOutputs(BaseModel):
    detector: str = Field(description="Full detector information (name/version)")


class Segmentation3DTrainingModel(Enum):
    SPLATNET = "SPLATNet"
    POINT_TRANSFORMER_V3 = "PointTransformerV3"


class PointCloudFeature(Enum):
    RGB = "RGB"
    NORMAL = "NORMAL"
    INTENSITY = "INTENSITY"


class TrainingS3DOptions(BaseModel):
    epochs: Optional[int] = Field(
        None, description="Number of time to iterate over the entire dataset", ge=1, le=100
    )
    spacing: Optional[float] = Field(
        None,
        description="Spacing of the pointcloud seen by the detector (in meters).",
        gt=0
    )
    model: Optional[Segmentation3DTrainingModel] = Field(None, description="Training Model architecture to use.")
    features: Optional[list[PointCloudFeature]] = Field(None, description="Features to use for the training.")
    version_number: Optional[str] = Field(
        None, 
        description="String representing the version number for the newly trained detector.",
        alias="versionNumber",
        pattern=r"\d+(.\d+)?"
    )


class TrainingS3DOutputsCreate(Enum):
    DETECTOR = "detector"


class TrainingS3DSpecificationsCreate(BaseModel):
    inputs: TrainingS3DInputs = Field(description="Inputs")
    outputs: list[TrainingS3DOutputsCreate] = Field(description="Outputs")
    options: Optional[TrainingS3DOptions] = Field(None, description="Options")


class TrainingS3DSpecifications(BaseModel):
    inputs: TrainingS3DInputs = Field(description="Inputs")
    outputs: TrainingS3DOutputs = Field(description="Outputs")
    options: Optional[TrainingS3DOptions] = Field(None, description="Options")

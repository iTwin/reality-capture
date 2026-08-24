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
        pattern=r"^\d+(?:\.\d+)?$"
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


class Segmentation3DPair(BaseModel):
    segmentation_3d_a: str = Field(
        alias="segmentation3DA",
        description="Reality data id of ContextScene pointing to a segmented 3D model (time A)"
    )
    segmentation_3d_b: str = Field(
        alias="segmentation3DB",
        description="Reality data id of ContextScene pointing to a segmented 3D model (time B)"
    )


class TrainingCD3DInputs(BaseModel):
    segmentation_3d_pairs: list[Segmentation3DPair] = Field(
        alias="segmentation3DPairs",
        description="List of paired segmented 3D scenes for change detection training."
    )
    preset: Optional[str] = Field(default=None, description="Path to a preset")
    detector_name: str = Field(description="Name of the detector to train", alias="detectorName")


class TrainingCD3DOutputs(BaseModel):
    detector: str = Field(description="Full detector information (name/version)")


class TrainingCD3DOutputsCreate(Enum):
    DETECTOR = "detector"


class TrainingCD3DOptions(BaseModel):
    epochs: Optional[int] = Field(
        None, description="Number of times to iterate over the entire dataset", ge=1, le=100
    )
    spacing: Optional[float] = Field(
        None,
        description="Spacing of the point cloud seen by the detector (in meters).",
        gt=0
    )
    features: Optional[list[PointCloudFeature]] = Field(None, description="Features to use for the training.")
    ignore_class: Optional[int] = Field(
        None, alias="ignoreClass",
        description="Class index to ignore during training."
    )
    version_number: Optional[str] = Field(
        None,
        description="String representing the version number for the newly trained detector.",
        alias="versionNumber",
        pattern=r"^\d+(?:\.\d+)?$"
    )


class TrainingCD3DSpecificationsCreate(BaseModel):
    inputs: TrainingCD3DInputs = Field(description="Inputs")
    outputs: list[TrainingCD3DOutputsCreate] = Field(description="Outputs")
    options: Optional[TrainingCD3DOptions] = Field(None, description="Options")


class TrainingCD3DSpecifications(BaseModel):
    inputs: TrainingCD3DInputs = Field(description="Inputs")
    outputs: TrainingCD3DOutputs = Field(description="Outputs")
    options: Optional[TrainingCD3DOptions] = Field(None, description="Options")

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TrainingO2DInputs(BaseModel):
    scene: str = Field(
        description="Reality data id of a ContextScene pointing to photos with annotations (in the contextscene file)."
    )


class TrainingO2DOutputs(BaseModel):
    detector: str = Field(description="Reality data id of the detector.")
    metrics: Optional[str] = Field(None, description="Path in the bucket of the training metrics",
                                   pattern=r"^bkt:.+")


class TrainingO2DOptions(BaseModel):
    epochs: Optional[int] = Field(
        None, description="Number of time to iterate over the entire dataset"
    )
    max_train_split: Optional[float] = Field(
        None,
        alias="maxTrainingSplit",
        description="Ratio (between 0.0 excluded and 1.0 included) of training data used to train the detector, the rest will be used to evaluate the model after each epoch and compute extra evaluation metrics. Set it to 1.0 for no evaluation and use everything for training.",
        gt=0.0,
        le=1.0,
    )


class TrainingO2DOutputsCreate(Enum):
    DETECTOR = "detector"
    METRICS = "metrics"


class TrainingO2DSpecificationsCreate(BaseModel):
    inputs: TrainingO2DInputs = Field(description="Inputs")
    outputs: list[TrainingO2DOutputsCreate] = Field(description="Outputs")
    options: Optional[TrainingO2DOptions] = Field(None, description="Options")


class TrainingO2DSpecifications(BaseModel):
    inputs: TrainingO2DInputs = Field(description="Inputs")
    outputs: TrainingO2DOutputs = Field(description="Outputs")
    options: Optional[TrainingO2DOptions] = Field(None, description="Options")


class TrainingS3DInputs(BaseModel):
    segmentations_3d: list[str] = Field(
        description="List of 3D models to train on.",
        alias="segmentations3D"
    )
    presets: Optional[list[str]] = Field(default=None, description="List of paths to preset")
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
    version_name: Optional[str] = Field(None, description="Version name for the newly trained detector.", alias="versionName")


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

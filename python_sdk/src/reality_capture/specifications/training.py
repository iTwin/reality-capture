from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TrainingO2DInputs(BaseModel):
    scene: str = Field(
        description="Reality data id of a ContextScene pointing to photos with annotations (in the contextscene file)."
    )


class TrainingO2DOutputs(BaseModel):
    detector: str = Field(description="Reality data id of the detector.")
    metrics: Optional[str] = Field(None, description="Reality data id of the metrics")


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
    scene: str = Field(
        description="Reality data id of a ContextScene pointing to photos with annotations (in the contextscene file)."
    )


class TrainingS3DOutputs(BaseModel):
    detector: str = Field(description="Reality data id of the detector.")


class TrainingS3DOptions(BaseModel):
    epochs: Optional[int] = Field(
        None, description="Number of time to iterate over the entire dataset"
    )
    spacing: Optional[float] = Field(
        None,
        alias="spacing",
        description="Spacing of the pointcloud seen by the detector",
    )
    max_train_split: Optional[float] = Field(
        None,
        alias="maxTrainingSplit",
        description="Ratio (between 0.0 excluded and 1.0 included) of training data used to train the detector, the rest will be used to evaluate the model after each epoch and compute extra evaluation metrics. Set it to 1.0 for no evaluation and use everything for training.",
        gt=0.0,
        le=1.0,
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

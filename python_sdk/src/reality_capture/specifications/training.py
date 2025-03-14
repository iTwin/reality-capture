from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TrainingO2DInputs(BaseModel):
    dataset: str = Field(
        description="Reality data id of a ContextScene pointing to photos with annotations."
    )


class TrainingO2DOutputs(BaseModel):
    datector: str = Field(description="Reality data id of the detector.")
    metrics: int = Field(description="Reality data id of the metrics")


class TrainingO2DOptions(BaseModel):
    epochs: Optional[int] = Field(
        description="Number of time to iterate over the entire dataset"
    )
    max_train_split: Optional[float] = Field(
        description="Ratio of training data used to train the dataset, the rest will be used to evaluate the model"
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

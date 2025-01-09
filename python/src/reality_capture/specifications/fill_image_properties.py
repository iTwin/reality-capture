from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class FillImagePropertiesInputs(BaseModel):
    image_collections: Optional[list[str]] = Field(default=None,
                                                   description="List of image collection reality data ids",
                                                   alias="imageCollections")
    scene_to_process: Optional[str] = Field(default=None,
                                            description="Reality data id of ContextScene to process",
                                            alias="sceneToProcess")
    scene_to_complete: Optional[str] = Field(default=None,
                                             description="Reality data id of ContextScene to complete",
                                             alias="sceneToComplete")
    preset: Optional[str] = Field(default=None,
                                  description="Path to preset prefixed with reality data id")


class FillImagePropertiesOutputs(BaseModel):
    scene: str = Field(description="Output reality data id for scene with image properties filled")


class AltitudeReference(Enum):
    SEA_LEVEL = "SeaLevel"
    WGS84_ELLIPSOID = "WGS84Ellipsoid"


class FillImagePropertiesOptions(BaseModel):
    recursive_image_collections: Optional[bool] = Field(default=None,
                                                        description="Recursively read folders in image collection",
                                                        alias="recursiveImageCollections")
    altitude_reference: Optional[AltitudeReference] = Field(default=None,
                                                            description="Reference altitude when reading Z data "
                                                                        "from Exif",
                                                            alias="altitudeReference")


class FillImagePropertiesSpecifications(BaseModel):
    inputs: FillImagePropertiesInputs = Field(description="Inputs for Fill Image Properties job")
    outputs: FillImagePropertiesOutputs = Field(description="Outputs for Fill Image Properties job")
    options: FillImagePropertiesOptions = Field(description="Options for Fill Image Properties job")


class FillImagePropertiesOutputsCreate(Enum):
    SCENE = "scene"


class FillImagePropertiesSpecificationsCreate(BaseModel):
    inputs: FillImagePropertiesInputs = Field(description="Inputs for Fill Image Properties job")
    outputs: list[FillImagePropertiesOutputsCreate] = Field(description="List of output type for Fill Image Properties job")
    options: FillImagePropertiesOptions = Field(description="Outputs for Fill Image Properties job")



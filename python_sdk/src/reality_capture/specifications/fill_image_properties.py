from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class FillImagePropertiesInputs(BaseModel):
    """
    List of possible inputs for a Fill Image Properties job.
    """
    image_collections: Optional[list[str]] = Field(default=None,
                                                   description="List of image collection reality data ids.",
                                                   alias="imageCollections")
    scene_to_process: Optional[str] = Field(default=None,
                                            description="Reality data id of ContextScene to process.",
                                            alias="sceneToProcess")
    scene_to_complete: Optional[str] = Field(default=None,
                                             description="Reality data id of ContextScene to complete.",
                                             alias="sceneToComplete")
    preset: Optional[str] = Field(default=None,
                                  description="Path to preset prefixed with reality data id.")


class FillImagePropertiesOutputs(BaseModel):
    """
    List of possible outputs for a Fill Image Properties job.
    """
    scene: str = Field(description="Output reality data id of ContextScene with image properties filled.")


class AltitudeReference(Enum):
    """
    Values for Altitude Reference when filling image properties.
    """
    SEA_LEVEL = "SeaLevel"
    WGS84_ELLIPSOID = "WGS84Ellipsoid"


class FillImagePropertiesOptions(BaseModel):
    """
    List of possible options for Fill Image Properties job.
    """
    recursive_image_collections: Optional[bool] = Field(default=None,
                                                        description="Recursively read folders in image collection.",
                                                        alias="recursiveImageCollections")
    altitude_reference: Optional[AltitudeReference] = Field(default=None,
                                                            description="Reference altitude when reading Z data "
                                                                        "from Exif.",
                                                            alias="altitudeReference")


class FillImagePropertiesSpecifications(BaseModel):
    """
    Specifications for Fill Image Properties job.
    """
    inputs: FillImagePropertiesInputs = Field(description="Inputs for Fill Image Properties job")
    outputs: FillImagePropertiesOutputs = Field(description="Outputs for Fill Image Properties job")
    options: Optional[FillImagePropertiesOptions] = Field(None, description="Options for Fill Image Properties job")


class FillImagePropertiesOutputsCreate(Enum):
    """
    Values for outputs for Fill Image Properties job creation.
    """
    SCENE = "scene"


class FillImagePropertiesSpecificationsCreate(BaseModel):
    """
    Specifications for Fill Image Properties job creation.
    """
    inputs: FillImagePropertiesInputs = Field(description="Inputs for Fill Image Properties job")
    outputs: list[FillImagePropertiesOutputsCreate] = Field(description="List of output type for Fill "
                                                                        "Image Properties job")
    options: Optional[FillImagePropertiesOptions] = Field(None, description="Outputs for Fill Image Properties job")



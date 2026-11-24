from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SamSegmentation2DMode(Enum):
    AUTO = "Auto"
    TEXT = "Text"
    SEGMENTATION_2D = "Segmentation2D"
    POLYGONS_3D = "Polygons3D"


class SamSegmentation2DPreset(Enum):
    FAST = "Fast"
    BALANCED = "Balanced"
    QUALITY = "Quality"


class SamSegmentation2DInputs(BaseModel):
    photos: str = Field(description="Reality data id of ContextScene, pointing to photos to process")
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D",
                                          description="Reality data id of ContextScene, pointing to segmented photos "
                                                      "used as prompts, required if mode is Segmentation2D")
    polygons3d: Optional[str] = Field(None, alias="polygons3D",
                                      description="Reality data id of ContextScene, annotated with 3D polygons "
                                                  "used as prompts, required if mode is Polygons3D")
    model_3d: Optional[str] = Field(None, alias="model3D",
                                    description="Reality data id of ContextScene, pointing to a collection of "
                                                "point clouds/meshes, or a point cloud, or a mesh, "
                                                "required if mode is Polygons3D")
    text: Optional[list[str]] = Field(None, description="Text prompts, required if mode is Text")
    presets: Optional[SamSegmentation2DPreset] = Field(None, description="Speed/quality preset")
    mode: Optional[SamSegmentation2DMode] = Field(None, description="Prompting mode")


class SamSegmentation2DOutputs(BaseModel):
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D",
                                          description="Reality data id of ContextScene, pointing to segmented photos")
    segmented_photos: Optional[str] = Field(None, alias="segmentedPhotos",
                                            description="Reality data id of segmented photos")


class SamSegmentation2DOutputsCreate(Enum):
    SEGMENTATION2D = "segmentation2D"
    SEGMENTED_PHOTOS = "segmentedPhotos"


class SamSegmentation2DSpecificationsCreate(BaseModel):
    inputs: SamSegmentation2DInputs = Field(description="Inputs")
    outputs: list[SamSegmentation2DOutputsCreate] = Field(description="Outputs")


class SamSegmentation2DSpecifications(BaseModel):
    inputs: SamSegmentation2DInputs = Field(description="Inputs")
    outputs: SamSegmentation2DOutputs = Field(description="Outputs")

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ExtractGroundInputs(BaseModel):
    point_clouds: Optional[str] = Field(None, alias="pointClouds", description="TODO")
    meshes: Optional[str] = Field(None, description="TODO")
    point_cloud_segmentation_detector: str = Field(alias="pointCloudSegmentationDetector", description="TODO")
    clip_polygon: Optional[str] = Field(None, alias="clipPolygon", description="TODO")


class ExtractGroundOutputs(BaseModel):
    segmentation3d: str = Field(alias="segmentation3D", description="TODO")
    segmented_point_cloud: Optional[str] = Field(None, alias="segmentedPointCloud", description="TODO")
    segmentation3d_as_pod: Optional[str] = Field(None, alias="segmentation3DAsPOD", description="TODO")
    segmentation3d_as_las: Optional[str] = Field(None, alias="segmentation3DAsLAS", description="TODO")
    segmentation3d_as_laz: Optional[str] = Field(None, alias="segmentation3DAsLAZ", description="TODO")


class ExtractGroundOutputsCreate(Enum):
    SEGMENTATION3D = "segmentation3D"
    SEGMENTED_POINT_CLOUD = "segmentedPointCloud"
    SEGMENTATION3D_AS_POD = "segmentation3DAsPOD"
    SEGMENTATION3D_AS_LAS = "segmentation3DAsLAS"
    SEGMENTATION3D_AS_LAZ = "segmentation3DAsLAZ"


class ExtractGroundOptions(BaseModel):
    srs: Optional[str] = Field(None, description="TODO")


class ExtractGroundSpecificationsCreate(BaseModel):
    inputs: ExtractGroundInputs = Field(description="TODO")
    outputs: list[ExtractGroundOutputsCreate] = Field(description="TODO")
    options: ExtractGroundOptions = Field(description="TODO")


class ExtractGroundSpecifications(BaseModel):
    inputs: ExtractGroundInputs = Field(description="TODO")
    outputs: ExtractGroundOutputs = Field(description="TODO")
    options: ExtractGroundOptions = Field(description="TODO")

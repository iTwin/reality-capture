from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ExtractGroundInputs(BaseModel):
    point_clouds: Optional[str] = Field(None, alias="pointClouds", 
                                        description="Reality data id of ContextScene, "
                                                    "pointing to a collection of point clouds to process")
    meshes: Optional[str] = Field(None, description="Reality data id of ContextScene, "
                                                    "pointing to the collection of meshes to process")
    point_cloud_segmentation_detector: Optional[str] = Field(None, alias="pointCloudSegmentationDetector",
                                                             description="Either reality data id of "
                                                                         "point cloud segmentation detector "
                                                                         "or point cloud segmentation "
                                                                         "detector identifier "
                                                                         "from the AI Detectors library")
    clip_polygon: Optional[str] = Field(None, alias="clipPolygon", 
                                        description="Path in the bucket of the clipping polygon to apply",
                                        pattern=r"^bkt:.+")


class ExtractGroundOutputs(BaseModel):
    segmentation3d: str = Field(alias="segmentation3D", 
                                description="Reality data id of ContextScene, "
                                            "pointing to the segmented point cloud")
    segmented_point_cloud: str = Field(alias="segmentedPointCloud", 
                                       description="Reality data id of the ground segmentation as OPC file")
    segmentation3d_as_pod: Optional[str] = Field(None, alias="segmentation3DAsPOD", 
                                                 description="Reality data id of the ground segmentation as POD file")
    segmentation3d_as_las: Optional[str] = Field(None, alias="segmentation3DAsLAS", 
                                                 description="Reality data id of the ground segmentation as LAS file")
    segmentation3d_as_laz: Optional[str] = Field(None, alias="segmentation3DAsLAZ", 
                                                 description="Reality data id of the ground segmentation as LAZ file")


class ExtractGroundOutputsCreate(Enum):
    SEGMENTATION3D = "segmentation3D"
    SEGMENTED_POINT_CLOUD = "segmentedPointCloud"
    SEGMENTATION3D_AS_POD = "segmentation3DAsPOD"
    SEGMENTATION3D_AS_LAS = "segmentation3DAsLAS"
    SEGMENTATION3D_AS_LAZ = "segmentation3DAsLAZ"


class ExtractGroundOptions(BaseModel):
    crs: Optional[str] = Field(None, description="CRS used by segmentation3DAsLAS, "
                                                 "segmentation3DAsPOD and segmentation3DAsLAZ outputs")


class ExtractGroundSpecificationsCreate(BaseModel):
    inputs: ExtractGroundInputs = Field(description="Inputs")
    outputs: list[ExtractGroundOutputsCreate] = Field(description="Outputs")
    options: Optional[ExtractGroundOptions] = Field(None, description="Options")


class ExtractGroundSpecifications(BaseModel):
    inputs: ExtractGroundInputs = Field(description="Inputs")
    outputs: ExtractGroundOutputs = Field(description="Outputs")
    options: Optional[ExtractGroundOptions] = Field(None, description="Options")

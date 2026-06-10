from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ChangeDetectionInputs(BaseModel):
    model_3d_a: str = Field(alias="model3dA", description="Reality data id of ContextScene, point cloud or mesh")
    model_3d_b: str = Field(alias="model3dB", description="Reality data id of ContextScene, point cloud or mesh")
    extent: Optional[str] = Field(None, alias="extent", pattern=r"^bkt:.+",
                                  description="Path in the bucket of the clipping polygon to apply")


class ChangeDetectionOutputs(BaseModel):
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP",
                                              description="Reality data id of 3D objects locations "
                                                          "as SHP format")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON",
                                                  description="Reality data id of 3D objects locations "
                                                              "as GeoJSON file")
    segmented_model_3d_b: Optional[str] = Field(None, description="Reality data id of the 3D segmented model in the same format of model 3d B", alias="segmentedModel3DB")
    segmented_model_3d_a: Optional[str] = Field(None, description="Reality data id of the 3D segmented model in the same format of model 3d A", alias="segmentedModel3DA")
    segmentation_3d_a: Optional[str] = Field(None, description="Reality data id of ContextScene, pointing to the segmented 3D model A", alias="segmentation3DA")
    segmentation_3d_b: Optional[str] = Field(None, description="Reality data id of ContextScene, pointing to the segmented 3D model B", alias="segmentation3DB")


class ChangeDetectionOutputsCreate(Enum):
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"
    SEGMENTED_MODEL_3D_A = "segmentedModel3DA"
    SEGMENTED_MODEL_3D_B = "segmentedModel3DB"
    SEGMENTATION_3D_B = "segmentation3DB"
    SEGMENTATION_3D_A = "segmentation3DA"


class ChangeDetectionOptions(BaseModel):
    min_points_per_change: Optional[int] = Field(None, alias="minPointsPerChange",
                                                 description="Minimum number of points in a region "
                                                             "to be considered as a change")
    sampling_resolution: Optional[float] = Field(None, alias="meshSamplingResolution",
                                                 description="Target point cloud resolution when starting from meshes")
    grow_threshold: Optional[float] = Field(None, alias="growThreshold",
                                            description="High threshold to detect spatial changes "
                                                         "(hysteresis detection)")
    filter_threshold: Optional[float] = Field(None, alias="filterThreshold",
                                              description="Low threshold to detect spatial changes "
                                                          "(hysteresis detection)")


class ChangeDetectionSpecificationsCreate(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: list[ChangeDetectionOutputsCreate] = Field(description="Outputs")
    options: Optional[ChangeDetectionOptions] = Field(None, description="Options")


class ChangeDetectionSpecifications(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: ChangeDetectionOutputs = Field(description="Outputs")
    options: Optional[ChangeDetectionOptions] = Field(None, description="Options")

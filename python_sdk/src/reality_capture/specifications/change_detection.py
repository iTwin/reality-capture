from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ChangeDetectionInputs(BaseModel):
    model_3d_a: str = Field(alias="model3DA", description="Reality data id of ContextScene, point cloud, Gaussian splats, or mesh")
    model_3d_b: str = Field(alias="model3DB", description="Reality data id of ContextScene, point cloud, Gaussian splats, or mesh")
    extent: Optional[str] = Field(None, alias="extent", pattern=r"^bkt:.+",
                                  description="Path in the bucket of the clipping polygon to apply")
    preset: Optional[str] = Field(None, alias="preset", pattern=r"^bkt:.+",
                                  description="Path in the bucket of a preset file to use")


class ChangeDetectionOutputs(BaseModel):
    segmentation_3d_a: Optional[str] = Field(None, description="Reality data id of ContextScene, pointing to the segmented 3D model A", alias="segmentation3DA")
    segmented_model_3d_b: Optional[str] = Field(None, description="Reality data id of the 3D segmented model in the same format of model 3d B", alias="segmentedModel3DB")
    segmentation_3d_b: Optional[str] = Field(None, description="Reality data id of ContextScene, pointing to the segmented 3D model B", alias="segmentation3DB")
    segmented_model_3d_a: Optional[str] = Field(None, description="Reality data id of the 3D segmented model in the same format of model 3d A", alias="segmentedModel3DA")
    locations3d_a: Optional[str] = Field(None, alias="locations3DA",
                                              description="Reality data id of ContextScene with locations of changes in A")
    locations3d_a_as_shp: Optional[str] = Field(None, alias="locations3DAAsSHP",
                                              description="Reality data id of locations of changes in A"
                                                          "as SHP format")
    locations3d_a_as_geojson: Optional[str] = Field(None, alias="locations3DAAsGeoJSON",
                                                  description="Reality data id of locations of changes in A"
                                                              "as GeoJSON file")
    locations3d_b: Optional[str] = Field(None, alias="locations3DB",
                                         description="Reality data id of ContextScene with locations of changes in B")
    locations3d_b_as_shp: Optional[str] = Field(None, alias="locations3DBAsSHP",
                                                description="Reality data id of locations of changes in B as SHP format")
    locations3d_b_as_geojson: Optional[str] = Field(None, alias="locations3DBAsGeoJSON",
                                                    description="Reality data id of locations of changes in B as GeoJSON file")
    


class ChangeDetectionOutputsCreate(Enum):
    SEGMENTATION3D_A = "segmentation3DA"
    SEGMENTED_MODEL3D_A = "segmentedModel3DA"
    SEGMENTATION3D_B = "segmentation3DB"
    SEGMENTED_MODEL3D_B = "segmentedModel3DB"
    LOCATIONS3D_A = "locations3DA"
    LOCATIONS3D_A_AS_SHP = "locations3DAAsSHP"
    LOCATIONS3D_A_AS_GEOJSON = "locations3DAAsGeoJSON"
    LOCATIONS3D_B = "locations3DB"
    LOCATIONS3D_B_AS_SHP = "locations3DBAsSHP"
    LOCATIONS3D_B_AS_GEOJSON = "locations3DBAsGeoJSON"
    

class ChangeDetectionOptions(BaseModel):
    min_points_per_change: Optional[int] = Field(None, alias="minPointsPerChange",
                                                 description="Minimum number of points in a region "
                                                             "to be considered as a change")
    sampling_resolution: Optional[float] = Field(None, alias="samplingResolution",
                                                 description="Target point cloud resolution when starting from meshes")
    grow_threshold: Optional[float] = Field(None, alias="growThreshold",
                                            description="Low threshold to detect spatial changes "
                                                         "(hysteresis detection)")
    filter_threshold: Optional[float] = Field(None, alias="filterThreshold",
                                              description="High threshold to detect spatial changes "
                                                          "(hysteresis detection)")


class ChangeDetectionSpecificationsCreate(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: list[ChangeDetectionOutputsCreate] = Field(description="Outputs")
    options: Optional[ChangeDetectionOptions] = Field(None, description="Options")


class ChangeDetectionSpecifications(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: ChangeDetectionOutputs = Field(description="Outputs")
    options: Optional[ChangeDetectionOptions] = Field(None, description="Options")

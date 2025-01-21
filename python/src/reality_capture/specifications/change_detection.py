from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ChangeDetectionInputs(BaseModel):
    point_clouds1: Optional[str] = Field(None, alias="pointClouds1", 
                                         description="Reality data id of ContextScene, "
                                                     "pointing to a collection of point clouds to process")
    point_clouds2: Optional[str] = Field(None, alias="pointClouds2", 
                                         description="Reality data id of ContextScene, "
                                                     "pointing to a collection of point clouds to process")
    meshes1: Optional[str] = Field(None, description="Reality data id of ContextScene, "
                                                     "pointing to a collection of meshes to process")
    meshes2: Optional[str] = Field(None, description="Reality data id of ContextScene, "
                                                     "pointing to a collection of meshes to process")


class ChangeDetectionOutputs(BaseModel):
    objects3d: str = Field(alias="objects3D", description="Reality data id of ContextScene, "
                                                          "annotated with embedded 3D objects")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP", 
                                              description="Reality data id of 3D objects locations "
                                                          "as SHP format")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON", 
                                                  description="Reality data id of 3D objects locations "
                                                              "as GeoJSON file")


class ChangeDetectionOutputsCreate(Enum):
    OBJECTS3D = "objects3D"
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"


class ChangeDetectionOptions(BaseModel):
    srs: Optional[str] = Field(None, description="SRS used by locations3DAsSHP output")
    min_points: Optional[int] = Field(None, alias="minPoints",
                                      description="Minimum number of points in a region to be considered as a change")
    resolution: Optional[float] = Field(None,
                                        description="Target point cloud resolution when starting from meshes")
    dist_threshold_high: Optional[float] = Field(None, alias="distThresholdHigh",
                                                 description="High threshold to detect spatial changes "
                                                             "(hysteresis detection)")
    dist_threshold_low: Optional[float] = Field(None, alias="distThresholdLow",
                                                description="Low threshold to detect spatial changes "
                                                            "(hysteresis detection)")
    color_threshold_high: Optional[float] = Field(None, alias="colorThresholdHigh",
                                                  description="High threshold to detect color changes "
                                                              "(hysteresis detection)")
    color_threshold_low: Optional[float] = Field(None, alias="colorThresholdLow",
                                                 description="Low threshold to detect color changes "
                                                             "(hysteresis detection)")


class ChangeDetectionSpecificationsCreate(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: list[ChangeDetectionOutputsCreate] = Field(description="Outputs")
    options: ChangeDetectionOptions = Field(description="Options")


class ChangeDetectionSpecifications(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="Inputs")
    outputs: ChangeDetectionOutputs = Field(description="Outputs")
    options: ChangeDetectionOptions = Field(description="Options")

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class ChangeDetectionInputs(BaseModel):
    point_clouds1: Optional[str] = Field(None, alias="pointClouds1", description="TODO")
    point_clouds2: Optional[str] = Field(None, alias="pointClouds2", description="TODO")
    meshes1: Optional[str] = Field(None, description="TODO")
    meshes2: Optional[str] = Field(None, description="TODO")

class ChangeDetectionOutputs(BaseModel):
    objects3d: str = Field(alias="objects3D", description="TODO")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP", description="TODO")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON", description="TODO")

class ChangeDetectionOutputsCreate(Enum):
    OBJECTS3D = "objects3D"
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"

class ChangeDetectionOptions(BaseModel):
    srs: Optional[str] = Field(None, description="TODO")
    min_points: Optional[int] = Field(None, alias="minPoints", description="TODO")
    resolution: Optional[float] = Field(None, description="TODO")
    dist_threshold_high: Optional[float] = Field(None, alias="distThresholdHigh", description="TODO")
    dist_threshold_low: Optional[float] = Field(None, alias="distThresholdLow", description="TODO")
    color_threshold_high: Optional[float] = Field(None, alias="colorThresholdHigh", description="TODO")
    color_threshold_low: Optional[float] = Field(None, alias="colorThresholdLow", description="TODO")

class ChangeDetectionSpecificationsCreate(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="TODO")
    outputs: list[ChangeDetectionOutputsCreate] = Field(description="TODO")
    options: ChangeDetectionOptions = Field(description="TODO")

class ChangeDetectionSpecifications(BaseModel):
    inputs: ChangeDetectionInputs = Field(description="TODO")
    outputs: ChangeDetectionOutputs = Field(description="TODO")
    options: ChangeDetectionOptions = Field(description="TODO")

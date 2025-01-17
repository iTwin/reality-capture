from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Objects2DInputs(BaseModel):
    photos: str = Field(description="TODO")
    photo_object_detector: Optional[str] = Field(None, alias="photoObjectDetector", description="TODO")
    point_clouds: Optional[str] = Field(None, alias="pointClouds", description="TODO")
    meshes: Optional[str] = Field(None, description="TODO")
    objects2d: Optional[str] = Field(None, alias="objects2D", description="TODO")


class Objects2DOutputs(BaseModel):
    objects2d: Optional[str] = Field(None, alias="objects2D", description="TODO")
    objects3d: Optional[str] = Field(None, alias="objects3D", description="TODO")
    objects3d_as_dgn: Optional[str] = Field(None, alias="objects3DAsDGN", description="TODO")
    objects3d_as_3d_tiles: Optional[str] = Field(None, alias="objects3DAs3DTiles", description="TODO")
    objects3d_as_geojson: Optional[str] = Field(None, alias="objects3DAsGeoJSON", description="TODO")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP", description="TODO")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON", description="TODO")


class Objects2DOutputsCreate(Enum):
    OBJECTS2D = "objects2D"
    OBJECTS3D = "objects3D"
    OBJECTS3D_AS_DGN = "objects3DAsDGN"
    OBJECTS3D_AS_3DTILES = "objects3DAs3DTiles"
    OBJECTS3D_AS_GEOJSON = "objects3DAsGeoJSON"
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"


class Objects2DOptions(BaseModel):
    use_tie_points: Optional[bool] = Field(None, alias="useTiePoints", description="TODO")
    max_dist: Optional[float] = Field(None, alias="maxDist", description="TODO")
    srs: Optional[str] = Field(None, description="TODO")
    min_photos: Optional[int] = Field(None, alias="minPhotos", description="TODO")


class Objects2DSpecificationsCreate(BaseModel):
    inputs: Objects2DInputs = Field(description="TODO")
    outputs: list[Objects2DOutputsCreate] = Field(description="TODO")
    options: Objects2DOptions = Field(description="TODO")


class Objects2DSpecifications(BaseModel):
    inputs: Objects2DInputs = Field(description="TODO")
    outputs: Objects2DOutputs = Field(description="TODO")
    options: Objects2DOptions = Field(description="TODO")

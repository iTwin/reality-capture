from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ChangeDetectionInputs(BaseModel):
    reference: str = Field(description="Reality data id of ContextScene, point cloud or mesh")
    to_compare: str = Field(alias="toCompare", description="Reality data id of ContextScene, point cloud or mesh")
    extent: Optional[str] = Field(None, alias="extent", pattern=r"^bkt:.+",
                                  description="Path in the bucket of the clipping polygon to apply")


class ChangeDetectionOutputs(BaseModel):
    objects3d: Optional[str] = Field(None, alias="objects3D",
                                     description="Reality data id of ContextScene, annotated with embedded 3D objects")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP", 
                                              description="Reality data id of 3D objects locations "
                                                          "as SHP format")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON", 
                                                  description="Reality data id of 3D objects locations "
                                                              "as GeoJSON file")
    added: Optional[str] = Field(None, description="Points in toCompare not in reference as OPC")
    removed: Optional[str] = Field(None, description="Point in reference not in toCompare as OPC")


class ChangeDetectionOutputsCreate(Enum):
    OBJECTS3D = "objects3D"
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"
    ADDED = "added"
    REMOVED = "removed"


class ChangeDetectionOptions(BaseModel):
    output_crs: Optional[str] = Field(None, alias="outputCrs",
                                      description="CRS used by locations3DAsSHP output")
    min_points_per_change: Optional[int] = Field(None, alias="minPointsPerChange",
                                                 description="Minimum number of points in a region "
                                                             "to be considered as a change")
    mesh_sampling_resolution: Optional[float] = Field(None, alias="meshSamplingResolution",
                                                      description="Target point cloud resolution when starting "
                                                                  "from meshes")
    threshold: Optional[float] = Field(None, description="High threshold to detect spatial changes "
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

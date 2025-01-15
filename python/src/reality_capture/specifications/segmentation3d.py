from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class Segmentation3DInputs(BaseModel):
    point_clouds: Optional[str] = Field(None, alias="pointClouds", description="TODO")
    meshes: Optional[str] = Field(None, description="TODO")
    point_cloud_segmentation_detector: Optional[str] = Field(None, alias="pointCloudSegmentationDetector", description="TODO")
    segmentation3d: Optional[str] = Field(None, alias="segmentation3D", description="TODO")
    clip_polygon: Optional[str] = Field(None, alias="clipPolygon", description="TODO")

class Segmentation3DOutputs(BaseModel):
    segmentation3d: Optional[str] = Field(None, alias="segmentation3D", description="TODO")
    segmented_point_cloud: Optional[str] = Field(None, alias="segmentedPointCloud", description="TODO")
    segmentation3d_as_pod: Optional[str] = Field(None, alias="segmentation3DAsPOD", description="TODO")
    segmentation3d_as_las: Optional[str] = Field(None, alias="segmentation3DAsLAS", description="TODO")
    segmentation3d_as_laz: Optional[str] = Field(None, alias="segmentation3DAsLAZ", description="TODO")
    segmentation3d_as_ply: Optional[str] = Field(None, alias="segmentation3DAsPLY", description="TODO")
    objects3d: Optional[str] = Field(None, alias="objects3D", description="TODO")
    objects3d_as_dgn: Optional[str] = Field(None, alias="objects3DAsDGN", description="TODO")
    objects3d_as_3d_tiles: Optional[str] = Field(None, alias="objects3DAs3DTiles", description="TODO")
    objects3d_as_geojson: Optional[str] = Field(None, alias="objects3DAsGeoJSON", description="TODO")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP", description="TODO")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON", description="TODO")
    lines3d: Optional[str] = Field(None, alias="lines3D", description="TODO")
    lines3d_as_dgn: Optional[str] = Field(None, alias="lines3DAsDGN", description="TODO")
    lines3d_as_3d_tiles: Optional[str] = Field(None, alias="lines3DAs3DTiles", description="TODO")
    lines3d_as_geojson: Optional[str] = Field(None, alias="lines3DAsGeoJSON", description="TODO")
    polygons3d: Optional[str] = Field(None, alias="polygons3D", description="TODO")
    polygons3d_as_dgn: Optional[str] = Field(None, alias="polygons3DAsDGN", description="TODO")
    polygons3d_as_3d_tiles: Optional[str] = Field(None, alias="polygons3DAs3DTiles", description="TODO")
    polygons3d_as_geojson: Optional[str] = Field(None, alias="polygons3DAsGeoJSON", description="TODO")

class Segmentation3DOutputsCreate(Enum):
    SEGMENTATION3D = "segmentation3D"
    SEGMENTED_POINT_CLOUD = "segmentedPointCloud"
    SEGMENTATION3D_AS_POD = "segmentation3DAsPOD"
    SEGMENTATION3D_AS_LAS = "segmentation3DAsLAS"
    SEGMENTATION3D_AS_LAZ = "segmentation3DAsLAZ"
    SEGMENTATION3D_AS_PLY = "segmentation3DAsPLY"
    OBJECTS3D = "objects3D"
    OBJECTS3D_AS_DGN = "objects3DAsDGN"
    OBJECTS3D_AS_3DTILES = "objects3DAs3DTiles"
    OBJECTS3D_AS_GEOJSON = "objects3DAsGeoJSON"
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"
    LINES3D = "lines3D"
    LINES3D_AS_DGN = "lines3DAsDGN"
    LINES3D_AS_3DTILES = "lines3DAs3DTiles"
    LINES3D_AS_GEOJSON = "lines3DAsGeoJSON"
    POLYGONS3D = "polygons3D"
    POLYGONS3D_AS_DGN = "polygons3DAsDGN"
    POLYGONS3D_AS_3DTiles = "polygons3DAs3DTiles"
    POLYGONS3D_AS_GeoJSON = "polygons3DAsGeoJSON"

class Segmentation3DOptions(BaseModel):
    srs: Optional[str] = Field(None, description="TODO")
    save_confidence: Optional[bool] = Field(None, alias="saveConfidence", description="TODO")
    compute_line_width: Optional[bool] = Field(None, alias="computeLineWidth", description="TODO")
    remove_small_components: Optional[float] = Field(None, alias="removeSmallComponents", description="TODO")

class Segmentation3DSpecificationsCreate(BaseModel):
    inputs: Segmentation3DInputs = Field(description="TODO")
    outputs: list[Segmentation3DOutputsCreate] = Field(description="TODO")
    options: Segmentation3DOptions = Field(description="TODO")

class Segmentation3DSpecifications(BaseModel):
    inputs: Segmentation3DInputs = Field(description="TODO")
    outputs: Segmentation3DOutputs = Field(description="TODO")
    options: Segmentation3DOptions = Field(description="TODO")






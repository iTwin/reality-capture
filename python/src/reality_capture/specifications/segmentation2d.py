from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Segmentation2DInputs(BaseModel):
    photos: str = Field(description="TODO")
    photo_segmentation_detector: Optional[str] = Field(None, alias="photoSegmentationDetector", description="TODO")
    point_clouds: Optional[str] = Field(None, alias="pointClouds", description="TODO")
    meshes: Optional[str] = Field(None, description="TODO")
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D", description="TODO")


class Segmentation2DOutputs(BaseModel):
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D", description="TODO")
    segmented_photos: Optional[str] = Field(None, alias="segmentedPhotos", description="TODO")
    lines3d: Optional[str] = Field(None, alias="lines3D", description="TODO")
    lines3d_as_dgn: Optional[str] = Field(None, alias="lines3DAsDGN", description="TODO")
    lines3d_as_3d_tiles: Optional[str] = Field(None, alias="lines3DAs3DTiles", description="TODO")
    lines3d_as_geojson: Optional[str] = Field(None, alias="lines3DAsGeoJSON", description="TODO")
    polygons3d: Optional[str] = Field(None, alias="polygons3D", description="TODO")
    polygons3d_as_dgn: Optional[str] = Field(None, alias="polygons3DAsDGN", description="TODO")
    polygons3d_as_3d_tiles: Optional[str] = Field(None, alias="polygons3DAs3DTiles", description="TODO")
    polygons3d_as_geojson: Optional[str] = Field(None, alias="polygons3DAsGeoJSON", description="TODO")


class Segmentation2DOutputsCreate(Enum):
    SEGMENTATION2D = "segmentation2D"
    SEGMENTED_PHOTOS = "segmentedPhotos"
    LINES3D = "lines3D"
    LINES3D_AS_DGN = "lines3DAsDGN"
    LINES3D_AS_3DTILES = "lines3DAs3DTiles"
    LINES3D_AS_GEOJSON = "lines3DAsGeoJSON"
    POLYGONS3D = "polygons3D"
    POLYGONS3D_AS_DGN = "polygons3DAsDGN"
    POLYGONS3D_AS_3DTILES = "polygons3DAs3DTiles"
    POLYGONS3D_AS_GEOJSON = "polygons3DAsGeoJSON"


class Segmentation2DOptions(BaseModel):
    compute_line_width: Optional[bool] = Field(None, alias="computeLineWidth", description="TODO")
    remove_small_component: Optional[float] = Field(None, alias="removeSmallComponents", description="TODO")
    srs: Optional[str] = Field(None, description="TODO")
    min_photos: Optional[int] = Field(None, alias="minPhotos", description="TODO")


class Segmentation2DSpecificationsCreate(BaseModel):
    inputs: Segmentation2DInputs = Field(description="TODO")
    outputs: list[Segmentation2DOutputsCreate] = Field(description="TODO")
    options: Segmentation2DOptions = Field(description="TODO")


class Segmentation2DSpecifications(BaseModel):
    inputs: Segmentation2DInputs = Field(description="TODO")
    outputs: Segmentation2DOutputs = Field(description="TODO")
    options: Segmentation2DOptions = Field(description="TODO")

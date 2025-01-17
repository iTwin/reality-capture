from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SegmentationOrthophotoInputs(BaseModel):
    orthophoto: str = Field(description="TODO")
    orthophoto_segmentation_detector: str = Field(alias="orthophotoSegmentationDetector", description="TODO")


class SegmentationOrthophotoOutputs(BaseModel):
    segmentation2d: str = Field(alias="segmentation2D", description="TODO")
    segmented_photos: str = Field(alias="segmented_photos", description="TODO")
    polygons2d: Optional[str] = Field(None, alias="polygons2D", description="TODO")
    polygons2d_as_shp: Optional[str] = Field(None, alias="polygons2DAsSHP", description="TODO")
    polygons2d_as_geojson: Optional[str] = Field(None, alias="polygons2DAsGeoJSON", description="TODO")
    lines2d: Optional[str] = Field(None, alias="lines2D", description="TODO")
    lines2d_as_shp: Optional[str] = Field(None, alias="lines2DAsSHP", description="TODO")
    lines2d_as_geojson: Optional[str] = Field(None, alias="lines2DAsGeoJSON", description="TODO")


class SegmentationOrthophotoOutputsCreate(Enum):
    SEGMENTATION2D = "segmentation2D"
    SEGMENTED_PHOTOS = "segmentedPhotos"
    POLYGONS2D = "polygons2D"
    POLYGONS2D_AS_SHP = "polygons2DAsSHP"
    POLYGONS2D_AS_geojson = "polygons2DAsGeoJSON"
    LINES2D = "lines2D"
    LINES2D_AS_SHP = "lines2DAsSHP"
    LINES2D_AS_GEOJSON = "lines2DAsGeoJSON"


class SegmentationOrthophotoOptions(BaseModel):
    pass


class SegmentationOrthophotoSpecificationsCreate(BaseModel):
    inputs: SegmentationOrthophotoInputs = Field(description="TODO")
    outputs: list[SegmentationOrthophotoOutputsCreate] = Field(description="TODO")
    options: SegmentationOrthophotoOptions = Field(description="TODO")


class SegmentationOrthophotoSpecifications(BaseModel):
    inputs: SegmentationOrthophotoInputs = Field(description="TODO")
    outputs: SegmentationOrthophotoOutputs = Field(description="TODO")
    options: SegmentationOrthophotoOptions = Field(description="TODO")

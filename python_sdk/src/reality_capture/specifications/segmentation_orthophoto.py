"""from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SegmentationOrthophotoInputs(BaseModel):
    orthophoto: str = Field(description="Reality data id of ContextScene, "
                                        "pointing to orthophotos to process")
    orthophoto_segmentation_detector: str = Field(alias="orthophotoSegmentationDetector",
                                                  description="Either reality data id "
                                                              "of orthophoto segmentation detector "
                                                              "or orthophoto segmentation detector identifier "
                                                              "from the AI Detectors library")


class SegmentationOrthophotoOutputs(BaseModel):
    segmentation2d: Optional[str] = Field(alias="segmentation2D",
                                          description="Reality data id of ContextScene, "
                                                      "pointing to segmented orthophotos")
    segmented_photos: Optional[str] = Field(alias="segmentedPhotos",
                                            description="Reality data id of segmented orthophotos")
    polygons2d: Optional[str] = Field(None, alias="polygons2D",
                                      description="Reality data id of ContextScene, "
                                                  "annotated with embedded 2D polygons")
    polygons2d_as_shp: Optional[str] = Field(None, alias="polygons2DAsSHP",
                                             description="Reality data id of 2D polygons as SHP file, "
                                                         "polygons2d output must be defined")
    polygons2d_as_geojson: Optional[str] = Field(None, alias="polygons2DAsGeoJSON",
                                                 description="Reality data id of 2D polygons "
                                                             "as GeoJSON file, polygons2d output must be defined")
    lines2d: Optional[str] = Field(None, alias="lines2D",
                                   description="Reality data id of ContextScene, "
                                               "annotated with embedded 2D lines")
    lines2d_as_shp: Optional[str] = Field(None, alias="lines2DAsSHP",
                                          description="Reality data id of 2D lines as SHP file, "
                                                      "lines2d output must be defined")
    lines2d_as_geojson: Optional[str] = Field(None, alias="lines2DAsGeoJSON",
                                              description="Reality data id of 2D lines as GeoJSON file, "
                                                          "lines2d output must be defined")


class SegmentationOrthophotoOutputsCreate(Enum):
    SEGMENTATION2D = "segmentation2D"
    SEGMENTED_PHOTOS = "segmentedPhotos"
    POLYGONS2D = "polygons2D"
    POLYGONS2D_AS_SHP = "polygons2DAsSHP"
    POLYGONS2D_AS_GEOJSON = "polygons2DAsGeoJSON"
    LINES2D = "lines2D"
    LINES2D_AS_SHP = "lines2DAsSHP"
    LINES2D_AS_GEOJSON = "lines2DAsGeoJSON"


class SegmentationOrthophotoSpecificationsCreate(BaseModel):
    inputs: SegmentationOrthophotoInputs = Field(description="Inputs")
    outputs: list[SegmentationOrthophotoOutputsCreate] = Field(description="Outputs")


class SegmentationOrthophotoSpecifications(BaseModel):
    inputs: SegmentationOrthophotoInputs = Field(description="Inputs")
    outputs: SegmentationOrthophotoOutputs = Field(description="Outputs")
"""
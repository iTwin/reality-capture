from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Segmentation2DInputs(BaseModel):
    photos: str = Field(description="Reality data id of ContextScene, pointing to photos to process")
    photo_segmentation_detector: Optional[str] = Field(None, alias="photoSegmentationDetector",
                                                       description="Either reality data id of "
                                                                   "photo segmentation detector "
                                                                   "or photo segmentation detector identifier from the "
                                                                   "AI Detectors library")
    point_clouds: Optional[str] = Field(None, alias="pointClouds",
                                        description="Reality data id of ContextScene, "
                                                    "pointing to a collection of point clouds to process")
    meshes: Optional[str] = Field(None,
                                  description="Reality data id of ContextScene, "
                                              "pointing to a collection of meshes to process")
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D",
                                          description="Reality data id of ContextScene, pointing to segmented photos, "
                                                      "this input replaces photo_segmentation_detector input")


class Segmentation2DOutputs(BaseModel):
    segmentation2d: Optional[str] = Field(None, alias="segmentation2D",
                                          description="Reality data id of ContextScene, pointing to segmented photos")
    segmented_photos: Optional[str] = Field(None, alias="segmentedPhotos",
                                            description="Reality data id of segmented photos")
    lines3d: Optional[str] = Field(None, alias="lines3D",
                                   description="Reality data id of ContextScene, annotated with embedded 3D lines")
    lines3d_as_dgn: Optional[str] = Field(None, alias="lines3DAsDGN",
                                          description="Reality data id of 3D lines as DGN file, "
                                                      "lines3d output must be defined")
    lines3d_as_3d_tiles: Optional[str] = Field(None, alias="lines3DAs3DTiles",
                                               description="Reality data id of 3D lines "
                                                           "as 3D Tiles file, lines3d output must be defined")
    lines3d_as_geojson: Optional[str] = Field(None, alias="lines3DAsGeoJSON",
                                              description="Reality data id of 3D lines as GeoJSON file, "
                                                          "lines3d output must be defined")
    polygons3d: Optional[str] = Field(None, alias="polygons3D",
                                      description="Reality data id of ContextScene, "
                                                  "annotated with embedded 3D polygons")
    polygons3d_as_dgn: Optional[str] = Field(None, alias="polygons3DAsDGN",
                                             description="Reality data id of 3D polygons as DGN file, "
                                                         "polygons3d output must be defined")
    polygons3d_as_3d_tiles: Optional[str] = Field(None, alias="polygons3DAs3DTiles",
                                                  description="Reality data id of 3D polygons "
                                                              "as 3D Tiles file, polygons3d output must be defined")
    polygons3d_as_geojson: Optional[str] = Field(None, alias="polygons3DAsGeoJSON",
                                                 description="Reality data id of 3D polygons "
                                                             "as GeoJSON file, polygons3d output must be defined")


class Segmentation2DOutputsCreate(Enum):
    SEGMENTATION2D = "segmentation2D"
    SEGMENTED_PHOTOS = "segmentedPhotos"
    LINES3D = "lines3D"
    LINES3D_AS_DGN = "lines3DAsDGN"
    """
    Requires LINES3D in order to be produced.
    """
    LINES3D_AS_3DTILES = "lines3DAs3DTiles"
    """
    Requires LINES3D in order to be produced.
    """
    LINES3D_AS_GEOJSON = "lines3DAsGeoJSON"
    """
    Requires LINES3D in order to be produced.
    """
    POLYGONS3D = "polygons3D"
    POLYGONS3D_AS_DGN = "polygons3DAsDGN"
    """
    Requires POLYGONS3D in order to be produced.
    """
    POLYGONS3D_AS_3DTILES = "polygons3DAs3DTiles"
    """
    Requires POLYGONS3D in order to be produced.
    """
    POLYGONS3D_AS_GEOJSON = "polygons3DAsGeoJSON"
    """
    Requires POLYGONS3D in order to be produced.
    """


class Segmentation2DOptions(BaseModel):
    compute_line_width: Optional[bool] = Field(None, alias="computeLineWidth",
                                               description="Estimation 3D line width at each vertex")
    remove_small_component: Optional[float] = Field(None, alias="removeSmallComponents",
                                                    description="Remove 3D lines with total length "
                                                                "smaller than this value")
    srs: Optional[str] = Field(None, description="SRS used by ``lines3D_as_dgn`` and ``polygons3D_as_dgn`` outputs")
    min_photos: Optional[int] = Field(None, alias="minPhotos",
                                      description="Minimum number of 2D detection to generate a 3D detection")


class Segmentation2DSpecificationsCreate(BaseModel):
    inputs: Segmentation2DInputs = Field(description="Inputs")
    outputs: list[Segmentation2DOutputsCreate] = Field(description="Outputs")
    options: Segmentation2DOptions = Field(description="Options")


class Segmentation2DSpecifications(BaseModel):
    inputs: Segmentation2DInputs = Field(description="Inputs")
    outputs: Segmentation2DOutputs = Field(description="Outputs")
    options: Segmentation2DOptions = Field(description="Options")

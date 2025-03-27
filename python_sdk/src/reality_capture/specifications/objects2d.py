from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Objects2DInputs(BaseModel):
    photos: str = Field(description="Reality data id of ContextScene, pointing to photos to process")
    photo_object_detector: Optional[str] = Field(None, alias="photoObjectDetector",
                                                 description="Either reality data id of photo object detector "
                                                             "or photo object detector identifier "
                                                             "from the AI Detectors library")
    point_clouds: Optional[str] = Field(None, alias="pointClouds",
                                        description="Reality data id of ContextScene, "
                                                    "pointing to a collection of point clouds to process")
    meshes: Optional[str] = Field(None,
                                  description="Reality data id of ContextScene, "
                                              "pointing to a collection of meshes to process")
    objects2d: Optional[str] = Field(None, alias="objects2D",
                                     description="Reality data id of ContextScene, annotated with embedded 2D objects, "
                                                 "this input replaces photo_object_detector input")


class Objects2DOutputs(BaseModel):
    objects2d: Optional[str] = Field(None, alias="objects2D",
                                     description="Reality data id of ContextScene, annotated with embedded 2D objects")
    objects3d: Optional[str] = Field(None, alias="objects3D",
                                     description="Reality data id of ContextScene, annotated with embedded 3D objects")
    objects3d_as_dgn: Optional[str] = Field(None, alias="objects3DAsDGN",
                                            description="Reality data id of 3D objects as DGN file, "
                                                        "objects3d output must be defined")
    objects3d_as_3d_tiles: Optional[str] = Field(None, alias="objects3DAs3DTiles",
                                                 description="Reality data id of 3D objects as 3D Tiles file, "
                                                             "objects3d output must be defined")
    objects3d_as_geojson: Optional[str] = Field(None, alias="objects3DAsGeoJSON",
                                                description="Reality data id of 3D objects as GeoJSON file, "
                                                            "objects3d output must be defined")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP",
                                              description="Reality data id of 3D objects locations as SHP file, "
                                                          "objects3d output must be defined")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON",
                                                  description="Reality data id of 3D objects locations "
                                                              "as GeoJSON file, "
                                                              "objects3d output must be defined")


class Objects2DOutputsCreate(Enum):
    OBJECTS2D = "objects2D"
    OBJECTS3D = "objects3D"
    OBJECTS3D_AS_DGN = "objects3DAsDGN"
    """
    Requires OBJECTS3D in order to be produced.
    """
    OBJECTS3D_AS_3DTILES = "objects3DAs3DTiles"
    """
    Requires OBJECTS3D in order to be produced.
    """
    OBJECTS3D_AS_GEOJSON = "objects3DAsGeoJSON"
    """
    Requires OBJECTS3D in order to be produced.
    """
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    """
    Requires OBJECTS3D in order to be produced.
    """
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"
    """
    Requires OBJECTS3D in order to be produced.
    """


class Objects2DOptions(BaseModel):
    use_tie_points: Optional[bool] = Field(None, alias="useTiePoints",
                                           description="Improve detection using tie points in oriented photos.")
    max_dist: Optional[float] = Field(None, alias="maxDist",
                                      description="Maximum distance between photos and 3D objects")
    crs: Optional[str] = Field(None, description="CRS used by ``objects3d_as_dgn`` and ``locations3d_as_shp`` outputs")
    min_photos: Optional[int] = Field(None, alias="minPhotos",
                                      description="Minimum number of 2D objects to generate a 3D object")


class Objects2DSpecificationsCreate(BaseModel):
    inputs: Objects2DInputs = Field(description="Inputs")
    outputs: list[Objects2DOutputsCreate] = Field(description="Outputs")
    options: Optional[Objects2DOptions] = Field(None, description="Options")


class Objects2DSpecifications(BaseModel):
    inputs: Objects2DInputs = Field(description="Inputs")
    outputs: Objects2DOutputs = Field(description="Outputs")
    options: Optional[Objects2DOptions] = Field(None, description="Options")

"""from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Segmentation3DInputs(BaseModel):
    model_3d: Optional[str] = Field(None, alias="model3D",
                                    description="Reality data id of ContextScene, "
                                                "pointing to a collection of point clouds/meshes to process, "
                                                "or a point cloud, or a mesh.")
    point_cloud_segmentation_detector: Optional[str] = Field(None, alias="pointCloudSegmentationDetector",
                                                             description="Either reality data id "
                                                                         "of point cloud segmentation object "
                                                                         "detector or point cloud "
                                                                         "segmentation detector identifier "
                                                                         "from the AI Detectors library")
    segmentation3d: Optional[str] = Field(None, alias="segmentation3D",
                                          description="Reality data id of ContextScene, "
                                                      "pointing to a segmented point cloud, "
                                                      "this input replaces point_cloud_segmentation_detector, "
                                                      "point_clouds and meshes inputs")
    extent: Optional[str] = Field(None, alias="extent", pattern=r"^bkt:.+",
                                  description="Path in the bucket of the clipping polygon to apply")


class Segmentation3DOutputs(BaseModel):
    segmentation3d: Optional[str] = Field(None, alias="segmentation3D",
                                          description="Reality data id of ContextScene, "
                                                      "pointing to the segmented point cloud")
    segmented_point_cloud: Optional[str] = Field(None, alias="segmentedPointCloud",
                                                 description="Reality data id of "
                                                             "the 3D segmentation as OPC file")
    segmentation3d_as_pod: Optional[str] = Field(None, alias="segmentation3DAsPOD",
                                                 description="Reality data id of "
                                                             "the segmented point cloud as POD file, "
                                                             "segmentation3D output must be defined")
    segmentation3d_as_las: Optional[str] = Field(None, alias="segmentation3DAsLAS",
                                                 description="Reality data id of "
                                                             "the segmented point cloud as LAS file, "
                                                             "segmentation3D output must be defined")
    segmentation3d_as_laz: Optional[str] = Field(None, alias="segmentation3DAsLAZ",
                                                 description="Reality data id of "
                                                             "the segmented point cloud as LAZ file, "
                                                             "segmentation3D output must be defined")
    segmentation3d_as_ply: Optional[str] = Field(None, alias="segmentation3DAsPLY",
                                                 description="Reality data id of "
                                                             "the segmented point cloud as PLY file, "
                                                             "segmentation3D output must be defined")
    objects3d: Optional[str] = Field(None, alias="objects3D",
                                     description="Reality data id of ContextScene, "
                                                 "annotated with embedded 3D objects")
    objects3d_as_3d_tiles: Optional[str] = Field(None, alias="objects3DAs3DTiles",
                                                 description="Reality data id of 3D objects "
                                                             "as 3D Tiles file, objects3d output must be defined")
    objects3d_as_geojson: Optional[str] = Field(None, alias="objects3DAsGeoJSON",
                                                description="Reality data id of 3D objects "
                                                            "as GeoJSON file, objects3d output must be defined")
    locations3d_as_shp: Optional[str] = Field(None, alias="locations3DAsSHP",
                                              description="Reality data id of 3D objects locations "
                                                          "as SHP file, objects3d output must be defined")
    locations3d_as_geojson: Optional[str] = Field(None, alias="locations3DAsGeoJSON",
                                                  description="Reality data id of 3D objects locations "
                                                              "as GeoJSON file, objects3d output must be defined")
    lines3d: Optional[str] = Field(None, alias="lines3D",
                                   description="Reality data id of ContextScene, "
                                               "annotated with embedded 3D lines")
    lines3d_as_3d_tiles: Optional[str] = Field(None, alias="lines3DAs3DTiles",
                                               description="Reality data id of 3D lines "
                                                           "as 3D Tiles file, lines3d output must be defined")
    lines3d_as_geojson: Optional[str] = Field(None, alias="lines3DAsGeoJSON",
                                              description="Reality data id of 3D lines as GeoJSON file, "
                                                          "lines3d output must be defined")
    polygons3d: Optional[str] = Field(None, alias="polygons3D",
                                      description="Reality data id of ContextScene, "
                                                  "annotated with embedded 3D polygons")
    polygons3d_as_3d_tiles: Optional[str] = Field(None, alias="polygons3DAs3DTiles", 
                                                  description="Reality data id of 3D polygons "
                                                              "as 3D Tiles file, polygons3d output must be defined")
    polygons3d_as_geojson: Optional[str] = Field(None, alias="polygons3DAsGeoJSON",
                                                 description="Reality data id of 3D polygons "
                                                             "as GeoJSON file, polygons3d output must be defined")


class Segmentation3DOutputsCreate(Enum):
    SEGMENTATION3D = "segmentation3D"
    SEGMENTED_POINT_CLOUD = "segmentedPointCloud"
    SEGMENTATION3D_AS_POD = "segmentation3DAsPOD"
    SEGMENTATION3D_AS_LAS = "segmentation3DAsLAS"
    SEGMENTATION3D_AS_LAZ = "segmentation3DAsLAZ"
    SEGMENTATION3D_AS_PLY = "segmentation3DAsPLY"
    OBJECTS3D = "objects3D"
    OBJECTS3D_AS_3DTILES = "objects3DAs3DTiles"
    OBJECTS3D_AS_GEOJSON = "objects3DAsGeoJSON"
    LOCATIONS3D_AS_SHP = "locations3DAsSHP"
    LOCATIONS3D_AS_GEOJSON = "locations3DAsGeoJSON"
    LINES3D = "lines3D"
    LINES3D_AS_3DTILES = "lines3DAs3DTiles"
    LINES3D_AS_GEOJSON = "lines3DAsGeoJSON"
    POLYGONS3D = "polygons3D"
    POLYGONS3D_AS_3DTiles = "polygons3DAs3DTiles"
    POLYGONS3D_AS_GeoJSON = "polygons3DAsGeoJSON"


class Segmentation3DOptions(BaseModel):
    crs: Optional[str] = Field(None, description="CRS used by POD, LAS, LAZ, PLY, DGN and SHP outputs")
    save_confidence: Optional[bool] = Field(None, alias="saveConfidence",
                                            description="Save confidence in 3D segmentation")
    compute_line_width: Optional[bool] = Field(None, alias="computeLineWidth",
                                               description="Estimation 3D line width at each vertex")
    remove_small_lines: Optional[float] = Field(None, alias="removeSmallLines",
                                                     description="Remove 3D lines with total length "
                                                                 "smaller than this value")
    keep_input_resolution: Optional[bool] = Field(None, alias="keepInputResolution",
                                                  description="To make segmentation 3D output exact same point input ")


class Segmentation3DSpecificationsCreate(BaseModel):
    inputs: Segmentation3DInputs = Field(description="Inputs")
    outputs: list[Segmentation3DOutputsCreate] = Field(description="Outputs")
    options: Optional[Segmentation3DOptions] = Field(None, description="Options")


class Segmentation3DSpecifications(BaseModel):
    inputs: Segmentation3DInputs = Field(description="Inputs")
    outputs: Segmentation3DOutputs = Field(description="Outputs")
    options: Optional[Segmentation3DOptions] = Field(None, description="Options")
"""
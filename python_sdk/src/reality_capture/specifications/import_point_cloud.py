from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from reality_capture.specifications.geometry import BoundingBox, Point3d


class ImportPCInputs(BaseModel):
    scene: str = Field(description="Reality data id of ContextScene to process")


class ImportPCOutputs(BaseModel):
    scan_collection: str = Field(description="Output reality data id for scan collection", alias="scanCollection")
    scene: Optional[str] = Field(default=None,
                                 description="Output reality data id for context scene referencing scan collection")


class ImportPCSpecifications(BaseModel):
    inputs: ImportPCInputs = Field(description="Inputs for importing a point cloud")
    outputs: ImportPCOutputs = Field(description="Outputs for point cloud import")


class ImportPCOutputsCreate(Enum):
    SCAN_COLLECTION = "scanCollection"
    SCENE = "scene"


class ImportPCSpecificationsCreate(BaseModel):
    inputs: ImportPCInputs = Field(description="Inputs for importing a point cloud")
    outputs: list[ImportPCOutputsCreate] = Field(description="List of outputs for point cloud import")


class ImportPCCost(BaseModel):
    mpoints: float = Field(description="Number of megapoints inside the point clouds", ge=0)


class Point3dTime(Point3d):
    t: float = Field(description="Timestamp of point")


class Scan(BaseModel):
    name: str = Field(description="Name of the scan")
    num_points: int = Field(description="Number of points in the scan", alias="numPoints")
    has_color: bool = Field(description="True if Scan has color information", alias="hasColor")
    has_intensity: bool = Field(description="True if Scan has intensity information", alias="hasIntensity")
    has_classification: bool = Field(description="True if Scan has classification information",
                                     alias="hasClassification")
    position: Optional[Point3d] = Field(description="Scanner position if scan is static", default=None)
    trajectories: Optional[list[list[Point3dTime]]] = Field(description="List of trajectories if scan was mobile",
                                                            default=None)


class PodMetadata(BaseModel):
    min_res: float = Field(description="Minimum resolution of the point cloud")
    max_res: float = Field(description="Maximum resolution of the point cloud")
    mean_res: float = Field(description="Mean resolution of the point cloud")
    med_res: float = Field(description="Median resolution of the point cloud")
    min_intensity: int = Field(description="Minimum intensity", ge=-32768, le=32767)
    max_intensity: int = Field(description="Maximum intensity", ge=-32768, le=32767)
    srs: str = Field(description="Spatial Reference System definition")
    bounding: BoundingBox = Field(description="Bounding box of the PointCloud")
    scans: list[Scan] = Field(description="List of scans")

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DetectorExport(Enum):
    OBJECTS = "Objects"
    LINES = "Lines"
    POLYGONS = "Polygons"
    LOCATIONS = "Locations"


class Capabilities(BaseModel):
    labels: list[str] = Field(description="Labels of the detector version.")
    exports: list[DetectorExport] = Field(description="Exports of the detector version.")


class DetectorStatus(Enum):
    AWAITING_DATA = "AwaitingData"
    READY = "Ready"


class DetectorVersion(BaseModel):
    creation_date: datetime = Field(description="Creation date of the version.", alias="creationDate")
    version: str = Field(description="Version number.")
    status: DetectorStatus = Field(description="Status of the version.")
    download_url: Optional[str] = Field(None, description="URL to download the detector version. "
                                                          "It is present only if the version status is 'Ready'.",
                                        alias="downloadUrl")
    creator_id: Optional[str] = Field(None, description="User Id of the version creator.", alias="creatorId")
    capabilities: Capabilities = Field(description="Capabilities of the version.")


class DetectorType(Enum):
    PHOTO_OBJECT_DETECTOR = "PhotoObjectDetector"
    PHOTO_SEGMENTATION_DETECTOR = "PhotoSegmentationDetector"
    ORTHOPHOTO_SEGMENTATION_DETECTOR = "OrthophotoSegmentationDetector"
    POINT_CLOUD_SEGMENTATION_DETECTOR = "PointCloudSegmentationDetector"


class DetectorBase(BaseModel):
    name: str = Field(description="Name of the detector.")
    display_name: Optional[str] = Field(None, description="Display name of the detector.", alias="displayName")
    description: Optional[str] = Field(None, description="Description of the detector.")
    type: DetectorType = Field(description="Type of the detector.")
    documentation_url: Optional[str] = Field(None, description="Display name of the detector.",
                                             alias="documentationUrl")


class Detector(DetectorBase):
    versions: list[DetectorVersion] = Field(description="All existing versions of the detector.")


class DetectorResponse(BaseModel):
    detector: Detector = Field(description="Detector.")


class DetectorMinimal(DetectorBase):
    latest_version: Optional[str] = Field(None, description="The latest version of the detector "
                                                            "with 'Ready' status, if any.",
                                          alias="latestVersion")


class DetectorsMinimalResponse(BaseModel):
    detectors: list[DetectorMinimal] = Field(description="List of minimal detectors.")

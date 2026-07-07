from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

from reality_capture.service.reality_data import URL

class DetectorExport(Enum):
    OBJECTS = "Objects"
    LINES = "Lines"
    POLYGONS = "Polygons"
    LOCATIONS = "Locations"


class DetectorType(Enum):
    PHOTO_OBJECT_DETECTOR = "PhotoObjectDetector"
    PHOTO_SEGMENTATION_DETECTOR = "PhotoSegmentationDetector"
    ORTHOPHOTO_SEGMENTATION_DETECTOR = "OrthophotoSegmentationDetector"
    POINT_CLOUD_SEGMENTATION_DETECTOR = "PointCloudSegmentationDetector"


class Capabilities(BaseModel):
    labels: list[str] = Field(description="Labels of the detector version.")
    exports: Optional[list[DetectorExport]] = Field(None, description="Exports of the detector version.")


class DetectorStatus(Enum):
    AWAITING_DATA = "AwaitingData"
    READY = "Ready"


class DetectorVersion(BaseModel):
    creation_date: datetime = Field(description="Creation date of the version.", alias="creationDate")
    version_number: str = Field(description="Version number.", alias="versionNumber")
    status: DetectorStatus = Field(description="Status of the version.")
    download_url: Optional[str] = Field(None, description="URL to download the detector version. "
                                                          "It is present only if the version status is 'Ready'.",
                                        alias="downloadUrl")
    creator_id: Optional[str] = Field(None, description="User Id of the version creator.", alias="creatorId")
    capabilities: Capabilities = Field(description="Capabilities of the version.")

class DetectorCreate(BaseModel):
    name: str = Field(description="Name of the detector.")
    display_name: Optional[str] = Field(None, description="An optional display name of the detector.", alias="displayName")
    description: Optional[str] = Field(None, description="An optional description of the detector.")
    type: DetectorType = Field(description="Type of the detector.")
    documentation_url: Optional[str] = Field(None, description="An optional URL to the detector's documentation.", alias="documentationUrl")

class DetectorUpdate(BaseModel):
    display_name: Optional[str] = Field(None, description="An optional display name of the detector.", alias="displayName")
    description: Optional[str] = Field(None, description="An optional description of the detector.")
    documentation_url: Optional[str] = Field(None, description="An optional URL to the detector's documentation.", alias="documentationUrl")

class DetectorVersionCreate(BaseModel):
    version_number: str = Field(description="Version number string", alias="versionNumber")
    capabilities: Capabilities = Field(description="Capabilities of the version.")

class Links(BaseModel):
    upload_url: URL = Field(description="URL to upload the detector zip file.", alias="uploadUrl")
    complete_url: URL = Field(description="URL to mark the completion of the detector version creation process.", alias="completeUrl")


class DetectorVersionCreateResponseLinks(BaseModel):
    version: DetectorVersion = Field(description="Created detector version")
    links: Links = Field(description="Upload links for the detector version", alias="_links")

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

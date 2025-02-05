from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Union, Optional
from reality_capture.specifications.calibration import CalibrationSpecifications, CalibrationSpecificationsCreate
from reality_capture.specifications.change_detection import (ChangeDetectionSpecifications,
                                                             ChangeDetectionSpecificationsCreate)
from reality_capture.specifications.constraints import (ConstraintsSpecificationsCreate,
                                                        ConstraintsSpecifications)
from reality_capture.specifications.extract_ground import (ExtractGroundSpecifications,
                                                           ExtractGroundSpecificationsCreate)
from reality_capture.specifications.fill_image_properties import (FillImagePropertiesSpecificationsCreate,
                                                                  FillImagePropertiesSpecifications)
from reality_capture.specifications.import_point_cloud import ImportPCSpecifications, ImportPCSpecificationsCreate
from reality_capture.specifications.objects2d import Objects2DSpecifications, Objects2DSpecificationsCreate
from reality_capture.specifications.production import ProductionSpecifications, ProductionSpecificationsCreate
from reality_capture.specifications.reconstruction import (ReconstructionSpecifications,
                                                           ReconstructionSpecificationsCreate)
from reality_capture.specifications.segmentation2d import (Segmentation2DSpecifications,
                                                           Segmentation2DSpecificationsCreate)
from reality_capture.specifications.segmentation3d import (Segmentation3DSpecifications,
                                                           Segmentation3DSpecificationsCreate)
from reality_capture.specifications.segmentation_orthophoto import (SegmentationOrthophotoSpecifications,
                                                                    SegmentationOrthophotoSpecificationsCreate)
from reality_capture.specifications.tiling import TilingSpecifications, TilingSpecificationsCreate
from reality_capture.specifications.touchup import (TouchUpImportSpecifications, TouchUpExportSpecifications,
                                                    TouchUpExportSpecificationsCreate)
from reality_capture.specifications.water_constraints import (WaterConstraintsSpecifications,
                                                              WaterConstraintsSpecificationsCreate)


class JobType(Enum):
    CALIBRATION = "Calibration"
    CHANGE_DETECTION = "ChangeDetection"
    CONSTRAINTS = "Constraints"
    EXTRACT_GROUND = "ExtractGround"
    FILL_IMAGE_PROPERTIES = "FillImageProperties"
    IMPORT_POINT_CLOUD = "ImportPointCloud"
    OBJECTS_2D = "Objects2D"
    PRODUCTION = "Production"
    RECONSTRUCTION = "Reconstruction"
    SEGMENTATION_2D = "Segmentation2D"
    SEGMENTATION_3D = "Segmentation3D"
    SEGMENTATION_ORTHOPHOTO = "SegmentationOrthophoto"
    TILING = "Tiling"
    TOUCH_UP_IMPORT = "TouchUpImport"
    TOUCH_UP_EXPORT = "TouchUpExport"
    WATER_CONSTRAINTS = "WaterConstraints"


class JobState(Enum):
    QUEUED = "Queued"
    ACTIVE = "Active"
    SUCCESS = "Success"
    FAILED = "Failed"
    CANCELLED = "Cancelled"


class JobCreate(BaseModel):
    name: Optional[str] = Field(None, description="Job name.", min_length=2)
    type: JobType = Field(description="Job type.")
    specifications: Union[CalibrationSpecificationsCreate, ChangeDetectionSpecificationsCreate,
                          ConstraintsSpecificationsCreate, ExtractGroundSpecificationsCreate,
                          FillImagePropertiesSpecificationsCreate, ImportPCSpecificationsCreate,
                          Objects2DSpecificationsCreate, ProductionSpecificationsCreate,
                          ReconstructionSpecificationsCreate, Segmentation2DSpecificationsCreate,
                          Segmentation3DSpecificationsCreate, SegmentationOrthophotoSpecificationsCreate,
                          TilingSpecificationsCreate, TouchUpExportSpecificationsCreate,
                          TouchUpImportSpecifications, WaterConstraintsSpecificationsCreate] = (
        Field(description="Specifications aligned with the job type."))
    itwin: str = Field(description="iTwin ID.")


class Execution(BaseModel):
    creation_date_time: datetime = Field(description="Creation date time for the job", alias="creationDateTime")
    start_date_time: Optional[datetime] = Field(description="Start date time for the job", alias="startDateTime")
    end_date_time: Optional[datetime] = Field(description="End date time for the job", alias="endDateTime")
    estimated_units: Optional[float] = Field(description="Estimated number of units consumed by the job",
                                             alias="estimatedUnits")


class Job(BaseModel):
    name: Optional[str] = Field(None, description="Job name.", min_length=2)
    type: JobType = Field(description="Job type.")
    itwin: str = Field(description="iTwin ID.")
    state: JobState = Field(description="Job state.")
    execution: Execution = Field(description="Execution information.")
    user: str = Field(description="User identifier.")
    specifications: Union[CalibrationSpecifications, ChangeDetectionSpecifications,
                          ConstraintsSpecifications, ExtractGroundSpecifications,
                          FillImagePropertiesSpecifications, ImportPCSpecifications,
                          Objects2DSpecifications, ProductionSpecifications,
                          ReconstructionSpecifications, Segmentation2DSpecifications,
                          Segmentation3DSpecifications, SegmentationOrthophotoSpecifications,
                          TilingSpecifications, TouchUpExportSpecifications,
                          TouchUpImportSpecifications, WaterConstraintsSpecifications] = (
        Field(description="Specifications aligned with the job type."))


class JobResponse(BaseModel):
    job: Job = Field(description="Job.")


class Progress(BaseModel):
    state: JobState = Field(description="State of the job.")
    percentage: float = Field(ge=0, le=100, description="Progress of the job.")


class ProgressResponse(BaseModel):
    progress: Progress = Field(description="Progress")

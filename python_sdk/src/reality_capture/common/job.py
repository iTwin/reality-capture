from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional


class JobType(Enum):
    CALIBRATION = "Calibration"
    CHANGE_DETECTION = "ChangeDetection"
    CONSTRAINTS = "Constraints"
    EVAL_O2D = "EvalO2D"
    EVAL_O3D = "EvalO3D"
    EVAL_S2D = "EvalS2D"
    EVAL_S3D = "EvalS3D"
    EVAL_SORTHO = "EvalSOrtho"
    FILL_IMAGE_PROPERTIES = "FillImageProperties"
    GAUSSIAN_SPLATS = "GaussianSplats"
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
    CLEARANCE_CALCULATION = "ClearanceCalculation"
    # POINT_CLOUD_CONVERSION = "PointCloudConversion"


class JobState(Enum):
    QUEUED = "Queued"
    ACTIVE = "Active"
    SUCCESS = "Success"
    FAILED = "Failed"
    TERMINATING_ON_CANCEL = "TerminatingOnCancel"
    TERMINATING_ON_FAILURE = "TerminatingOnFailure"
    CANCELLED = "Cancelled"


class BaseExecution(BaseModel):
    created_date_time: datetime = Field(description="Creation date time for the job.", alias="createdDateTime")
    started_date_time: Optional[datetime] = Field(None, description="Start date time for the job.",
                                                  alias="startedDateTime")
    ended_date_time: Optional[datetime] = Field(None, description="End date time for the job.", alias="endedDateTime")


class BaseProgress(BaseModel):
    state: JobState = Field(description="State of the job.")
    percentage: float = Field(ge=0, le=100, description="Progress of the job.")

from pydantic import BaseModel, Field,  ValidationInfo, field_validator
from datetime import datetime
from enum import Enum
from typing import Union, Any, Optional

from reality_capture.common.job import BaseProgress, BaseExecution, JobState, JobType
from reality_capture.specifications.calibration import CalibrationSpecifications
from reality_capture.specifications.change_detection import ChangeDetectionSpecifications
from reality_capture.specifications.clearance import ClearanceSpecifications
from reality_capture.specifications.constraints import ConstraintsSpecifications
from reality_capture.specifications.fill_image_properties import FillImagePropertiesSpecifications
from reality_capture.specifications.import_point_cloud import ImportPCSpecifications
from reality_capture.specifications.objects2d import Objects2DSpecifications
from reality_capture.specifications.production import ProductionSpecifications
from reality_capture.specifications.reconstruction import ReconstructionSpecifications
from reality_capture.specifications.segmentation2d import Segmentation2DSpecifications
from reality_capture.specifications.segmentation3d import Segmentation3DSpecifications
from reality_capture.specifications.segmentation_orthophoto import SegmentationOrthophotoSpecifications
from reality_capture.specifications.tiling import TilingSpecifications
from reality_capture.specifications.touchup import (TouchUpImportSpecifications, TouchUpExportSpecifications)
from reality_capture.specifications.water_constraints import WaterConstraintsSpecifications
from reality_capture.specifications.gaussian_splats import GaussianSplatsSpecifications
from reality_capture.specifications.eval_o2d import EvalO2DSpecifications
from reality_capture.specifications.eval_o3d import EvalO3DSpecifications
from reality_capture.specifications.eval_s2d import EvalS2DSpecifications
from reality_capture.specifications.eval_s3d import EvalS3DSpecifications
from reality_capture.specifications.eval_sortho import EvalSOrthoSpecifications


class ActiveJob(BaseModel):
    job_name: str = Field(description="Name of the job", alias="jobName")
    running_tasks: int = Field(description="Number of running tasks", alias="runningTasks")
    ready_tasks: int = Field(description="Number of tasks ready to be executed", alias="readyTasks")


class QueueSummary(BaseModel):
    jobs_failed: int = Field(description="Number of failed jobs", alias="jobsFailed")
    jobs_success: int = Field(description="Number of successful jobs", alias="jobsSuccess")
    jobs_cancelled: int = Field(description="Number of cancelled jobs", alias="jobsCancelled")
    jobs_active: list[ActiveJob] = Field(description="List of active jobs", alias="jobsActive")
    jobs_queued: int = Field(description="Number of queued jobs", alias="jobsQueued")


class Milestone(BaseModel):
    name: str = Field(description="Name of the milestone.")
    parameters: list[str] = Field(default_factory=list, description="List of parameters.")
    end_time: Optional[datetime] = Field(default=None, description="End time of the milestone.", alias="endTime")


class Progress(BaseProgress):
    milestones: list[Milestone] = Field(description="State of the job.")


class ExecutionOnPrem(BaseExecution):
    submit_host: str = Field(description="Computer who submitted the job.", alias="submitHost")
    submit_user: str = Field(description="User who submitted the job.", alias="submitUser")


class JobPriority(Enum):
    PAUSED = "Paused"
    LOW = "Low"
    NORMAL = "Normal"
    HIGH = "High"
    URGENT = "Urgent"


class JobFilters(BaseModel):
    include_state: Optional[list[JobState]] = Field(default=None, description="Include job state",
                                                    alias="includeState")
    created_date_time_range: Optional[tuple[datetime, datetime]] = Field(None, description="Select jobs created during this time range.",
                                                                         alias="createdDateTimeRange")
    ended_date_time_range: Optional[tuple[datetime, datetime]] = Field(None, description="Select jobs ended during this time range.",
                                                                       alias="endedDateTimeRange")
    started_date_time_range: Optional[tuple[datetime, datetime]] = Field(None, description="Select jobs started during this time range.",
                                                                         alias="startedDateTimeRange")
    limit: Optional[int] = Field(default=50, description="Number of jobs per page")
    continuation_token: Optional[str] = Field(default=None, description="Continuation token to get the next page",
                                              alias="continuationToken")

class Job(BaseModel):
    name: str = Field(description="Job name.")
    priority: JobPriority = Field(description="Job priority.")
    place: int = Field(description="Place of the job in the queue.")
    processing_hosts: list[str] = Field(description="List of processing hosts for the job. "
                                                    "If running, these are the hosts running the job. "
                                                    "If ended, these are the hosts that executed at least one task for this job.",
                                        alias="processingHosts")
    state: JobState = Field(description="State of the job.")
    execution_info: ExecutionOnPrem = Field(description="Known execution information for the job.",
                                            alias="executionInfo")
    type: JobType = Field(description="Type of the job.")
    shared_working_dir: str = Field(description="Shared working directory for the job.",
                                   alias="sharedWorkingDir")
    specifications: Union[CalibrationSpecifications, ChangeDetectionSpecifications, ConstraintsSpecifications,
                          EvalO2DSpecifications, EvalO3DSpecifications,
                          EvalS2DSpecifications, EvalS3DSpecifications,
                          EvalSOrthoSpecifications, FillImagePropertiesSpecifications,
                          GaussianSplatsSpecifications, ImportPCSpecifications,
                          Objects2DSpecifications, ProductionSpecifications,
                          ReconstructionSpecifications, Segmentation2DSpecifications,
                          Segmentation3DSpecifications, SegmentationOrthophotoSpecifications,
                          TilingSpecifications, TouchUpExportSpecifications,
                          TouchUpImportSpecifications, WaterConstraintsSpecifications,
                          ClearanceSpecifications] = (
        Field(description="Specifications aligned with the job type."))

    @field_validator("specifications", mode="plain")
    @classmethod
    def set_specification_validation_model(cls, raw_dict: dict[str, Any], validation_info: ValidationInfo):
        job_type = validation_info.data['type']

        specifications = None

        if job_type == JobType.CALIBRATION:
            specifications = CalibrationSpecifications(**raw_dict)
        elif job_type == JobType.CHANGE_DETECTION:
            specifications = ChangeDetectionSpecifications(**raw_dict)
        elif job_type == JobType.CONSTRAINTS:
            specifications = ConstraintsSpecifications(**raw_dict)
        elif job_type == JobType.EVAL_O2D:
            specifications = EvalO2DSpecifications(**raw_dict)
        elif job_type == JobType.EVAL_O3D:
            specifications = EvalO3DSpecifications(**raw_dict)
        elif job_type == JobType.EVAL_S2D:
            specifications = EvalS2DSpecifications(**raw_dict)
        elif job_type == JobType.EVAL_S3D:
            specifications = EvalS3DSpecifications(**raw_dict)
        elif job_type == JobType.EVAL_SORTHO:
            specifications = EvalSOrthoSpecifications(**raw_dict)
        elif job_type == JobType.FILL_IMAGE_PROPERTIES:
            specifications = FillImagePropertiesSpecifications(**raw_dict)
        elif job_type == JobType.GAUSSIAN_SPLATS:
            specifications = GaussianSplatsSpecifications(**raw_dict)
        elif job_type == JobType.IMPORT_POINT_CLOUD:
            specifications = ImportPCSpecifications(**raw_dict)
        elif job_type == JobType.OBJECTS_2D:
            specifications = Objects2DSpecifications(**raw_dict)
        elif job_type == JobType.PRODUCTION:
            specifications = ProductionSpecifications(**raw_dict)
        elif job_type == JobType.RECONSTRUCTION:
            specifications = ReconstructionSpecifications(**raw_dict)
        elif job_type == JobType.SEGMENTATION_2D:
            specifications = Segmentation2DSpecifications(**raw_dict)
        elif job_type == JobType.SEGMENTATION_3D:
            specifications = Segmentation3DSpecifications(**raw_dict)
        elif job_type == JobType.SEGMENTATION_ORTHOPHOTO:
            specifications = SegmentationOrthophotoSpecifications(**raw_dict)
        elif job_type == JobType.TILING:
            specifications = TilingSpecifications(**raw_dict)
        elif job_type == JobType.TOUCH_UP_EXPORT:
            specifications = TouchUpExportSpecifications(**raw_dict)
        elif job_type == JobType.TOUCH_UP_IMPORT:
            specifications = TouchUpImportSpecifications(**raw_dict)
        elif job_type == JobType.WATER_CONSTRAINTS:
            specifications = WaterConstraintsSpecifications(**raw_dict)
        elif job_type == JobType.CLEARANCE_CALCULATION:
            specifications = ClearanceSpecifications(**raw_dict)
        else:
            raise ValueError(f"Unsupported job type: {job_type}")

        return specifications

class JobPage(BaseModel):
    jobs: list[Job]
    next_continuation_token: Optional[str] = None
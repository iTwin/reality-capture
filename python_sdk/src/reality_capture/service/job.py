import urllib.parse
from pydantic import BaseModel, Field, ValidationInfo, field_validator
from datetime import datetime
from enum import Enum
from typing import Union, Optional, Any
from reality_capture.specifications.calibration import CalibrationSpecifications, CalibrationSpecificationsCreate
from reality_capture.specifications.change_detection import (ChangeDetectionSpecifications,
                                                             ChangeDetectionSpecificationsCreate)
from reality_capture.specifications.constraints import (ConstraintsSpecificationsCreate,
                                                        ConstraintsSpecifications)
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
from reality_capture.specifications.touchup import (TouchUpImportSpecifications, TouchUpImportSpecificationsCreate,
                                                    TouchUpExportSpecifications, TouchUpExportSpecificationsCreate)
from reality_capture.specifications.water_constraints import (WaterConstraintsSpecifications,
                                                              WaterConstraintsSpecificationsCreate)
from reality_capture.specifications.training import (TrainingO2DSpecifications, TrainingO2DSpecificationsCreate,
                                                     TrainingS3DSpecificationsCreate, TrainingS3DSpecifications)
"""from reality_capture.specifications.point_cloud_conversion import (PointCloudConversionSpecificationsCreate,
                                                                   PointCloudConversionSpecifications)"""

from reality_capture.specifications.gaussian_splats import (GaussianSplatsSpecificationsCreate,
                                                            GaussianSplatsSpecifications)
from reality_capture.specifications.eval_o2d import (EvalO2DSpecificationsCreate, EvalO2DSpecifications)
from reality_capture.specifications.eval_o3d import (EvalO3DSpecificationsCreate, EvalO3DSpecifications)
from reality_capture.specifications.eval_s2d import (EvalS2DSpecificationsCreate, EvalS2DSpecifications)
from reality_capture.specifications.eval_s3d import (EvalS3DSpecificationsCreate, EvalS3DSpecifications)
from reality_capture.specifications.eval_sortho import (EvalSOrthoSpecificationsCreate, EvalSOrthoSpecifications)

from reality_capture.service.reality_data import URL

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
    TRAINING_O2D = "TrainingO2D"
    TRAINING_S3D = "TrainingS3D"
    # POINT_CLOUD_CONVERSION = "PointCloudConversion"

class Service(Enum):
    MODELING = "Modeling"
    ANALYSIS = "Analysis"
    # CONVERSION = "Conversion"


def _get_appropriate_service(jt: JobType):
    if jt in [JobType.FILL_IMAGE_PROPERTIES, JobType.IMPORT_POINT_CLOUD, JobType.CALIBRATION, JobType.TILING,
            JobType.PRODUCTION, JobType.RECONSTRUCTION, JobType.CONSTRAINTS, JobType.TOUCH_UP_EXPORT,
            JobType.TOUCH_UP_IMPORT, JobType.WATER_CONSTRAINTS, JobType.GAUSSIAN_SPLATS]:
        return Service.MODELING
    if jt in [JobType.OBJECTS_2D, JobType.SEGMENTATION_2D, JobType.SEGMENTATION_3D, JobType.SEGMENTATION_ORTHOPHOTO,
            JobType.CHANGE_DETECTION, JobType.TRAINING_O2D, JobType.EVAL_O2D, JobType.EVAL_O3D, JobType.EVAL_S2D,
            JobType.EVAL_S3D, JobType.EVAL_SORTHO, JobType.TRAINING_S3D]:
        return Service.ANALYSIS
    # return Service.CONVERSION
    raise NotImplemented("Other services not yet implemented")


class JobState(Enum):
    QUEUED = "Queued"
    ACTIVE = "Active"
    SUCCESS = "Success"
    FAILED = "Failed"
    TERMINATING_ON_CANCEL = "TerminatingOnCancel"
    TERMINATING_ON_FAILURE = "TerminatingOnFailure"
    CANCELLED = "Cancelled"


class JobCreate(BaseModel):
    name: Optional[str] = Field(None, description="Displayable job name.", min_length=3)
    type: JobType = Field(description="Type of job.")
    # TODO : PointCloudConversionSpecificationsCreate,
    specifications: Union[CalibrationSpecificationsCreate, ChangeDetectionSpecificationsCreate,
                        ConstraintsSpecificationsCreate,
                        EvalO2DSpecificationsCreate, EvalO3DSpecificationsCreate,
                        EvalS2DSpecificationsCreate, EvalS3DSpecificationsCreate,
                        EvalSOrthoSpecificationsCreate, FillImagePropertiesSpecificationsCreate,
                        GaussianSplatsSpecificationsCreate, ImportPCSpecificationsCreate,
                        Objects2DSpecificationsCreate, ProductionSpecificationsCreate,
                        ReconstructionSpecificationsCreate, Segmentation2DSpecificationsCreate,
                        Segmentation3DSpecificationsCreate, SegmentationOrthophotoSpecificationsCreate,
                        TilingSpecificationsCreate, TouchUpExportSpecificationsCreate,
                        TouchUpImportSpecificationsCreate, TrainingO2DSpecificationsCreate, 
                        TrainingS3DSpecificationsCreate, WaterConstraintsSpecificationsCreate] = (
        Field(description="Specifications aligned with the job type."))
    itwin_id: str = Field(description="iTwin ID, used by the service for finding "
                                      "input reality data and uploading output data.",
                          alias="iTwinId")

    def get_appropriate_service(self) -> Service:
        """
        Return the appropriate service for such a job.

        :return: Service enum.
        """
        return _get_appropriate_service(self.type)


class Execution(BaseModel):
    created_date_time: datetime = Field(description="Creation date time for the job.", alias="createdDateTime")
    started_date_time: Optional[datetime] = Field(None, description="Start date time for the job.", alias="startedDateTime")
    ended_date_time: Optional[datetime] = Field(None, description="End date time for the job.", alias="endedDateTime")
    processing_units: Optional[float] = Field(None, description="Processing units consumed by the job.",
                                             alias="processingUnits")


class Job(BaseModel):
    id: str = Field(description="Job unique identifier.")
    name: Optional[str] = Field(None, description="Displayable job name.", min_length=3)
    type: JobType = Field(description="Type of job.")
    itwin_id: str = Field(description="iTwin ID, used by the service for finding "
                                      "input reality data and uploading output data.",
                          alias="iTwinId")
    state: JobState = Field(description="State of the job.")
    execution_info: Execution = Field(description="Known execution information for the job.", alias="executionInfo")
    user_id: str = Field(description="Identifier of the user that created the job.", alias="userId")
    # TODO : add PointCloudConversionSpecifications
    specifications: Union[CalibrationSpecifications, ChangeDetectionSpecifications,
                        ConstraintsSpecifications, 
                        EvalO2DSpecifications, EvalO3DSpecifications,
                        EvalS2DSpecifications, EvalS3DSpecifications,
                        EvalSOrthoSpecifications, FillImagePropertiesSpecifications, 
                        GaussianSplatsSpecifications, ImportPCSpecifications,
                        Objects2DSpecifications, ProductionSpecifications,
                        ReconstructionSpecifications, Segmentation2DSpecifications,
                        Segmentation3DSpecifications, SegmentationOrthophotoSpecifications,
                        TilingSpecifications, TouchUpExportSpecifications,
                        TouchUpImportSpecifications, WaterConstraintsSpecifications,
                        TrainingO2DSpecifications, TrainingS3DSpecifications] = (
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
        elif job_type == JobType.TRAINING_O2D:
           specifications = TrainingO2DSpecifications(**raw_dict)
        elif job_type == JobType.TRAINING_S3D:
           specifications = TrainingS3DSpecifications(**raw_dict)
        else:
            raise ValueError(f"Unsupported job type: {job_type}")

        return specifications

    def get_appropriate_service(self) -> Service:
        """
        Return the appropriate service for such a job.

        :return: Service enum.
        """
        return _get_appropriate_service(self.type)


class JobResponse(BaseModel):
    job: Job = Field(description="Complete job information.")


class NextPageLink(BaseModel):
    next: URL = Field(description="URL for getting the next page of results.")


class Jobs(BaseModel):
    jobs: list[Job] = Field(description="List of jobs.")
    links: Optional[NextPageLink] = Field(default=None, alias="_links",
                                          description="Contains the hyperlink to the next page of results, "
                                                      "if applicable.")

    def get_continuation_token(self) -> Optional[str]:
        """
        Return continuation token for next query

        :return: Continuation Token value if any
        """
        if not self.links:
            return None
        parsed = urllib.parse.urlparse(self.links.next.href)
        params = urllib.parse.parse_qs(parsed.query)
        cts = params.get("continuationToken")
        if cts is None:
            return None
        return cts[0]


class Progress(BaseModel):
    state: JobState = Field(description="State of the job.")
    percentage: float = Field(ge=0, le=100, description="Progress of the job.")


class ProgressResponse(BaseModel):
    progress: Progress = Field(description="Progress information.")


class Message(BaseModel):
    code: str = Field(description="Unique identifier for an error.")
    title: str = Field(description="Title of the error.")
    message: str = Field(description="Message of the error.")
    params: list[str] = Field(description="Parameters to be placed in the message. "
                                          "Can be used for localization effort.")


class Messages(BaseModel):
    errors: list[Message] = Field(description="List of potential errors from the job execution.")
    warnings: list[Message] = Field(description="List of potential warnings from the job execution.")


class MessagesResponse(BaseModel):
    messages: Messages = Field(description="Messages.")

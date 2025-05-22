from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from enum import Enum
from typing import Union, Optional, Any
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
from reality_capture.specifications.training import (TrainingO2DSpecifications, TrainingO2DSpecificationsCreate,
    TrainingS3DSpecificationsCreate, TrainingS3DSpecifications)
from reality_capture.specifications.point_cloud_conversion import (PointCloudConversionSpecificationsCreate,
                                                                   PointCloudConversionSpecifications)


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
    TRAINING_O2D = "TrainingO2D"
    TRAINING_S3D = "TrainingS3D"
    POINT_CLOUD_CONVERSION = "PointCloudConversion"


class Service(Enum):
    MODELING = "Modeling"
    ANALYSIS = "Analysis"
    CONVERSION = "Conversion"


def _get_appropriate_service(jt: JobType):
    if jt in [JobType.FILL_IMAGE_PROPERTIES, JobType.IMPORT_POINT_CLOUD, JobType.CALIBRATION, JobType.TILING,
              JobType.PRODUCTION, JobType.RECONSTRUCTION, JobType.CONSTRAINTS, JobType.TOUCH_UP_EXPORT,
              JobType.TOUCH_UP_IMPORT, JobType.WATER_CONSTRAINTS]:
        return Service.MODELING
    if jt in [JobType.OBJECTS_2D, JobType.SEGMENTATION_2D, JobType.SEGMENTATION_3D, JobType.SEGMENTATION_ORTHOPHOTO,
              JobType.CHANGE_DETECTION, JobType.EXTRACT_GROUND, JobType.TRAINING_O2D]:
        return Service.ANALYSIS
    return Service.CONVERSION


class JobState(Enum):
    QUEUED = "Queued"
    ACTIVE = "Active"
    SUCCESS = "Success"
    FAILED = "Failed"
    TERMINATING = "Terminating"
    CANCELLED = "Cancelled"


class JobCreate(BaseModel):
    name: Optional[str] = Field(None, description="Displayable job name.", min_length=3)
    type: JobType = Field(description="Type of job.")
    specifications: Union[CalibrationSpecificationsCreate, ChangeDetectionSpecificationsCreate,
                          ConstraintsSpecificationsCreate, ExtractGroundSpecificationsCreate,
                          FillImagePropertiesSpecificationsCreate, ImportPCSpecificationsCreate,
                          Objects2DSpecificationsCreate, ProductionSpecificationsCreate,
                          ReconstructionSpecificationsCreate, Segmentation2DSpecificationsCreate,
                          Segmentation3DSpecificationsCreate, SegmentationOrthophotoSpecificationsCreate,
                          TilingSpecificationsCreate, TouchUpExportSpecificationsCreate,
                          TouchUpImportSpecifications, WaterConstraintsSpecificationsCreate, 
                          TrainingO2DSpecificationsCreate, PointCloudConversionSpecificationsCreate, 
                          TrainingS3DSpecificationsCreate] = (
        Field(description="Specifications aligned with the job type."))
    itwin_id: str = Field(description="iTwin ID, used by the service for finding "
                                      "input reality data and uploading output data.",
                          alias="iTwinId")
    bucket_id: Optional[str] = Field(None,
                                     description="Bucket id, used by the service to find and upload small job data. "
                                                 "If not specified, the service will use the default bucket.",
                                     alias="bucketId")

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
    estimated_units: Optional[float] = Field(None, description="Estimated number of units consumed by the job.",
                                             alias="estimatedUnits")


class Job(BaseModel):
    id: str = Field(description="Job unique identifier.")
    name: Optional[str] = Field(None, description="Displayable job name.", min_length=3)
    type: JobType = Field(description="Type of job.")
    itwin_id: str = Field(description="iTwin ID, used by the service for finding "
                                      "input reality data and uploading output data.",
                          alias="iTwinId")
    bucket_id: str = Field(description="Bucket id, used by the service to find and upload small job data.",
                           alias="bucketId")
    state: JobState = Field(description="State of the job.")
    execution_info: Execution = Field(description="Known execution information for the job.", alias="executionInfo")
    user_id: str = Field(description="Identifier of the user that created the job.", alias="userId")
    specifications: Union[CalibrationSpecifications, ChangeDetectionSpecifications,
                          ConstraintsSpecifications, ExtractGroundSpecifications,
                          FillImagePropertiesSpecifications, ImportPCSpecifications,
                          Objects2DSpecifications, ProductionSpecifications,
                          ReconstructionSpecifications, Segmentation2DSpecifications,
                          Segmentation3DSpecifications, SegmentationOrthophotoSpecifications,
                          TilingSpecifications, TouchUpExportSpecifications,
                          TouchUpImportSpecifications, WaterConstraintsSpecifications, 
                          TrainingO2DSpecifications, TrainingS3DSpecifications,
                          PointCloudConversionSpecifications] = (
        Field(description="Specifications aligned with the job type."))

    @model_validator(mode="before")
    @classmethod
    def validate_specifications(cls, values: Any) -> Any:
        job_type = values.get("type")
        if isinstance(job_type, str):
            job_type = JobType(job_type)
        specs = values.get("specifications")
        if job_type == JobType.CALIBRATION:
            values["specifications"] = CalibrationSpecifications(**specs)
        elif job_type == JobType.CHANGE_DETECTION:
            values["specifications"] = ChangeDetectionSpecifications(**specs)
        elif job_type == JobType.CONSTRAINTS:
            values["specifications"] = ConstraintsSpecifications(**specs)
        elif job_type == JobType.EXTRACT_GROUND:
            values["specifications"] = ExtractGroundSpecifications(**specs)
        elif job_type == JobType.FILL_IMAGE_PROPERTIES:
            values["specifications"] = FillImagePropertiesSpecifications(**specs)
        elif job_type == JobType.IMPORT_POINT_CLOUD:
            values["specifications"] = ImportPCSpecifications(**specs)
        elif job_type == JobType.OBJECTS_2D:
            values["specifications"] = Objects2DSpecifications(**specs)
        elif job_type == JobType.PRODUCTION:
            values["specifications"] = ProductionSpecifications(**specs)
        elif job_type == JobType.RECONSTRUCTION:
            values["specifications"] = ReconstructionSpecifications(**specs)
        elif job_type == JobType.SEGMENTATION_2D:
            values["specifications"] = Segmentation2DSpecifications(**specs)
        elif job_type == JobType.SEGMENTATION_3D:
            values["specifications"] = Segmentation3DSpecifications(**specs)
        elif job_type == JobType.SEGMENTATION_ORTHOPHOTO:
            values["specifications"] = SegmentationOrthophotoSpecifications(**specs)
        elif job_type == JobType.TILING:
            values["specifications"] = TilingSpecifications(**specs)
        elif job_type == JobType.TOUCH_UP_EXPORT:
            values["specifications"] = TouchUpExportSpecifications(**specs)
        elif job_type == JobType.TOUCH_UP_IMPORT:
            values["specifications"] = TouchUpImportSpecifications(**specs)
        elif job_type == JobType.WATER_CONSTRAINTS:
            values["specifications"] = WaterConstraintsSpecifications(**specs)
        elif job_type == JobType.TRAINING_O2D:
            values["specifications"] = TrainingO2DSpecifications(**specs)
        elif job_type == JobType.TRAINING_S3D:
            values["specifications"] = TrainingS3DSpecifications(**specs)
        elif job_type == JobType.POINT_CLOUD_CONVERSION:
            values["specifications"] = PointCloudConversionSpecifications(**specs)
        else:
            raise ValueError(f"Unsupported job type: {job_type}")
        return values

    def get_appropriate_service(self) -> Service:
        """
        Return the appropriate service for such a job.

        :return: Service enum.
        """
        return _get_appropriate_service(self.type)


class JobResponse(BaseModel):
    job: Job = Field(description="Complete job information.")


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

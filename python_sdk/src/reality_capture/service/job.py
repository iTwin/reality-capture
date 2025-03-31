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
from reality_capture.specifications.training import TrainingO2DSpecifications, TrainingO2DSpecificationsCreate
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
    EVAL_O2D = "EvalO2D"
    EVAL_O3D = "EvalO3D"
    EVAL_S2D = "EvalS2D"
    EVAL_S3D = "EvalS3D"
    EVAL_SORTHO = "EvalSOrtho"
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
    CANCELLED = "Cancelled"


class JobCreate(BaseModel):
    name: Optional[str] = Field(None, description="Displayable job name.", min_length=2)
    type: JobType = Field(description="Type of job.")
    specifications: Union[CalibrationSpecificationsCreate, ChangeDetectionSpecificationsCreate,
                          ConstraintsSpecificationsCreate, ExtractGroundSpecificationsCreate,
                          FillImagePropertiesSpecificationsCreate, ImportPCSpecificationsCreate,
                          Objects2DSpecificationsCreate, ProductionSpecificationsCreate,
                          ReconstructionSpecificationsCreate, Segmentation2DSpecificationsCreate,
                          Segmentation3DSpecificationsCreate, SegmentationOrthophotoSpecificationsCreate,
                          TilingSpecificationsCreate, TouchUpExportSpecificationsCreate,
                          TouchUpImportSpecifications, WaterConstraintsSpecificationsCreate, 
                          TrainingO2DSpecificationsCreate, PointCloudConversionSpecificationsCreate] = (
        Field(description="Specifications aligned with the job type."))
    itwin: str = Field(description="iTwin ID, used by the service for finding "
                                   "input reality data and uploading output data.")

    def get_appropriate_service(self) -> Service:
        """
        Return the appropriate service for such a job.

        :return: Service enum.
        """
        return _get_appropriate_service(self.type)


class Execution(BaseModel):
    creation_date_time: datetime = Field(description="Creation date time for the job.", alias="creationDateTime")
    start_date_time: Optional[datetime] = Field(description="Start date time for the job.", alias="startDateTime")
    end_date_time: Optional[datetime] = Field(description="End date time for the job.", alias="endDateTime")
    estimated_units: Optional[float] = Field(description="Estimated number of units consumed by the job.",
                                             alias="estimatedUnits")


class Job(BaseModel):
    id: str = Field(description="Job unique identifier.")
    name: Optional[str] = Field(None, description="Displayable job name.", min_length=2)
    type: JobType = Field(description="Type of job.")
    itwin: str = Field(description="iTwin ID, used by the service for finding "
                                   "input reality data and uploading output data.")
    state: JobState = Field(description="State of the job.")
    execution: Execution = Field(description="Known execution information for the job.")
    user: str = Field(description="Identifier of the user that created the job.")
    specifications: Union[CalibrationSpecifications, ChangeDetectionSpecifications,
                          ConstraintsSpecifications, ExtractGroundSpecifications,
                          FillImagePropertiesSpecifications, ImportPCSpecifications,
                          Objects2DSpecifications, ProductionSpecifications,
                          ReconstructionSpecifications, Segmentation2DSpecifications,
                          Segmentation3DSpecifications, SegmentationOrthophotoSpecifications,
                          TilingSpecifications, TouchUpExportSpecifications,
                          TouchUpImportSpecifications, WaterConstraintsSpecifications, 
                          TrainingO2DSpecifications, PointCloudConversionSpecifications] = (
        Field(description="Specifications aligned with the job type."))

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

from pydantic import BaseModel, Field
from reality_capture.service.job import JobType
from typing import Union
from enum import Enum
from reality_capture.specifications.calibration import CalibrationSpecificationsCreate, CalibrationCost
from reality_capture.specifications.change_detection import ChangeDetectionSpecificationsCreate
from reality_capture.specifications.constraints import ConstraintsSpecificationsCreate, ConstraintsCost
from reality_capture.specifications.extract_ground import ExtractGroundSpecificationsCreate
from reality_capture.specifications.fill_image_properties import (FillImagePropertiesSpecificationsCreate,
                                                                  FillImagePropertiesCost)
from reality_capture.specifications.import_point_cloud import ImportPCSpecificationsCreate, ImportPCCost
from reality_capture.specifications.objects2d import Objects2DSpecificationsCreate
from reality_capture.specifications.production import ProductionSpecificationsCreate, ProductionCost
from reality_capture.specifications.reconstruction import ReconstructionSpecificationsCreate, ReconstructionCost
from reality_capture.specifications.segmentation2d import Segmentation2DSpecificationsCreate
from reality_capture.specifications.segmentation3d import Segmentation3DSpecificationsCreate
from reality_capture.specifications.segmentation_orthophoto import SegmentationOrthophotoSpecificationsCreate
from reality_capture.specifications.tiling import TilingSpecificationsCreate, TilingCost
from reality_capture.specifications.touchup import (TouchUpImportSpecifications, TouchUpExportSpecificationsCreate,
                                                    TouchUpExportCost, TouchUpImportCost)
from reality_capture.specifications.water_constraints import WaterConstraintsSpecificationsCreate, WaterConstraintsCost


class EstimationCreate(BaseModel):
    job_type: JobType = Field(description="Type of job.")
    specifications: Union[CalibrationSpecificationsCreate, ChangeDetectionSpecificationsCreate,
                          ConstraintsSpecificationsCreate, ExtractGroundSpecificationsCreate,
                          FillImagePropertiesSpecificationsCreate, ImportPCSpecificationsCreate,
                          Objects2DSpecificationsCreate, ProductionSpecificationsCreate,
                          ReconstructionSpecificationsCreate, Segmentation2DSpecificationsCreate,
                          Segmentation3DSpecificationsCreate, SegmentationOrthophotoSpecificationsCreate,
                          TilingSpecificationsCreate, TouchUpExportSpecificationsCreate,
                          TouchUpImportSpecifications, WaterConstraintsSpecificationsCreate] = (
        Field(description="Specifications aligned with the job type."))
    cost_parameters: Union[CalibrationCost, ConstraintsCost, FillImagePropertiesCost,
                           ImportPCCost, ProductionCost, ReconstructionCost, TilingCost,
                           TouchUpExportCost, TouchUpImportCost, WaterConstraintsCost] = (
        Field(description="Size format aligned with the job type."))


class UnitType(Enum):
    MODELING = "Modeling"
    ANALYSIS = "Analysis"
    CONVERSION = "Conversion"


class Estimation(EstimationCreate):
    unique_id: str = Field(description="Estimation id", alias="id")
    estimated_units: float = Field(description="Estimated number of units that the job will cost.",
                                   alias="estimatedUnits")
    unit_type: UnitType = Field(description="Type of unit for the job.", alias="unitType")

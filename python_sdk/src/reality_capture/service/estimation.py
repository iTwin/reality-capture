from pydantic import BaseModel, Field
from reality_capture.service.job import JobType, _get_appropriate_service, Service
from typing import Union
from enum import Enum
from reality_capture.specifications.calibration import CalibrationSpecificationsCreate, CalibrationCost
from reality_capture.specifications.change_detection import ChangeDetectionSpecificationsCreate
from reality_capture.specifications.constraints import ConstraintsSpecificationsCreate, ConstraintsCost
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
from reality_capture.specifications.touchup import (TouchUpImportSpecificationsCreate,
                                                    TouchUpExportSpecificationsCreate,
                                                    TouchUpExportCost, TouchUpImportCost)
from reality_capture.specifications.water_constraints import WaterConstraintsSpecificationsCreate, WaterConstraintsCost


class CostEstimationCreate(BaseModel):
    type: JobType = Field(description="Type of job.")
    specifications: Union[CalibrationSpecificationsCreate, ChangeDetectionSpecificationsCreate,
                          ConstraintsSpecificationsCreate,
                          FillImagePropertiesSpecificationsCreate, ImportPCSpecificationsCreate,
                          Objects2DSpecificationsCreate, ProductionSpecificationsCreate,
                          ReconstructionSpecificationsCreate, Segmentation2DSpecificationsCreate,
                          Segmentation3DSpecificationsCreate, SegmentationOrthophotoSpecificationsCreate,
                          TilingSpecificationsCreate, TouchUpExportSpecificationsCreate,
                          TouchUpImportSpecificationsCreate, WaterConstraintsSpecificationsCreate] = (
        Field(description="Specifications aligned with the job type."))
    cost_parameters: Union[CalibrationCost, ConstraintsCost, FillImagePropertiesCost,
                           ImportPCCost, ProductionCost, ReconstructionCost, TilingCost,
                           TouchUpExportCost, TouchUpImportCost, WaterConstraintsCost] = (
        Field(description="Cost format aligned with the job type.", alias="costParameters"))

    def get_appropriate_service(self) -> Service:
        """
        Return the appropriate service for such a job.

        :return: Service enum.
        """
        return _get_appropriate_service(self.type)


class UnitType(Enum):
    MODELING = "Modeling"
    ANALYSIS = "Analysis"
    CONVERSION = "Conversion"


class CostEstimation(CostEstimationCreate):
    unique_id: str = Field(description="Estimation id", alias="id")
    estimated_units: float = Field(description="Estimated number of units that the job will cost.",
                                   alias="estimatedUnits")
    unit_type: UnitType = Field(description="Type of unit for the job.", alias="unitType")

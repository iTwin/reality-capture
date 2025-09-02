import { z } from "zod";
import { JobType, getAppropriateService, Service } from "../job";
import { CalibrationSpecificationsCreate, CalibrationCost } from "../../specifications/calibration";
import { ChangeDetectionSpecificationsCreate } from "../../specifications/change_detection";
import { ConstraintsSpecificationsCreate, ConstraintsCost } from "../../specifications/constraints";
import { FillImagePropertiesSpecificationsCreate, FillImagePropertiesCost } from "../../specifications/fill_image_properties";
import { ImportPCSpecificationsCreate, ImportPCCost } from "../../specifications/import_point_cloud";
import { Objects2DSpecificationsCreate } from "../../specifications/objects2d";
import { ProductionSpecificationsCreate, ProductionCost } from "../../specifications/production";
import { ReconstructionSpecificationsCreate, ReconstructionCost } from "../../specifications/reconstruction";
import { Segmentation2DSpecificationsCreate } from "../../specifications/segmentation2d";
import { Segmentation3DSpecificationsCreate } from "../../specifications/segmentation3d";
import { SegmentationOrthophotoSpecificationsCreate } from "../../specifications/segmentation_orthophoto";
import { TilingSpecificationsCreate, TilingCost } from "../../specifications/tiling";
import { TouchUpImportSpecificationsCreate, TouchUpExportSpecificationsCreate, TouchUpExportCost, TouchUpImportCost } from "../../specifications/touchup";
import { WaterConstraintsSpecificationsCreate, WaterConstraintsCost } from "../../specifications/water_constraints";

export const CostEstimationCreateSchema = z.object({
  type: JobType.describe("Type of job."),
  specifications: z.union([
    CalibrationSpecificationsCreate,
    ChangeDetectionSpecificationsCreate,
    ConstraintsSpecificationsCreate,
    FillImagePropertiesSpecificationsCreate,
    ImportPCSpecificationsCreate,
    Objects2DSpecificationsCreate,
    ProductionSpecificationsCreate,
    ReconstructionSpecificationsCreate,
    Segmentation2DSpecificationsCreate,
    Segmentation3DSpecificationsCreate,
    SegmentationOrthophotoSpecificationsCreate,
    TilingSpecificationsCreate,
    TouchUpExportSpecificationsCreate,
    TouchUpImportSpecificationsCreate,
    WaterConstraintsSpecificationsCreate,
  ]).describe("Specifications aligned with the job type."),
  costParameters: z.union([
    CalibrationCost,
    ConstraintsCost,
    FillImagePropertiesCost,
    ImportPCCost,
    ProductionCost,
    ReconstructionCost,
    TilingCost,
    TouchUpExportCost,
    TouchUpImportCost,
    WaterConstraintsCost,
  ]).describe("Cost format aligned with the job type.")
});
export type CostEstimationCreate = z.infer<typeof CostEstimationCreateSchema>;

export function getAppropriateServiceForEstimation(estimation: CostEstimationCreate): Service {
  return getAppropriateService(estimation.type);
}

export enum UnitType {
  MODELING = "Modeling",
  ANALYSIS = "Analysis",
  CONVERION = "Conversion",
}

export const CostEstimationSchema = CostEstimationCreateSchema.extend({
  id: z.string().describe("Estimation id"),
  estimatedUnits: z.number().describe("Estimated number of units that the job will cost."),
  unitType: z.nativeEnum(UnitType).describe("Type of unit for the job."),
});

export type CostEstimation = z.infer<typeof CostEstimationSchema>;
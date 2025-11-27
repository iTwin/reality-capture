import { z } from "zod";
import { JobType, getAppropriateService, Service } from "./job";
import { CalibrationSpecificationsCreateSchema, CalibrationCostSchema } from "../specifications/calibration";
import { ChangeDetectionSpecificationsCreateSchema } from "../specifications/change_detection";
import { ConstraintsSpecificationsCreateSchema, ConstraintsCostSchema } from "../specifications/constraints";
import { FillImagePropertiesSpecificationsCreateSchema, FillImagePropertiesCostSchema } from "../specifications/fill_image_properties";
import { ImportPCSpecificationsCreateSchema, ImportPCCostSchema } from "../specifications/import_point_cloud";
import { Objects2DSpecificationsCreateSchema } from "../specifications/objects2d";
import { ProductionSpecificationsCreateSchema, ProductionCostSchema } from "../specifications/production";
import { ReconstructionSpecificationsCreateSchema, ReconstructionCostSchema } from "../specifications/reconstruction";
import { Segmentation2DSpecificationsCreateSchema } from "../specifications/segmentation2d";
import { Segmentation3DSpecificationsCreateSchema } from "../specifications/segmentation3d";
import { SegmentationOrthophotoSpecificationsCreateSchema } from "../specifications/segmentation_orthophoto";
import { TilingSpecificationsCreateSchema, TilingCostSchema } from "../specifications/tiling";
import { TouchUpImportSpecificationsCreateSchema, TouchUpExportSpecificationsCreateSchema, TouchUpExportCostSchema, TouchUpImportCostSchema } from "../specifications/touchup";
import { WaterConstraintsSpecificationsCreateSchema, WaterConstraintsCostSchema } from "../specifications/water_constraints";

export const CostEstimationCreateSchema = z.object({
  type: z.nativeEnum(JobType).describe("Type of job."),
  specifications: z.union([
    CalibrationSpecificationsCreateSchema,
    ChangeDetectionSpecificationsCreateSchema,
    ConstraintsSpecificationsCreateSchema,
    FillImagePropertiesSpecificationsCreateSchema,
    ImportPCSpecificationsCreateSchema,
    Objects2DSpecificationsCreateSchema,
    ProductionSpecificationsCreateSchema,
    ReconstructionSpecificationsCreateSchema,
    Segmentation2DSpecificationsCreateSchema,
    Segmentation3DSpecificationsCreateSchema,
    SegmentationOrthophotoSpecificationsCreateSchema,
    TilingSpecificationsCreateSchema,
    TouchUpExportSpecificationsCreateSchema,
    TouchUpImportSpecificationsCreateSchema,
    WaterConstraintsSpecificationsCreateSchema,
  ]).describe("Specifications aligned with the job type."),
  costParameters: z.union([
    CalibrationCostSchema,
    ConstraintsCostSchema,
    FillImagePropertiesCostSchema,
    ImportPCCostSchema,
    ProductionCostSchema,
    ReconstructionCostSchema,
    TilingCostSchema,
    TouchUpExportCostSchema,
    TouchUpImportCostSchema,
    WaterConstraintsCostSchema,
  ]).describe("Cost format aligned with the job type.")
});
export type CostEstimationCreate = z.infer<typeof CostEstimationCreateSchema>;

export function getAppropriateServiceForEstimation(estimation: CostEstimationCreate): Service {
  return getAppropriateService(estimation.type);
}

export enum UnitType {
  MODELING = "Modeling",
  ANALYSIS = "Analysis",
  //CONVERION = "Conversion",
}

export const CostEstimationSchema = CostEstimationCreateSchema.extend({
  id: z.string().describe("Estimation id"),
  estimatedUnits: z.number().describe("Estimated number of processing units that the job will cost."),
  unitType: z.nativeEnum(UnitType).describe("Type of unit for the job."),
});
export type CostEstimation = z.infer<typeof CostEstimationSchema>;
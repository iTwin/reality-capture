import { z } from "zod";

import { CalibrationSpecificationsCreateSchema, CalibrationSpecificationsSchema } from "../specifications/calibration";
//import { ChangeDetectionSpecificationsCreateSchema, ChangeDetectionSpecificationsSchema } from '../specifications/change_detection';
import { ConstraintsSpecificationsCreateSchema, ConstraintsSpecificationsSchema } from "../specifications/constraints";
import { FillImagePropertiesSpecificationsCreateSchema, FillImagePropertiesSpecificationsSchema } from "../specifications/fill_image_properties";
import { ImportPCSpecificationsCreateSchema, ImportPCSpecificationsSchema } from "../specifications/import_point_cloud";
//import { Objects2DSpecificationsCreateSchema, Objects2DSpecificationsSchema } from '../specifications/objects2d';
import { ProductionSpecificationsCreateSchema, ProductionSpecificationsSchema } from "../specifications/production";
import { ReconstructionSpecificationsCreateSchema, ReconstructionSpecificationsSchema } from "../specifications/reconstruction";
//import { Segmentation2DSpecificationsCreateSchema, Segmentation2DSpecificationsSchema } from '../specifications/segmentation2d';
//import { Segmentation3DSpecificationsCreateSchema, Segmentation3DSpecificationsSchema } from '../specifications/segmentation3d';
//import { SegmentationOrthophotoSpecificationsCreateSchema, SegmentationOrthophotoSpecificationsSchema } from '../specifications/segmentation_orthophoto';
import { TilingSpecificationsCreateSchema, TilingSpecificationsSchema } from "../specifications/tiling";
import { TouchUpExportSpecificationsCreateSchema, TouchUpImportSpecificationsCreateSchema, TouchUpExportSpecificationsSchema, TouchUpImportSpecificationsSchema } from "../specifications/touchup";
import { WaterConstraintsSpecificationsCreateSchema, WaterConstraintsSpecificationsSchema } from "../specifications/water_constraints";
//import { TrainingO2DSpecificationsCreateSchema, TrainingS3DSpecificationsCreateSchema, TrainingO2DSpecificationsSchema, TrainingS3DSpecificationsSchema } from '../specifications/training';
//import { PointCloudConversionSpecificationsCreateSchema, PointCloudConversionSpecificationsSchema } from '../specifications/point_cloud_conversion';
import { GaussianSplatsSpecificationsCreateSchema, GaussianSplatsSpecificationsSchema } from "../specifications/gaussian_splats";
import { URLSchema } from "./bucket";
//import { EvalO2DSpecificationsCreateSchema, EvalO2DSpecificationsSchema } from '../specifications/eval_o2d';
//import { EvalO3DSpecificationsCreateSchema, EvalO3DSpecificationsSchema } from '../specifications/eval_o3d';
//import { EvalS2DSpecificationsCreateSchema, EvalS2DSpecificationsSchema } from '../specifications/eval_s2d';
//import { EvalS3DSpecificationsCreateSchema, EvalS3DSpecificationsSchema } from '../specifications/eval_s3d';
//import { EvalSOrthoSpecificationsCreateSchema, EvalSOrthoSpecificationsSchema  } from '../specifications/eval_sortho';


export enum JobType {
  CALIBRATION = "Calibration",
  //CHANGE_DETECTION = "ChangeDetection",
  CONSTRAINTS = "Constraints",
  FILL_IMAGE_PROPERTIES = "FillImageProperties",
  IMPORT_POINT_CLOUD = "ImportPointCloud",
  //OBJECTS_2D = "Objects2D",
  PRODUCTION = "Production",
  RECONSTRUCTION = "Reconstruction",
  //SEGMENTATION_2D = "Segmentation2D",
  //SEGMENTATION_3D = "Segmentation3D",
  //SEGMENTATION_ORTHOPHOTO = "SegmentationOrthophoto",
  TILING = "Tiling",
  TOUCH_UP_IMPORT = "TouchUpImport",
  TOUCH_UP_EXPORT = "TouchUpExport",
  WATER_CONSTRAINTS = "WaterConstraints",
  //TRAINING_O2D = "TrainingO2D",
  //TRAINING_S3D = "TrainingS3D",
  //EVAL_O2D = "EvalO2D",
  //EVAL_O3D = "EvalO3D",
  //EVAL_S2D = "EvalS2D",
  //EVAL_S3D = "EvalS3D",
  //EVAL_SORTHO = "EvalSOrtho",
  //POINT_CLOUD_CONVERSION = "PointCloudConversion",
  GAUSSIAN_SPLATS = "GaussianSplats"
}

export enum Service {
  MODELING = "Modeling",
  ANALYSIS = "Analysis",
  CONVERSION = "Conversion"
}

export function getAppropriateService(jt: JobType): Service {
  if ([
    JobType.FILL_IMAGE_PROPERTIES,
    JobType.IMPORT_POINT_CLOUD,
    JobType.CALIBRATION,
    JobType.TILING,
    JobType.PRODUCTION,
    JobType.RECONSTRUCTION,
    JobType.CONSTRAINTS,
    JobType.TOUCH_UP_EXPORT,
    JobType.TOUCH_UP_IMPORT,
    JobType.WATER_CONSTRAINTS,
    JobType.GAUSSIAN_SPLATS
  ].includes(jt)) {
    return Service.MODELING;
  }
  /*if ([
  JobType.OBJECTS_2D,
  JobType.SEGMENTATION_2D,
  JobType.SEGMENTATION_3D,
  JobType.SEGMENTATION_ORTHOPHOTO,
  JobType.CHANGE_DETECTION,
  JobType.TRAINING_O2D,
  JobType.EVAL_O2D,
  JobType.EVAL_O3D,
  JobType.EVAL_S2D,
  JobType.EVAL_S3D,
  JobType.EVAL_SORTHO
].includes(jt)) {
  return Service.ANALYSIS;
}
return Service.CONVERSION;*/
  throw new Error("Other job types are not implemented yet");
}

export enum JobState {
  QUEUED = "Queued",
  ACTIVE = "Active",
  SUCCESS = "Success",
  FAILED = "Failed",
  TERMINATING_ON_CANCEL = "TerminatingOnCancel",
  TERMINATING_ON_FAILURE = "TerminatingOnFailure",
  CANCELLED = "Cancelled"
}

export const JobCreateSchema = z.object({
  name: z.string().min(3).optional().describe("Displayable job name."),
  type: z.nativeEnum(JobType).describe("Type of job."),
  specifications: z.union([
    CalibrationSpecificationsCreateSchema,
    //ChangeDetectionSpecificationsCreateSchema,
    ConstraintsSpecificationsCreateSchema,
    FillImagePropertiesSpecificationsCreateSchema,
    ImportPCSpecificationsCreateSchema,
    //Objects2DSpecificationsCreateSchema,
    ProductionSpecificationsCreateSchema,
    ReconstructionSpecificationsCreateSchema,
    //Segmentation2DSpecificationsCreateSchema,
    //Segmentation3DSpecificationsCreateSchema,
    //SegmentationOrthophotoSpecificationsCreateSchema,
    TilingSpecificationsCreateSchema,
    TouchUpExportSpecificationsCreateSchema,
    TouchUpImportSpecificationsCreateSchema,
    WaterConstraintsSpecificationsCreateSchema,
    //TrainingO2DSpecificationsCreateSchema,
    //PointCloudConversionSpecificationsCreateSchema,
    //TrainingS3DSpecificationsCreateSchema,
    GaussianSplatsSpecificationsCreateSchema,
    //EvalO2DSpecificationsCreateSchema,
    //EvalO3DSpecificationsCreateSchema,
    //EvalS2DSpecificationsCreateSchema,
    //EvalS3DSpecificationsCreateSchema,
    //EvalSOrthoSpecificationsCreateSchema
  ]).describe("Specifications aligned with the job type."),
  iTwinId: z.string().describe("iTwin ID, used by the service for finding input reality data and uploading output data."),
});
export type JobCreate = z.infer<typeof JobCreateSchema>;

export const ExecutionSchema = z.object({
  createdDateTime: z.coerce.date().describe("Creation date time for the job."),
  startedDateTime: z.coerce.date().nullable().optional().describe("Start date time for the job."),
  endedDateTime: z.coerce.date().nullable().optional().describe("End date time for the job."),
  processingUnits: z.number().nullable().optional().describe("Processing units consumed by the job."),
});
export type Execution = z.infer<typeof ExecutionSchema>;

const CommonFields = {
  id: z.string().describe("Job unique identifier."),
  name: z.string().min(3).optional().describe("Displayable job name."),
  itwinId: z.string().describe("iTwin ID, used by the service for finding input reality data and uploading output data."),
  state: z.nativeEnum(JobState).describe("State of the job."),
  executionInfo: ExecutionSchema.describe("Known execution information for the job."),
  userId: z.string().describe("Identifier of the user that created the job."),
};

export const JobSchema = z.discriminatedUnion("type", [
  z.object({
    ...CommonFields,
    type: z.literal("Calibration"),
    specifications: CalibrationSpecificationsSchema,
  }),
  /*z.object({
  ...CommonFields,
  type: z.literal("ChangeDetection"),
  specifications: ChangeDetectionSpecificationsSchema,
}),*/
  z.object({
    ...CommonFields,
    type: z.literal("Constraints"),
    specifications: ConstraintsSpecificationsSchema,
  }),
  z.object({
    ...CommonFields,
    type: z.literal("FillImageProperties"),
    specifications: FillImagePropertiesSpecificationsSchema,
  }),
  z.object({
    ...CommonFields,
    type: z.literal("ImportPointCloud"),
    specifications: ImportPCSpecificationsSchema,
  }),
  /*z.object({
  ...CommonFields,
  type: z.literal("Objects2D"),
  specifications: Objects2DSpecificationsSchema,
}),*/
  z.object({
    ...CommonFields,
    type: z.literal("Production"),
    specifications: ProductionSpecificationsSchema,
  }),
  z.object({
    ...CommonFields,
    type: z.literal("Reconstruction"),
    specifications: ReconstructionSpecificationsSchema,
  }),
  /*z.object({
  ...CommonFields,
  type: z.literal("Segmentation2D"),
  specifications: Segmentation2DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("Segmentation3D"),
  specifications: Segmentation3DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("SegmentationOrthophoto"),
  specifications: SegmentationOrthophotoSpecificationsSchema,
}),*/
  z.object({
    ...CommonFields,
    type: z.literal("Tiling"),
    specifications: TilingSpecificationsSchema,
  }),
  z.object({
    ...CommonFields,
    type: z.literal("TouchUpExport"),
    specifications: TouchUpExportSpecificationsSchema,
  }),
  z.object({
    ...CommonFields,
    type: z.literal("TouchUpImport"),
    specifications: TouchUpImportSpecificationsSchema,
  }),
  z.object({
    ...CommonFields,
    type: z.literal("WaterConstraints"),
    specifications: WaterConstraintsSpecificationsSchema,
  }),
  /*z.object({
  ...CommonFields,
  type: z.literal("TrainingO2D"),
  specifications: TrainingO2DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("TrainingS3D"),
  specifications: TrainingS3DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("PointCloudConversion"),
  specifications: PointCloudConversionSpecificationsSchema,
}),*/
  z.object({
    ...CommonFields,
    type: z.literal("GaussianSplats"),
    specifications: GaussianSplatsSpecificationsSchema,
  }),
  /*z.object({
  ...CommonFields,
  type: z.literal("EvalO2D"),
  specifications: EvalO2DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("EvalO3D"),
  specifications: EvalO3DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("EvalS2D"),
  specifications: EvalS2DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("EvalS3D"),
  specifications: EvalS3DSpecificationsSchema,
}),
z.object({
  ...CommonFields,
  type: z.literal("EvalSOrtho"),
  specifications: EvalSOrthoSpecificationsSchema,
}),*/
]);
export type Job = z.infer<typeof JobSchema>;

export const NextLinkSchema = z.object({
  next: URLSchema.describe("URL for getting the next page of results.")
});
export type NextLink = z.infer<typeof NextLinkSchema>;

export const JobsSchema = z.object({
  jobs: z.array(JobSchema).describe("List of jobs."),
  _links: NextLinkSchema.describe("Contains the hyperlink to the next page of results, if applicable."),
});
export type Jobs = z.infer<typeof JobsSchema>;

export const JobResponseSchema = z.object({
  job: JobSchema.describe("Complete job information."),
});
export type JobResponse = z.infer<typeof JobResponseSchema>;

export const ProgressSchema = z.object({
  state: z.nativeEnum(JobState).describe("State of the job."),
  percentage: z.number().min(0).max(100).describe("Progress of the job."),
});
export type Progress = z.infer<typeof ProgressSchema>;

export const ProgressResponseSchema = z.object({
  progress: ProgressSchema.describe("Progress information."),
});
export type ProgressResponse = z.infer<typeof ProgressResponseSchema>;

export const MessageSchema = z.object({
  code: z.string().describe("Unique identifier for an error."),
  title: z.string().describe("Title of the error."),
  message: z.string().describe("Message of the error."),
  params: z.array(z.string()).describe("Parameters to be placed in the message. Can be used for localization effort."),
});
export type Message = z.infer<typeof MessageSchema>;

export const MessagesSchema = z.object({
  errors: z.array(MessageSchema).describe("List of potential errors from the job execution."),
  warnings: z.array(MessageSchema).describe("List of potential warnings from the job execution."),
});
export type Messages = z.infer<typeof MessagesSchema>;

export const MessagesResponseSchema = z.object({
  messages: MessagesSchema.describe("Messages."),
});
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;
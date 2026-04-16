import { z } from "zod";

export const VolumeInputsSchema = z.object({
  model3d: z.string().describe("Reality data id of a point cloud."),
  regionOfInterest: z.string().regex(/^bkt:.+/).describe("Path in the bucket to region of interest for volume computation."),
});
export type VolumeInputs = z.infer<typeof VolumeInputsSchema>;

export const VolumeOutputsSchema = z.object({
  volume: z.string().regex(/^bkt:.+/).describe("Path in the bucket to volume information.").optional(),
});
export type VolumeOutputs = z.infer<typeof VolumeOutputsSchema>;

export enum VolumeOutputsCreate {
  VOLUME = "volume",
}

export const VolumeSpecificationsCreateSchema = z.object({
  inputs: VolumeInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(VolumeOutputsCreate)).describe("Outputs"),
});
export type VolumeSpecificationsCreate = z.infer<typeof VolumeSpecificationsCreateSchema>;

export const VolumeSpecificationsSchema = z.object({
  inputs: VolumeInputsSchema.describe("Inputs"),
  outputs: VolumeOutputsSchema.describe("Outputs"),
});
export type VolumeSpecifications = z.infer<typeof VolumeSpecificationsSchema>;

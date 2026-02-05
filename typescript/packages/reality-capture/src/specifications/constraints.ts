import { z } from "zod";

export enum ConstraintType {
  MESH = "Mesh",
  POLYGON = "Polygon",
}

export const ConstraintToAddSchema = z.object({
  constraintPath: z.string().regex(/^bkt:.+/, {
    message: "Path in the bucket to the constraint file must start with 'bkt:'",
  }),
  crs: z.string().describe("Coordinate reference system"),
  type: z.nativeEnum(ConstraintType).optional().describe("Type of the constraint"),
  resolution: z.number().optional().describe("Resolution of the constraint"),
  texturePath: z.string().regex(/^bkt:.+/, {
    message: "Path in the bucket to the texture file must start with 'bkt:'",
  }).optional(),
  textureSize: z.number().int().optional().describe("Size of the texture"),
  fillColor: z.string().optional().describe("Fill color for the constraint"),
  name: z.string().optional().describe("Name of the constraint"),
  description: z.string().optional().describe("Description of the constraint"),
});
export type ConstraintToAdd = z.infer<typeof ConstraintToAddSchema>;

export const ConstraintInfoSchema = ConstraintToAddSchema.extend({
  id: z.string().uuid().describe("Constraint unique id"),
  surfaces: z.array(z.string()).describe("List of meshes"),
  crsSurfaces: z.string().describe("Coordinate Reference System of surfaces"),
});
export type ConstraintInfo = z.infer<typeof ConstraintInfoSchema>;

export const ConstraintsInfoSchema = z.object({
  constraints: z.array(ConstraintInfoSchema).describe("Constraints information"),
});
export type ConstraintsInfo = z.infer<typeof ConstraintsInfoSchema>;

export const ConstraintsInputsSchema = z.object({
  modelingReference: z.string().describe("Modeling reference to update."),
  constraintsToDelete: z.array(z.string().uuid()).optional().describe("IDs of constraints to delete"),
  constraintsToAdd: z.array(ConstraintToAddSchema).optional().describe("Constraints to add"),
  crsData: z.string().regex(/^bkt:.+/).optional().describe("Path in the bucket for CRS data."),
});
export type ConstraintsInputs = z.infer<typeof ConstraintsInputsSchema>;

export const ConstraintsOutputsSchema = z.object({
  addedConstraintsInfo: z.string().regex(/^bkt:.+/, {
    message: "Path in the bucket for added ConstraintsInfo must start with 'bkt:'",
  }).describe("Path in the bucket for added ConstraintsInfo"),
});
export type ConstraintsOutputs = z.infer<typeof ConstraintsOutputsSchema>;

export enum ConstraintsOutputsCreate {
  ADDED_CONSTRAINTS_INFO = "addedConstraintsInfo",
}

export const ConstraintsSpecificationsSchema = z.object({
  inputs: ConstraintsInputsSchema.describe("Inputs"),
  outputs: ConstraintsOutputsSchema.describe("Outputs"),
});
export type ConstraintsSpecifications = z.infer<typeof ConstraintsSpecificationsSchema>;

export const ConstraintsSpecificationsCreateSchema = z.object({
  inputs: ConstraintsInputsSchema.describe("Inputs"),
  outputs: z.array(z.nativeEnum(ConstraintsOutputsCreate)).describe("Outputs"),
});
export type ConstraintsSpecificationsCreate = z.infer<typeof ConstraintsSpecificationsCreateSchema>;

export const ConstraintsCostSchema = z.object({
  surface: z.number().min(0, "Surface must be >= 0").describe("Surface in squared meters of the constraints to add"),
});
export type ConstraintsCost = z.infer<typeof ConstraintsCostSchema>;
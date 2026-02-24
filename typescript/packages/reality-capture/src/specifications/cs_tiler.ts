import { z } from "zod";

export const CSTilerInputsSchema = z.object({
  scene: z.string().describe("ContextScene reality data id to tile"),
});
export type CSTilerInputs = z.infer<typeof CSTilerInputsSchema>;

export enum CSObject {
  CAMERAS = "Cameras",
  TIE_POINTS = "TiePoints",
  ANNOTATIONS = "Annotations",
}

export const CSTilerOptionsSchema = z.object({
  objectToTile: z
    .nativeEnum(CSObject)
    .describe("Object to tile inside the ContextScene.")
    .optional(),
});
export type CSTilerOptions = z.infer<typeof CSTilerOptionsSchema>;

export const ContextSceneTilerSpecificationsCreateSchema = z.object({
  inputs: CSTilerInputsSchema.describe("Inputs"),
  options: CSTilerOptionsSchema.describe("Options").optional(),
});
export type ContextSceneTilerSpecificationsCreate = z.infer<
  typeof ContextSceneTilerSpecificationsCreateSchema
>;

export const ContextSceneTilerSpecificationsSchema = z.object({
  inputs: CSTilerInputsSchema.describe("Inputs"),
  output: z.string().describe("Reality Data id of tiled ContextScene"),
  options: CSTilerOptionsSchema.describe("Options").optional(),
});
export type ContextSceneTilerSpecifications = z.infer<
  typeof ContextSceneTilerSpecificationsSchema
>;

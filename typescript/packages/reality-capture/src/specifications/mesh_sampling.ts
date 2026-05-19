import { z } from "zod";

export const MeshSamplingInputsSchema = z.object({
  meshes: z.array(z.string()).describe("Reality data Ids of meshes to sample"),
});
export type MeshSamplingInputs = z.infer<typeof MeshSamplingInputsSchema>;

export enum MeshSamplingFormat {
  OPC = "OPC",
  THREE_D_TILES_PNTS = "3DTilesPnts",
  THREE_D_TILES_GLBC = "3DTilesGlbc",
  LAS = "LAS",
  LAZ = "LAZ",
  E57 = "E57",
  POD = "POD",
}

export const MeshSamplingOptionsSchema = z.object({
  outputFormat: z
    .nativeEnum(MeshSamplingFormat)
    .describe("Output format for the conversion.")
    .optional(),
  inputCrs: z.string().describe("CRS for the input data").optional(),
  outputCrs: z.string().describe("CRS for the output data").optional(),
  sampling: z.number().describe("Sampling value in meter").optional(),
});
export type MeshSamplingOptions = z.infer<typeof MeshSamplingOptionsSchema>;

export const MeshSamplingSpecificationsCreateSchema = z.object({
  inputs: MeshSamplingInputsSchema.describe("Inputs"),
  options: MeshSamplingOptionsSchema.describe("Options").optional(),
});
export type MeshSamplingSpecificationsCreate = z.infer<
  typeof MeshSamplingSpecificationsCreateSchema
>;

export const MeshSamplingSpecificationsSchema = z.object({
  inputs: MeshSamplingInputsSchema.describe("Inputs"),
  output: z.string().describe("Reality Data id of the sampled point cloud"),
  options: MeshSamplingOptionsSchema.describe("Options").optional(),
});
export type MeshSamplingSpecifications = z.infer<
  typeof MeshSamplingSpecificationsSchema
>;

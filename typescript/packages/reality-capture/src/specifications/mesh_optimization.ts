import { z } from "zod";

export const MeshOptimizationInputsSchema = z.object({
  meshes: z.array(z.string()).describe("Reality Data IDs of the input mesh containers."),
});
export type MeshOptimizationInputs = z.infer<typeof MeshOptimizationInputsSchema>;

export enum MeshOptimizationFormat {
  THREE_D_TILES_1_0 = "3DTiles_1.0",
  THREE_D_TILES_1_1 = "3DTiles_1.1",
  THREE_D_TILES_2_0 = "3DTiles_2.0",
  I3S_1_8 = "I3S_1.8",
}

export const MeshOptimizationOptionsSchema = z.object({
  outputFormat: z.nativeEnum(MeshOptimizationFormat)
    .describe("Output format for the optimized mesh.").nullish(),
  outputCrs: z.string().describe("CRS for the output data.").nullish(),
});
export type MeshOptimizationOptions = z.infer<typeof MeshOptimizationOptionsSchema>;

export const MeshOptimizationSpecificationsCreateSchema = z.object({
  inputs: MeshOptimizationInputsSchema.describe("Inputs"),
  options: MeshOptimizationOptionsSchema.describe("Options").nullish(),
});
export type MeshOptimizationSpecificationsCreate = z.infer<
  typeof MeshOptimizationSpecificationsCreateSchema
>;

export const MeshOptimizationSpecificationsSchema = z.object({
  inputs: MeshOptimizationInputsSchema.describe("Inputs"),
  output: z.string().describe("Reality Data ID of the optimized mesh."),
  options: MeshOptimizationOptionsSchema.describe("Options").nullish(),
});
export type MeshOptimizationSpecifications = z.infer<
  typeof MeshOptimizationSpecificationsSchema
>;

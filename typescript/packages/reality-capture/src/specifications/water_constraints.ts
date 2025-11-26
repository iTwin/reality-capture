import { z } from "zod";

export enum WaterConstraintsOutputsCreate {
  CONSTRAINTS = "constraints",
}

export const WaterConstraintsInputsSchema = z.object({
    scene: z.string().describe("Reality data id of ContextScene"),
    modelingReference: z.string().describe("Reality data id of Modeling Reference"),
});
export type WaterConstraintsInputs = z.infer<typeof WaterConstraintsInputsSchema>;

export const WaterConstraintsOptionsSchema = z.object({
    forceHorizontal: z
        .boolean()
        .optional()
        .describe("Force constraints to be horizontal"),
});
export type WaterConstraintsOptions = z.infer<typeof WaterConstraintsOptionsSchema>;

export const WaterConstraintsOutputsSchema = z.object({
    constraints: z
        .string()
        .regex(/^bkt:.+/, { message: "Must match ^bkt:.+" })
        .describe("Path in the bucket of output constraints"),
});
export type WaterConstraintsOutputs = z.infer<typeof WaterConstraintsOutputsSchema>;

export const WaterConstraintsSpecificationsCreateSchema = z.object({
    inputs: WaterConstraintsInputsSchema.describe("Inputs"),
    outputs: z
        .array(z.nativeEnum(WaterConstraintsOutputsCreate))
        .describe("Outputs"),
    options: WaterConstraintsOptionsSchema.optional().describe("Options"),
});
export type WaterConstraintsSpecificationsCreate = z.infer<typeof WaterConstraintsSpecificationsCreateSchema>;

export const WaterConstraintsSpecificationsSchema = z.object({
    inputs: WaterConstraintsInputsSchema.describe("Inputs"),
    outputs: WaterConstraintsOutputsSchema.describe("Outputs"),
    options: WaterConstraintsOptionsSchema.optional().describe("Options"),
});
export type WaterConstraintsSpecifications = z.infer<typeof WaterConstraintsSpecificationsSchema>;

export const WaterConstraintsCostSchema = z.object({
    gpix: z
        .number()
        .min(0, { message: "Must be greater than or equal to 0" })
        .describe("Number of GigaPixels in the overall inputs."),
});
export type WaterConstraintsCost = z.infer<typeof WaterConstraintsCostSchema>;
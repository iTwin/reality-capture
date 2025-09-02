import { z } from "zod";

export enum AltitudeReference {
  SEA_LEVEL = "SeaLevel",
  WGS84_ELLIPSOID = "WGS84Ellipsoid",
}

export const FillImagePropertiesInputsSchema = z.object({
  imageCollections: z.array(z.string()).optional().describe("List of image collection reality data ids."),
  sceneToProcess: z.string().optional().describe("Reality data id of ContextScene to process."),
  sceneToComplete: z.string().optional().describe("Reality data id of ContextScene to complete."),
  presets: z.array(z.string()).optional().describe("List of paths to preset"),
});
export type FillImagePropertiesInputs = z.infer<typeof FillImagePropertiesInputsSchema>;

export const FillImagePropertiesOutputsSchema = z.object({
  scene: z.string().describe("Output reality data id of ContextScene with image properties filled."),
});
export type FillImagePropertiesOutputs = z.infer<typeof FillImagePropertiesOutputsSchema>;

export const FillImagePropertiesOptionsSchema = z.object({
  recursiveImageCollections: z.boolean().optional()
    .describe("Recursively read folders in image collection."),
  altitudeReference: z.nativeEnum(AltitudeReference).optional()
    .describe("Reference altitude when reading Z data from Exif."),
});
export type FillImagePropertiesOptions = z.infer<typeof FillImagePropertiesOptionsSchema>;

export const FillImagePropertiesSpecificationsSchema = z.object({
  inputs: FillImagePropertiesInputsSchema
    .describe("Inputs for Fill Image Properties job"),
  outputs: FillImagePropertiesOutputsSchema
    .describe("Outputs for Fill Image Properties job"),
  options: FillImagePropertiesOptionsSchema.optional()
    .describe("Options for Fill Image Properties job"),
});
export type FillImagePropertiesSpecifications = z.infer<typeof FillImagePropertiesSpecificationsSchema>;

export enum FillImagePropertiesOutputsCreate {
  SCENE = "scene",
}

export const FillImagePropertiesSpecificationsCreateSchema = z.object({
  inputs: FillImagePropertiesInputsSchema
    .describe("Inputs for Fill Image Properties job"),
  outputs: z.array(z.nativeEnum(FillImagePropertiesOutputsCreate))
    .describe("List of output type for Fill Image Properties job"),
  options: FillImagePropertiesOptionsSchema.optional()
    .describe("Outputs for Fill Image Properties job"),
});
export type FillImagePropertiesSpecificationsCreate = z.infer<typeof FillImagePropertiesSpecificationsCreateSchema>;

export const FillImagePropertiesCostSchema = z.object({
  imageCount: z.number().describe("Number of images to import."),
});
export type FillImagePropertiesCost = z.infer<typeof FillImagePropertiesCostSchema>;
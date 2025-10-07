import { z } from "zod";

export enum FileType {
  PRESET = "Preset",
}

export const FileSchema = z.object({
    id: z.string().describe("Id of the file"),
    name: z.string().min(3).max(256).describe("Display name of the file"),
    type: z.nativeEnum(FileType).describe("File type"),
    description: z.string().optional().describe("Description of the file"),
    deprecated: z.boolean().optional().describe("If true, this file won't be available in a long term future."),
});
export type File = z.infer<typeof FileSchema>;

export const FilesSchema = z.object({
    files: z.array(FileSchema).describe("List of files"),
});
export type Files = z.infer<typeof FilesSchema>;
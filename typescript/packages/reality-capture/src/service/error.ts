import { z } from "zod";

export const ErrorSchema = z.object({
  code: z.string().describe("One of a server-defined set of error codes."),
  message: z.string().describe("A human-readable representation of the error."),
  target: z.string().optional().describe("The target of the error."),
});
export type Error = z.infer<typeof ErrorSchema>;

export const DetailedErrorSchema = z.object({
  code: z.string().describe("One of a server-defined set of error codes."),
  message: z.string().describe("A human-readable representation of the error."),
  target: z.string().optional().describe("The target of the error."),
  details: z.array(ErrorSchema).optional().describe("Array of more specific errors."),
});
export type DetailedError = z.infer<typeof DetailedErrorSchema>;

export const DetailedErrorResponseSchema = z.object({
  error: DetailedErrorSchema.describe("Detailed error information."),
});
export type DetailedErrorResponse = z.infer<typeof DetailedErrorResponseSchema>;
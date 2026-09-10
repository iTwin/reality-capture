import { z } from "zod";
import { ContainerLinksSchema } from "./reality_data";

export const BucketSchema = z.object({
  iTwinId: z.string().describe("iTwin Id for the bucket.")
});
export type Bucket = z.infer<typeof BucketSchema>;

export const BucketResponseSchema = z.object({
  bucket: BucketSchema.describe("Bucket information"),
  _links: ContainerLinksSchema.describe("The link to the container.")
});
export type BucketResponse = z.infer<typeof BucketResponseSchema>;
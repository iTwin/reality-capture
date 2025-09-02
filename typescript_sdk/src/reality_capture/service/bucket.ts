import { z } from "zod";
import { ContainerLinks } from "./reality_data";

export const Bucket = z.object({
  iTwinId: z.string().describe("iTwin Id for the bucket.")
});
export type Bucket = z.infer<typeof Bucket>;

export const BucketResponse = z.object({
  bucket: Bucket.describe("Bucket information"),
  _links: ContainerLinks.describe("The link to the container.")
});
export type BucketResponse = z.infer<typeof BucketResponse>;
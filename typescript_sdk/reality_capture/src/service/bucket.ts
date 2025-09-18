import { z } from "zod";

export const BucketSchema = z.object({
  iTwinId: z.string().describe("iTwin Id for the bucket.")
});
export type Bucket = z.infer<typeof BucketSchema>;

export const URLSchema = z.object({
  href: z.string().describe("URL."),
});
export type URL = z.infer<typeof URLSchema>;

export const ContainerLinksSchema = z.object({
  containerUrl: URLSchema.describe("The URL of the container"),
});
export type ContainerLinks = z.infer<typeof ContainerLinksSchema>;

export const BucketResponseSchema = z.object({
  bucket: BucketSchema.describe("Bucket information"),
  _links: ContainerLinksSchema.describe("The link to the container.")
});
export type BucketResponse = z.infer<typeof BucketResponseSchema>;
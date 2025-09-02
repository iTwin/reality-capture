import { z } from "zod";

export enum Classification {
  TERRAIN = "Terrain",
  IMAGERY = "Imagery",
  PINNED = "Pinned",
  MODEL = "Model",
  UNDEFINED = "Undefined",
}

export enum Type {
  CC_IMAGE_COLLECTION = "CCImageCollection",
  THREED_TILES = "Cesium3DTiles",
  COLLADA = "DAE",
  CONTEXT_DETECTOR = "ContextDetector",
  CONTEXT_SCENE = "ContextScene",
  DGN = "DGN",
  E57 = "E57",
  FBX = "FBX",
  GLB = "GLB",
  GLTF = "GLTF",
  KML = "KML",
  LAS = "LAS",
  LAZ = "LAZ",
  LOD = "LOD",
  LOD_TREE = "LODTree",
  OBJ = "OBJ",
  OMR = "OMR",
  OPC = "OPC",
  OSGB = "OSGB",
  OVF = "OVF",
  OVT = "OVT",
  PLY = "PLY",
  PNTS = "PNTS",
  POD = "PointCloud",
  REALITY_MESH_3D_Tiles = "RealityMesh3DTiles",
  REFERENCE_MODEL = "ModelingReference",
  SLPK = "SLPK",
  SPACEYES = "SpaceEyes3D",
  SUPER_MAP = "SuperMap",
  S3C = "S3C",
  TERRAIN_3D_TILES = "Terrain3DTiles",
  TEXTURED_TIE_POINTS = "TexturedTiePoints",
  THREE_SM = "3SM",
  THREE_MX = "3MX",
  UNSTRUCTURED_DATA = "Unstructured",
}

export const AcquisitionSchema = z.object({
  startDateTime: z.string().datetime().optional().describe("ISO-8601 compliant time (UTC) that indicates when the data acquisition started."),
  endDateTime: z.string().datetime().optional().describe("ISO-8601 compliant time (UTC) that indicates when the data acquisition ended."),
  acquirer: z.string().optional().describe("Description of the acquirer."),
});
export type Acquisition = z.infer<typeof AcquisitionSchema>;

export const CoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90).describe("Latitude in degrees."),
  longitude: z.number().min(-180).max(180).describe("Longitude in degrees."),
});
export type Coordinate = z.infer<typeof CoordinateSchema>;

export const ExtentSchema = z.object({
  southWest: CoordinateSchema.describe("Extent's southwest coordinate."),
  northEast: CoordinateSchema.describe("Extent's northeast coordinate."),
});
export type Extent = z.infer<typeof ExtentSchema>;

export const RealityDataBaseSchema = z.object({
  classification: z.nativeEnum(Classification).optional().describe("Specific value constrained field that indicates the nature of the reality data."),
  description: z.string().optional().describe("Description of the reality data."),
  tags: z.array(z.string()).optional().describe("Any strings identifier which you can assign to reality data to identify it."),
  dataset: z.string().optional().describe("This field can be used to define a loose grouping of reality data. This property may not contain any control sequence such as a URL or code."),
  group: z.string().optional().describe("The group can be used to define a second level of grouping. This property may not contain any control sequence such as a URL or code."),
  rootDocument: z.string().optional().describe("Used to indicate the root document of the reality data."),
  acquisition: AcquisitionSchema.optional().describe("Details about data acquisition."),
  extent: ExtentSchema.optional().describe("The rectangular area on the Earth which encloses the reality data."),
  authoring: z.boolean().optional().describe("A boolean value that is true if the data is being created. It is false if the data has been completely uploaded."),
  ownerId: z.string().optional().describe("Identifier of the owner of the reality data."),
});
export type RealityDataBase = z.infer<typeof RealityDataBaseSchema>;

export const RealityDataCreateSchema = RealityDataBaseSchema.extend({
  iTwinId: z.string().describe("Id of associated iTwin."),
  displayName: z.string().describe("Name of the reality data."),
  type: z.nativeEnum(Type).describe("A key indicating the format of the data."),
});
export type RealityDataCreate = z.infer<typeof RealityDataCreateSchema>;

export const RealityDataSchema = RealityDataBaseSchema.extend({
  id: z.string().describe("Identifier of the reality data. This identifier is assigned by the service at the creation of the reality data. It is also unique."),
  displayName: z.string().describe("Name of the reality data."),
  createdDateTime: z.string().datetime().describe("ISO-8601 compliant time (UTC) of the creation of the reality data."),
  modifiedDateTime: z.string().datetime().describe("ISO-8601 compliant time (UTC) of last access of the reality data."),
  lastAccessedDateTime: z.string().datetime().describe("ISO-8601 compliant time (UTC) of the creation of the reality data."),
  dataCenterLocation: z.string().describe("Identifies the data center location used to store the reality data."),
  size: z.number().int().min(0).describe("The size of the reality data in Kilobytes."),
  type: z.nativeEnum(Type).describe("A key indicating the format of the data."),
});
export type RealityData = z.infer<typeof RealityDataSchema>;

export const RealityDataUpdateSchema = RealityDataBaseSchema.extend({
  iTwinId: z.string().optional().describe("Id of associated iTwin."),
  displayName: z.string().optional().describe("Name of the reality data."),
  type: z.nativeEnum(Type).optional().describe("A key indicating the format of the data."),
});
export type RealityDataUpdate = z.infer<typeof RealityDataUpdateSchema>;

export enum ContainerType {
  AZURE_BLOB_SAS_URL = "AzureBlobSasUrl",
}

export enum Access {
  WRITE = "Write",
  READ = "Read",
}

export const URLSchema = z.object({
  href: z.string().describe("URL."),
});
export type URL = z.infer<typeof URLSchema>;

export const ContainerLinksSchema = z.object({
  containerUrl: URLSchema.describe("The URL of the container"),
});
export type ContainerLinks = z.infer<typeof ContainerLinksSchema>;

export const ContainerDetailsSchema = z.object({
  type: z.nativeEnum(ContainerType).describe("Type of container."),
  access: z.nativeEnum(Access).describe("Type of access user have to container."),
  _links: ContainerLinksSchema.describe("The link to the container."),
});
export type ContainerDetails = z.infer<typeof ContainerDetailsSchema>;

export enum Prefer {
  MINIMAL = "minimal",
  REPRESENTATION = "representation",
}

export const RealityDataFilterSchema = z.object({
  itwinId: z.string().optional().describe("Id of iTwin. The operation gets all reality data in this iTwin."),
  continuationToken: z.string().optional().describe("Parameter that enables continuing to the next page of the previous paged query. This must be passed exactly as it is in the response body's _links.next property. If this is specified and $top is omitted, the next page will be the same size as the previous page."),
  $top: z.number().int().min(1).max(1000).optional().describe("The number of reality data to get in each page."),
  extent: ExtentSchema.optional().describe("Extent of the area to search, delimited by southwest and northeast coordinates."),
  $orderBy: z.string().optional().describe("Parameter that enable to order reality data in ascending or descending order. Default is ascending. Example: displayName desc"),
  search: z.string().optional().describe("Search reality data."),
  types: z.array(z.nativeEnum(Type)).optional().describe("List of reality data types."),
  acquisitionDateTime: z
    .tuple([z.string().datetime(), z.string().datetime()])
    .optional()
    .describe("Aquisition datetime range (start, end) in ISO-8601 compliant time (UTC)."),
  createdDateTime: z
    .tuple([z.string().datetime(), z.string().datetime()])
    .optional()
    .describe("Created datetime range (start, end) in ISO-8601 compliant time (UTC)."),
  modifiedDateTime: z
    .tuple([z.string().datetime(), z.string().datetime()])
    .optional()
    .describe("Modified datetime range (start, end) in ISO-8601 compliant time (UTC)."),
  lastAccessedDateTime: z
    .tuple([z.string().datetime(), z.string().datetime()])
    .optional()
    .describe("Last accessed datetime range (start, end) in ISO-8601 compliant time (UTC)."),
  ownerId: z.string().optional().describe("Guid identifier of the owner."),
  dataCenter: z.string().optional().describe("Data center location."),
  tag: z.string().optional().describe("Parameter to get reality data with exact matching tags."),
});
export type RealityDataFilter = z.infer<typeof RealityDataFilterSchema>;

export function filterAsDictForServiceCall(filter: RealityDataFilter): Record<string, any> {
  const params: Record<string, any> = {};
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null) params[k] = v;
  }
  for (const k of Object.keys(params).filter((key) => key.endsWith("DateTime"))) {
    if (
      Array.isArray(params[k]) &&
      params[k].length === 2 &&
      typeof params[k][0] === "string" &&
      typeof params[k][1] === "string"
    ) {
      params[k] = `${params[k][0]}/${params[k][1]}`;
    }
  }
  return params;
}

export const RealityDataMinimalSchema = z.object({
  id: z.string().describe("Identifier of the reality data. This identifier is assigned by the service at the creation of the reality data. It is also unique."),
  displayName: z.string().describe("Name of the reality data."),
  type: z.nativeEnum(Type).describe("A key indicating the format of the data. The type property should be a specific indication of the format of the reality data."),
});
export type RealityDataMinimal = z.infer<typeof RealityDataMinimalSchema>;

export const NextPageLinkSchema = z.object({
  next: URLSchema.describe("Link."),
});
export type NextPageLink = z.infer<typeof NextPageLinkSchema>;

export const RealityDatasSchema = z.object({
  realityData: z.array(
    z.union([RealityDataSchema, RealityDataMinimalSchema])
  ).describe("List of reality data"),
  _links: NextPageLinkSchema.optional().describe("Next page link."),
});
export type RealityDatas = z.infer<typeof RealityDatasSchema>;

export function getContinuationToken(rd: RealityDatas): string | null {
  if (!rd._links) return null;
  const url = new URL(rd._links.next.href);
  return url.searchParams.get("continuationToken");
}
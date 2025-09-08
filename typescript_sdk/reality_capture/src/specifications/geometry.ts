import { z } from "zod";

export const BoundingBoxSchema = z.object({
  xmin: z.number().describe("X coordinate of the minimum corner"),
  ymin: z.number().describe("Y coordinate of the minimum corner"),
  zmin: z.number().describe("Z coordinate of the minimum corner"),
  xmax: z.number().describe("X coordinate of the maximum corner"),
  ymax: z.number().describe("Y coordinate of the maximum corner"),
  zmax: z.number().describe("Z coordinate of the maximum corner"),
});
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

export const Point3dSchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
  z: z.number().describe("Z coordinate"),
});
export type Point3d = z.infer<typeof Point3dSchema>;

export const Coords2dSchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
});
export type Coords2d = z.infer<typeof Coords2dSchema>;

export const Polygon2DWithHolesSchema = z.object({
  outsideBounds: z.array(Coords2dSchema).describe("Outside bounds of the polygon"),
  holes: z.array(z.array(Coords2dSchema)).optional().describe("List of holes boundaries if any"),
});
export type Polygon2DWithHoles = z.infer<typeof Polygon2DWithHolesSchema>;

export const RegionOfInterestSchema = z.object({
  crs: z.string().describe("Definition of the Region of Interest Coordinate System"),
  polygons: z.array(Polygon2DWithHolesSchema).describe("List of polygons"),
  altitudeMin: z.number().describe("Minimum altitude"),
  altitudeMax: z.number().describe("Maximum altitude"),
});
export type RegionOfInterest = z.infer<typeof RegionOfInterestSchema>;
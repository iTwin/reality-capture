import { expect } from "chai";
import { BoundingBoxSchema, Point3dSchema, Coords2dSchema, Polygon2DWithHolesSchema, RegionOfInterestSchema } from "../../src/specifications/geometry";

describe("BoundingBoxSchema", () => {
  it("should validate a correct bounding box", () => {
    const data = {
      xmin: 0,
      ymin: 1,
      zmin: 2,
      xmax: 10,
      ymax: 11,
      zmax: 12,
    };
    expect(() => BoundingBoxSchema.parse(data)).not.to.throw();
  });

  it("should fail with missing properties", () => {
    const data = { xmin: 0, ymin: 1 };
    expect(() => BoundingBoxSchema.parse(data)).to.throw();
  });

  it("should fail with non-number values", () => {
    const data = {
      xmin: "0",
      ymin: 1,
      zmin: 2,
      xmax: 10,
      ymax: 11,
      zmax: 12,
    };
    expect(() => BoundingBoxSchema.parse(data)).to.throw();
  });
});

describe("Point3dSchema", () => {
  it("should validate a correct 3D point", () => {
    const data = { x: 1, y: 2, z: 3 };
    expect(() => Point3dSchema.parse(data)).not.to.throw();
  });

  it("should fail with missing property", () => {
    const data = { x: 1, y: 2 };
    expect(() => Point3dSchema.parse(data)).to.throw();
  });

  it("should fail with wrong types", () => {
    const data = { x: 1, y: "2", z: 3 };
    expect(() => Point3dSchema.parse(data)).to.throw();
  });
});

describe("Coords2dSchema", () => {
  it("should validate a correct 2D coordinate", () => {
    const data = { x: 5, y: 6 };
    expect(() => Coords2dSchema.parse(data)).not.to.throw();
  });

  it("should fail with missing property", () => {
    const data = { x: 5 };
    expect(() => Coords2dSchema.parse(data)).to.throw();
  });

  it("should fail with wrong types", () => {
    const data = { x: "5", y: 6 };
    expect(() => Coords2dSchema.parse(data)).to.throw();
  });
});

describe("Polygon2DWithHolesSchema", () => {
  it("should validate a polygon with outsideBounds only", () => {
    const data = {
      outsideBounds: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    };
    expect(() => Polygon2DWithHolesSchema.parse(data)).not.to.throw();
  });

  it("should validate a polygon with holes", () => {
    const data = {
      outsideBounds: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      holes: [
        [{ x: 0.5, y: 0.5 }, { x: 0.6, y: 0.6 }]
      ],
    };
    expect(() => Polygon2DWithHolesSchema.parse(data)).not.to.throw();
  });

  it("should fail if outsideBounds is missing", () => {
    const data = {};
    expect(() => Polygon2DWithHolesSchema.parse(data)).to.throw();
  });

  it("should fail if holes have wrong types", () => {
    const data = {
      outsideBounds: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      holes: [
        [{ x: "0.5", y: 0.5 }]
      ],
    };
    expect(() => Polygon2DWithHolesSchema.parse(data)).to.throw();
  });
});

describe("RegionOfInterestSchema", () => {
  it("should validate a correct region of interest", () => {
    const data = {
      crs: "EPSG:4326",
      polygons: [
        {
          outsideBounds: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
          holes: [
            [{ x: 0.5, y: 0.5 }, { x: 0.6, y: 0.6 }]
          ],
        },
      ],
      altitudeMin: 100,
      altitudeMax: 200,
    };
    expect(() => RegionOfInterestSchema.parse(data)).not.to.throw();
  });

  it("should fail if polygons are missing", () => {
    const data = {
      crs: "EPSG:4326",
      altitudeMin: 100,
      altitudeMax: 200,
    };
    expect(() => RegionOfInterestSchema.parse(data)).to.throw();
  });

  it("should fail with non-number altitude", () => {
    const data = {
      crs: "EPSG:4326",
      polygons: [
        { outsideBounds: [{ x: 0, y: 0 }] }
      ],
      altitudeMin: "100",
      altitudeMax: 200,
    };
    expect(() => RegionOfInterestSchema.parse(data)).to.throw();
  });
});
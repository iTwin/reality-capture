import { expect } from "chai";
import { z } from "zod";
import {
  TilingInputsSchema,
  TilingOptionsSchema,
  ModelingReferenceSchema,
  TilingOutputsSchema,
  TilingSpecificationsSchema,
  TilingSpecificationsCreateSchema,
  TilingCostSchema,
  LayoutTileSchema,
  LayoutSchema,
  ModelingReferenceType,
  TilingMode,
  GeometricPrecision,
  TilingPairSelection,
  PhotoUsedForGeometry,
  HoleFilling,
  Simplification,
  ColorCorrection,
  UntexturedRepresentation,
  PointCloudColorSource,
  TextureSource,
  TilingOutputsCreate,
} from "../../specifications/tiling";

describe("TilingInputsSchema", () => {
  it("should validate correct inputs", () => {
    const valid = {
      scene: "scene-id",
      regionOfInterest: "bkt:/some/path/roi.json",
      presets: ["preset1", "preset2"],
    };
    expect(() => TilingInputsSchema.parse(valid)).to.not.throw();
  });

  it("should reject invalid regionOfInterest", () => {
    const invalid = {
      scene: "scene-id",
      regionOfInterest: "/some/path/roi.json",
    };
    expect(() => TilingInputsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should allow missing optional fields", () => {
    const partial = { scene: "scene-id" };
    expect(() => TilingInputsSchema.parse(partial)).to.not.throw();
  });
});

describe("TilingOptionsSchema", () => {
  it("should validate with all enum values", () => {
    const valid = {
      modelingReferenceType: ModelingReferenceType.ORTHOPHOTO,
      tilingMode: TilingMode.ADAPTIVE,
      tilingValue: 10,
      tilingOrigin: { x: 1, y: 2, z: 3 },
      discardEmptyTiles: true,
      crs: "EPSG:4326",
      geometricPrecision: GeometricPrecision.HIGH,
      pairSelection: TilingPairSelection.GENERIC,
      photoUsedForGeometry: PhotoUsedForGeometry.EXCLUDE_THERMAL,
      holeFilling: HoleFilling.SMALL_HOLES,
      simplification: Simplification.STANDARD,
      planarSimplificationTolerance: 0.1,
      pointCloudColorSource: PointCloudColorSource.COLOR,
      colorCorrection: ColorCorrection.STANDARD,
      untexturedRepresentation: UntexturedRepresentation.UNIFORM_COLOR,
      untexturedColor: "#aabbcc",
      textureSource: TextureSource.SMART,
      orthoResolution: 0.5,
      geometryResolutionLimit: 2.0,
      textureResolutionLimit: 4.0,
    };
    expect(() => TilingOptionsSchema.parse(valid)).to.not.throw();
  });

  it("should reject invalid untexturedColor", () => {
    const invalid = {
      untexturedColor: "aabbcc",
    };
    expect(() => TilingOptionsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should allow missing optional fields", () => {
    expect(() => TilingOptionsSchema.parse({})).to.not.throw();
  });
});

describe("ModelingReferenceSchema", () => {
  it("should validate correct location", () => {
    expect(() =>
      ModelingReferenceSchema.parse({ location: "some-reality-data-id" })
    ).to.not.throw();
  });

  it("should reject missing location", () => {
    expect(() => ModelingReferenceSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("TilingOutputsSchema", () => {
  it("should validate modelingReference", () => {
    const valid = { modelingReference: { location: "some-id" } };
    expect(() => TilingOutputsSchema.parse(valid)).to.not.throw();
  });

  it("should reject when modelingReference is missing", () => {
    expect(() => TilingOutputsSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("TilingSpecificationsSchema", () => {
  it("should validate with options", () => {
    const valid = {
      inputs: { scene: "scene-id" },
      outputs: { modelingReference: { location: "some-id" } },
      options: { tilingMode: TilingMode.NO_TILING },
    };
    expect(() => TilingSpecificationsSchema.parse(valid)).to.not.throw();
  });

  it("should validate without options", () => {
    const valid = {
      inputs: { scene: "scene-id" },
      outputs: { modelingReference: { location: "some-id" } },
    };
    expect(() => TilingSpecificationsSchema.parse(valid)).to.not.throw();
  });
});

describe("TilingSpecificationsCreateSchema", () => {
  it("should validate correct outputs array", () => {
    const valid = {
      inputs: { scene: "scene-id" },
      outputs: [TilingOutputsCreate.MODELING_REFERENCE],
      options: { tilingMode: TilingMode.NO_TILING },
    };
    expect(() => TilingSpecificationsCreateSchema.parse(valid)).to.not.throw();
  });

  it("should reject invalid outputs value", () => {
    const invalid = {
      inputs: { scene: "scene-id" },
      outputs: ["invalid"],
    };
    expect(() => TilingSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("TilingCostSchema", () => {
  it("should validate correct gpix and mpoints", () => {
    expect(() =>
      TilingCostSchema.parse({ gpix: 1.5, mpoints: 10 })
    ).to.not.throw();
  });

  it("should reject negative gpix", () => {
    expect(() =>
      TilingCostSchema.parse({ gpix: -1, mpoints: 10 })
    ).to.throw(z.ZodError);
  });

  it("should reject negative mpoints", () => {
    expect(() =>
      TilingCostSchema.parse({ gpix: 1, mpoints: -10 })
    ).to.throw(z.ZodError);
  });
});

describe("LayoutTileSchema", () => {
  const boundingBox = { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
  it("should validate all properties", () => {
    const valid = {
      name: "tile1",
      boxTight: { xmin: 0, xmax: 10, ymin: 0, ymax: 10, zmin: 0, zmax: 10 },
      boxOverlapping: { xmin: 0, xmax: 10, ymin: 0, ymax: 10, zmin: 0, zmax: 10 },
      memoryUsage: 100,
    };
    expect(() => LayoutTileSchema.parse(valid)).to.not.throw();
  });

  it("should reject negative memoryUsage", () => {
    const invalid = {
      name: "tile1",
      boxTight: boundingBox,
      boxOverlapping: boundingBox,
      memoryUsage: -1,
    };
    expect(() => LayoutTileSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("LayoutSchema", () => {
  it("should validate correct layout", () => {
    const valid = {
      tiles: [
        {
          name: "tile1",
          boxTight: { xmin: 0, xmax: 10, ymin: 0, ymax: 10, zmin: 0, zmax: 10 },
          boxOverlapping: { xmin: 0, xmax: 10, ymin: 0, ymax: 10, zmin: 0, zmax: 10 },
          memoryUsage: 100,
        },
      ],
      enuDefinition: "ENU",
      crsDefinition: "CRS",
      roi: {
        crs: "CRS",
        altitudeMin: 0,
        altitudeMax: 150,
        polygons: [{
          outsideBounds: [{ x: 0, y: 1 }]
        }]
      }
    };
    expect(() => LayoutSchema.parse(valid)).to.not.throw();
  });

  it("should reject missing tiles", () => {
    const invalid = {
      enuDefinition: "ENU",
      crsDefinition: "CRS",
      roi: {
        crs: "CRS",
        altitudeMin: 0,
        altitudeMax: 150,
        polygons: [{
          outsideBounds: [{ x: 0, y: 1 }]
        }]
      }
    };
    expect(() => LayoutSchema.parse(invalid)).to.throw(z.ZodError);
  });
});
import { expect } from "chai";
import { z } from "zod";
import {
  Objects2DInputsSchema,
  Objects2DOutputsSchema,
  Objects2DOptionsSchema,
  Objects2DSpecificationsCreateSchema,
  Objects2DSpecificationsSchema,
  Objects2DOutputsCreate,
} from "../../src/specifications/objects2d";

describe("Objects2DInputsSchema", () => {
  it("should validate required and optional fields", () => {
    const data = {
      photos: "photo_id",
      photoObjectDetector: "detector_id",
      model3D: "model_id",
      objects2D: "objects2D_id",
    };
    expect(() => Objects2DInputsSchema.parse(data)).to.not.throw();
  });

  it("should throw when required photos field is missing", () => {
    const data = {};
    expect(() => Objects2DInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should allow only the required field", () => {
    const data = { photos: "photo_id" };
    expect(() => Objects2DInputsSchema.parse(data)).to.not.throw();
  });
});

describe("Objects2DOutputsSchema", () => {
  it("should validate with all optional fields present", () => {
    const data = {
      objects2D: "objects2D_id",
      objects3D: "objects3D_id",
      objects3DAs3DTiles: "3dtiles_id",
      objects3DAsGeoJSON: "geojson_id",
      locations3DAsSHP: "shp_id",
      locations3DAsGeoJSON: "locations_geojson_id",
    };
    expect(() => Objects2DOutputsSchema.parse(data)).to.not.throw();
  });

  it("should validate with no fields present", () => {
    const data = {};
    expect(() => Objects2DOutputsSchema.parse(data)).to.not.throw();
  });
});

describe("Objects2DOptionsSchema", () => {
  it("should validate with all optional fields present", () => {
    const data = {
      useTiePoints: true,
      maxDist: 10.5,
      crs: "EPSG:4326",
      minPhotos: 3,
    };
    expect(() => Objects2DOptionsSchema.parse(data)).to.not.throw();
  });

  it("should validate with no fields present", () => {
    const data = {};
    expect(() => Objects2DOptionsSchema.parse(data)).to.not.throw();
  });
});

describe("Objects2DSpecificationsCreateSchema", () => {
  it("should validate with correct input, output and options", () => {
    const data = {
      inputs: { photos: "photo_id" },
      outputs: [
        Objects2DOutputsCreate.OBJECTS2D,
        Objects2DOutputsCreate.OBJECTS3D_AS_3DTILES,
      ],
      options: { maxDist: 15 },
    };
    expect(() => Objects2DSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should throw if outputs is not an array", () => {
    const data = {
      inputs: { photos: "photo_id" },
      outputs: Objects2DOutputsCreate.OBJECTS2D,
    };
    expect(() => Objects2DSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should validate with only required inputs and outputs", () => {
    const data = {
      inputs: { photos: "photo_id" },
      outputs: [Objects2DOutputsCreate.OBJECTS2D],
    };
    expect(() => Objects2DSpecificationsCreateSchema.parse(data)).to.not.throw();
  });
});

describe("Objects2DSpecificationsSchema", () => {
  it("should validate with correct inputs, outputs, and options", () => {
    const data = {
      inputs: { photos: "photo_id" },
      outputs: { objects2D: "objects2D_id" },
      options: { useTiePoints: false },
    };
    expect(() => Objects2DSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should throw if outputs is missing", () => {
    const data = {
      inputs: { photos: "photo_id" },
    };
    expect(() => Objects2DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

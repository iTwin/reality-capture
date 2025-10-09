/*import { expect } from "chai";
import { z } from "zod";
import {
  Segmentation3DOutputsCreate,
  Segmentation3DInputsSchema,
  Segmentation3DOutputsSchema,
  Segmentation3DOptionsSchema,
  Segmentation3DSpecificationsCreateSchema,
  Segmentation3DSpecificationsSchema,
} from "../../src/specifications/segmentation3d";

describe("Segmentation3DInputsSchema", () => {
  it("should validate minimal valid input", () => {
    const data = {};
    expect(() => Segmentation3DInputsSchema.parse(data)).to.not.throw();
  });

  it("should validate model3D as string", () => {
    const data = { model3D: "some-id" };
    expect(() => Segmentation3DInputsSchema.parse(data)).to.not.throw();
  });

  it("should validate extent with correct format", () => {
    const data = { extent: "bkt:/path/to/polygon" };
    expect(() => Segmentation3DInputsSchema.parse(data)).to.not.throw();
  });

  it("should fail with incorrect extent format", () => {
    const data = { extent: "wrong:/path" };
    expect(() => Segmentation3DInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("Segmentation3DOutputsSchema", () => {
  it("should validate minimal valid output", () => {
    const data = {};
    expect(() => Segmentation3DOutputsSchema.parse(data)).to.not.throw();
  });

  it("should validate all outputs as strings", () => {
    const data: Record<string, string> = {
      segmentation3D: "id1",
      segmentedPointCloud: "id2",
      segmentation3DAsPOD: "id3",
      segmentation3DAsLAS: "id4",
      segmentation3DAsLAZ: "id5",
      segmentation3DAsPLY: "id6",
      objects3D: "id7",
      objects3DAs3DTiles: "id8",
      objects3DAsGeoJSON: "id9",
      locations3DAsSHP: "id10",
      locations3DAsGeoJSON: "id11",
      lines3D: "id12",
      lines3DAs3DTiles: "id13",
      lines3DAsGeoJSON: "id14",
      polygons3D: "id15",
      polygons3DAs3DTiles: "id16",
      polygons3DAsGeoJSON: "id17",
    };
    expect(() => Segmentation3DOutputsSchema.parse(data)).to.not.throw();
  });
});

describe("Segmentation3DOptionsSchema", () => {
  it("should validate empty options", () => {
    const data = {};
    expect(() => Segmentation3DOptionsSchema.parse(data)).to.not.throw();
  });

  it("should validate all options", () => {
    const data = {
      crs: "EPSG:4326",
      saveConfidence: true,
      computeLineWidth: false,
      removeSmallLines: 0.2,
      keepInputResolution: true,
    };
    expect(() => Segmentation3DOptionsSchema.parse(data)).to.not.throw();
  });

  it("should fail with wrong type for removeSmallLines", () => {
    const data = { removeSmallLines: "5" };
    expect(() => Segmentation3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("Segmentation3DSpecificationsCreateSchema", () => {
  it("should validate with minimal required fields", () => {
    const data = {
      inputs: {},
      outputs: [Segmentation3DOutputsCreate.SEGMENTATION3D],
    };
    expect(() => Segmentation3DSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should validate with options", () => {
    const data = {
      inputs: { model3D: "id" },
      outputs: [Segmentation3DOutputsCreate.SEGMENTATION3D],
      options: { crs: "EPSG:4326" },
    };
    expect(() => Segmentation3DSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should fail if outputs is missing", () => {
    const data = { inputs: {} };
    expect(() => Segmentation3DSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("Segmentation3DSpecificationsSchema", () => {
  it("should validate with all fields", () => {
    const data = {
      inputs: { model3D: "id", extent: "bkt:/polygon" },
      outputs: { segmentation3D: "id1" },
      options: { keepInputResolution: true },
    };
    expect(() => Segmentation3DSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should fail if inputs are missing", () => {
    const data = { outputs: {}, options: {} };
    expect(() => Segmentation3DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if outputs are missing", () => {
    const data = { inputs: {} };
    expect(() => Segmentation3DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("Segmentation3DOutputsCreate enum", () => {
  it("should contain expected values", () => {
    expect(Segmentation3DOutputsCreate.SEGMENTATION3D).to.equal("segmentation3D");
    expect(Segmentation3DOutputsCreate.OBJECTS3D_AS_GEOJSON).to.equal("objects3DAsGeoJSON");
    expect(Segmentation3DOutputsCreate.POLYGONS3D_AS_GEOJSON).to.equal("polygons3DAsGeoJSON");
  });
});*/
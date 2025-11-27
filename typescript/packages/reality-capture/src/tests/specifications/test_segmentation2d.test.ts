import { expect } from "chai";
import { z } from "zod";
import {
  Segmentation2DOutputsCreate,
  Segmentation2DInputsSchema,
  Segmentation2DOutputsSchema,
  Segmentation2DOptionsSchema,
  Segmentation2DSpecificationsCreateSchema,
  Segmentation2DSpecificationsSchema,
} from "../../src/specifications/segmentation2d";

describe("Segmentation2DInputsSchema", () => {
  it("should validate required and optional fields", () => {
    const valid = {
      photos: "photoId",
    };
    expect(() => Segmentation2DInputsSchema.parse(valid)).not.to.throw();

    const withOptionals = {
      photos: "photoId",
      photoSegmentationDetector: "detectorId",
      model3D: "modelId",
      segmentation2D: "segmentedId",
    };
    expect(() => Segmentation2DInputsSchema.parse(withOptionals)).not.to.throw();
  });

  it("should fail if photos is missing", () => {
    const invalid = {};
    expect(() => Segmentation2DInputsSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("Segmentation2DOutputsSchema", () => {
  it("should validate when all outputs are present", () => {
    const valid = {
      segmentation2D: "segmentedId",
      segmentedPhotos: "segmentedPhotosId",
      lines3D: "lines3DId",
      lines3DAs3DTiles: "lines3DTilesId",
      lines3DAsGeoJSON: "lines3DGeoJSONId",
      polygons3D: "polygons3DId",
      polygons3DAs3DTiles: "polygons3DTilesId",
      polygons3DAsGeoJSON: "polygons3DGeoJSONId",
    };
    expect(() => Segmentation2DOutputsSchema.parse(valid)).not.to.throw();
  });

  it("should validate with only one output", () => {
    const valid = { segmentation2D: "segmentedId" };
    expect(() => Segmentation2DOutputsSchema.parse(valid)).not.to.throw();
  });

  it("should validate with empty object (all outputs optional)", () => {
    expect(() => Segmentation2DOutputsSchema.parse({})).not.to.throw();
  });
});

describe("Segmentation2DOptionsSchema", () => {
  it("should validate with all options", () => {
    const valid = {
      computeLineWidth: true,
      removeSmallLines: 1.2,
      minPhotos: 5,
    };
    expect(() => Segmentation2DOptionsSchema.parse(valid)).not.to.throw();
  });

  it("should validate with some options missing", () => {
    const valid = { computeLineWidth: false };
    expect(() => Segmentation2DOptionsSchema.parse(valid)).not.to.throw();
  });

  it("should fail if minPhotos is not integer", () => {
    const invalid = { minPhotos: 2.5 };
    expect(() => Segmentation2DOptionsSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("Segmentation2DSpecificationsCreateSchema", () => {
  it("should validate a correct specification", () => {
    const valid = {
      inputs: { photos: "photoId" },
      outputs: [Segmentation2DOutputsCreate.SEGMENTATION2D, Segmentation2DOutputsCreate.LINES3D],
      options: { computeLineWidth: true, minPhotos: 3 },
    };
    expect(() => Segmentation2DSpecificationsCreateSchema.parse(valid)).not.to.throw();
  });

  it("should fail if outputs is not an array of enum", () => {
    const invalid = {
      inputs: { photos: "photoId" },
      outputs: ["invalidOutput"],
    };
    expect(() => Segmentation2DSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should validate specification without options", () => {
    const valid = {
      inputs: { photos: "photoId" },
      outputs: [Segmentation2DOutputsCreate.SEGMENTATION2D],
    };
    expect(() => Segmentation2DSpecificationsCreateSchema.parse(valid)).not.to.throw();
  });
});

describe("Segmentation2DSpecificationsSchema", () => {
  it("should validate a correct specification", () => {
    const valid = {
      inputs: { photos: "photoId" },
      outputs: { segmentation2D: "segmentedId" },
      options: { removeSmallLines: 0.5 },
    };
    expect(() => Segmentation2DSpecificationsSchema.parse(valid)).not.to.throw();
  });

  it("should fail if outputs is missing", () => {
    const invalid = { inputs: { photos: "photoId" } };
    expect(() => Segmentation2DSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should validate without options", () => {
    const valid = {
      inputs: { photos: "photoId" },
      outputs: {},
    };
    expect(() => Segmentation2DSpecificationsSchema.parse(valid)).not.to.throw();
  });
});

describe("Segmentation2DOutputsCreate enum", () => {
  it("should have correct enum values", () => {
    expect(Segmentation2DOutputsCreate.SEGMENTATION2D).to.equal("segmentation2D");
    expect(Segmentation2DOutputsCreate.SEGMENTED_PHOTOS).to.equal("segmentedPhotos");
    expect(Segmentation2DOutputsCreate.LINES3D).to.equal("lines3D");
    expect(Segmentation2DOutputsCreate.LINES3D_AS_3DTILES).to.equal("lines3DAs3DTiles");
    expect(Segmentation2DOutputsCreate.LINES3D_AS_GEOJSON).to.equal("lines3DAsGeoJSON");
    expect(Segmentation2DOutputsCreate.POLYGONS3D).to.equal("polygons3D");
    expect(Segmentation2DOutputsCreate.POLYGONS3D_AS_3DTILES).to.equal("polygons3DAs3DTiles");
    expect(Segmentation2DOutputsCreate.POLYGONS3D_AS_GEOJSON).to.equal("polygons3DAsGeoJSON");
  });
});

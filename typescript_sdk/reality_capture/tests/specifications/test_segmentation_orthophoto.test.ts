/*import { expect } from "chai";
import { z } from "zod";
import {
  SegmentationOrthophotoInputsSchema,
  SegmentationOrthophotoOutputsSchema,
  SegmentationOrthophotoOutputsCreate,
  SegmentationOrthophotoSpecificationsCreateSchema,
  SegmentationOrthophotoSpecificationsSchema,
} from "../../src/specifications/segmentation_orthophoto";

describe("SegmentationOrthophotoInputsSchema", () => {
  it("should validate correct inputs", () => {
    const data = {
      orthophoto: "scene-id-123",
      orthophotoSegmentationDetector: "detector-id-456",
    };
    expect(() => SegmentationOrthophotoInputsSchema.parse(data)).not.to.throw();
  });

  it("should fail for missing fields", () => {
    const data = {
      orthophoto: "scene-id-123",
    };
    expect(() => SegmentationOrthophotoInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("SegmentationOrthophotoOutputsSchema", () => {
  it("should validate with all outputs", () => {
    const data = {
      segmentation2D: "seg2d-id",
      segmentedPhotos: "segPhotos-id",
      polygons2D: "poly2d-id",
      polygons2DAsSHP: "poly2dSHP-id",
      polygons2DAsGeoJSON: "poly2dGeoJSON-id",
      lines2D: "lines2d-id",
      lines2DAsSHP: "lines2dSHP-id",
      lines2DAsGeoJSON: "lines2dGeoJSON-id",
    };
    expect(() => SegmentationOrthophotoOutputsSchema.parse(data)).not.to.throw();
  });

  it("should validate with only one output", () => {
    const data = {
      segmentation2D: "seg2d-id",
    };
    expect(() => SegmentationOrthophotoOutputsSchema.parse(data)).not.to.throw();
  });

  it("should validate with no outputs", () => {
    const data = {};
    expect(() => SegmentationOrthophotoOutputsSchema.parse(data)).not.to.throw();
  });
});

describe("SegmentationOrthophotoOutputsCreate enum", () => {
  it("should contain expected keys and values", () => {
    expect(SegmentationOrthophotoOutputsCreate.SEGMENTATION2D).to.equal("segmentation2D");
    expect(SegmentationOrthophotoOutputsCreate.POLYGONS2D_AS_GEOJSON).to.equal("polygons2DAsGeoJSON");
    expect(Object.values(SegmentationOrthophotoOutputsCreate)).to.include("lines2DAsGeoJSON");
  });
});

describe("SegmentationOrthophotoSpecificationsCreateSchema", () => {
  it("should validate correct specification", () => {
    const data = {
      inputs: {
        orthophoto: "scene-id-123",
        orthophotoSegmentationDetector: "detector-id-456",
      },
      outputs: [
        SegmentationOrthophotoOutputsCreate.SEGMENTATION2D,
        SegmentationOrthophotoOutputsCreate.POLYGONS2D,
      ],
    };
    expect(() => SegmentationOrthophotoSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should fail if outputs is not an array of enum values", () => {
    const data = {
      inputs: {
        orthophoto: "scene-id-123",
        orthophotoSegmentationDetector: "detector-id-456",
      },
      outputs: ["notAnEnumValue"],
    };
    expect(() => SegmentationOrthophotoSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if inputs is invalid", () => {
    const data = {
      inputs: { orthophoto: "scene-id-123" },
      outputs: [SegmentationOrthophotoOutputsCreate.SEGMENTATION2D],
    };
    expect(() => SegmentationOrthophotoSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("SegmentationOrthophotoSpecificationsSchema", () => {
  it("should validate correct specification", () => {
    const data = {
      inputs: {
        orthophoto: "scene-id-123",
        orthophotoSegmentationDetector: "detector-id-456",
      },
      outputs: {
        segmentation2D: "seg2d-id",
        segmentedPhotos: "segPhotos-id",
      },
    };
    expect(() => SegmentationOrthophotoSpecificationsSchema.parse(data)).not.to.throw();
  });

  it("should fail for invalid inputs", () => {
    const data = {
      inputs: { orthophoto: "scene-id-123" },
      outputs: {},
    };
    expect(() => SegmentationOrthophotoSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail for outputs with wrong type", () => {
    const data = {
      inputs: {
        orthophoto: "scene-id-123",
        orthophotoSegmentationDetector: "detector-id-456",
      },
      outputs: {
        segmentation2D: 123,
      },
    };
    expect(() => SegmentationOrthophotoSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});*/
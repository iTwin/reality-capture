import { expect } from "chai";
import { z } from "zod";
import {
  TrainingS3DInputsSchema,
  TrainingS3DOutputsSchema,
  TrainingS3DOptionsSchema,
  TrainingS3DOutputsCreate,
  Segmentation3DTrainingModel,
  PointCloudFeature,
  TrainingS3DSpecificationsCreateSchema,
  TrainingS3DSpecificationsSchema,
} from "../../specifications/training";

describe("TrainingS3DInputsSchema", () => {
  it("should validate a correct input", () => {
    const data = { segmentations3D: ["model-id"], detectorName: "my-detector" };
    expect(() => TrainingS3DInputsSchema.parse(data)).not.to.throw();
  });

  it("should validate a correct input with preset", () => {
    const data = { segmentations3D: ["model-id"], preset: "path/to/preset", detectorName: "my-detector" };
    expect(() => TrainingS3DInputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if segmentations3D is missing", () => {
    const data = { detectorName: "my-detector" };
    expect(() => TrainingS3DInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if detectorName is missing", () => {
    const data = { segmentations3D: ["model-id"] };
    expect(() => TrainingS3DInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingS3DOutputsSchema", () => {
  it("should validate a correct output", () => {
    const data = { detector: "det-id" };
    expect(() => TrainingS3DOutputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if detector is missing", () => {
    const data = {};
    expect(() => TrainingS3DOutputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingS3DOptionsSchema", () => {
  it("should validate correct options", () => {
    const data = {
      epochs: 10,
      spacing: 0.5,
      model: Segmentation3DTrainingModel.SPLATNET,
      features: [PointCloudFeature.RGB, PointCloudFeature.NORMAL],
      versionNumber: "1.0",
    };
    expect(() => TrainingS3DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should accept partial data", () => {
    const data = {};
    expect(() => TrainingS3DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should fail if epochs is not an int", () => {
    const data = { epochs: 3.5 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is < 1", () => {
    const data = { epochs: 0 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is > 100", () => {
    const data = { epochs: 101 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if spacing is <= 0", () => {
    const data = { spacing: 0 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingS3DSpecificationsCreateSchema", () => {
  it("should validate a minimal spec", () => {
    const data = {
      inputs: { segmentations3D: ["model-id"], detectorName: "my-detector" },
      outputs: [TrainingS3DOutputsCreate.DETECTOR],
    };
    expect(() => TrainingS3DSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should validate a full spec", () => {
    const data = {
      inputs: { segmentations3D: ["model-id"], preset: "path/to/preset", detectorName: "my-detector" },
      outputs: [TrainingS3DOutputsCreate.DETECTOR],
      options: {
        epochs: 3,
        spacing: 2.0,
        model: Segmentation3DTrainingModel.SPLATNET,
        features: [PointCloudFeature.INTENSITY],
        versionNumber: "2.1",
      },
    };
    expect(() => TrainingS3DSpecificationsCreateSchema.parse(data)).not.to.throw();
  });
});

describe("TrainingS3DSpecificationsSchema", () => {
  it("should validate a full specification", () => {
    const data = {
      inputs: { segmentations3D: ["model-id"], detectorName: "my-detector" },
      outputs: { detector: "det-id" },
      options: { epochs: 2, spacing: 0.1 },
    };
    expect(() => TrainingS3DSpecificationsSchema.parse(data)).not.to.throw();
  });

  it("should fail if outputs is invalid", () => {
    const data = {
      inputs: { segmentations3D: ["model-id"], detectorName: "my-detector" },
      outputs: {},
    };
    expect(() => TrainingS3DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

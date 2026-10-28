import { expect } from "chai";
import { z } from "zod";
import {
  TrainingO2DInputsSchema,
  TrainingO2DOutputsSchema,
  TrainingO2DOptionsSchema,
  TrainingO2DOutputsCreate,
  ImageFeature,
  TrainingO2DSpecificationsCreateSchema,
  TrainingO2DSpecificationsSchema,
  TrainingS3DInputsSchema,
  TrainingS3DOutputsSchema,
  TrainingS3DOptionsSchema,
  TrainingS3DOutputsCreate,
  Segmentation3DTrainingModel,
  PointCloudFeature,
  TrainingS3DSpecificationsCreateSchema,
  TrainingS3DSpecificationsSchema,
} from "../../specifications/training";

describe("TrainingO2DInputsSchema", () => {
  it("should validate a correct input", () => {
    const data = { scenes: ["scene-id"], detectorName: "my-detector" };
    expect(TrainingO2DInputsSchema.parse(data)).to.deep.equal(data);
  });

  it("should validate multiple scenes with a preset", () => {
    const data = {
      scenes: ["scene-id", "other-scene-id"],
      preset: "path/to/preset",
      detectorName: "my-detector",
    };
    expect(TrainingO2DInputsSchema.parse(data)).to.deep.equal(data);
  });

  it("should fail if scenes is missing", () => {
    const data = { detectorName: "my-detector" };
    expect(() => TrainingO2DInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if detectorName is missing", () => {
    const data = { scenes: ["scene-id"] };
    expect(() => TrainingO2DInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if scenes is not a list of strings", () => {
    const data = { scenes: [42], detectorName: "my-detector" };
    expect(() => TrainingO2DInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingO2DOutputsSchema", () => {
  it("should validate a detector output", () => {
    const data = { detector: "my-detector/1.0" };
    expect(TrainingO2DOutputsSchema.parse(data)).to.deep.equal(data);
  });

  it("should fail if detector is missing", () => {
    expect(() => TrainingO2DOutputsSchema.parse({})).to.throw(z.ZodError);
  });

  it("should not expose the internal metrics output", () => {
    expect(TrainingO2DOutputsSchema.shape).to.have.all.keys("detector");
    const data = { detector: "my-detector/1.0", metrics: "metrics.json" };
    expect(TrainingO2DOutputsSchema.parse(data)).to.deep.equal({ detector: "my-detector/1.0" });
  });
});

describe("TrainingO2DOptionsSchema", () => {
  it("should validate all public options", () => {
    const data = { epochs: 10, versionNumber: "1.0", features: [ImageFeature.RGB] };
    expect(TrainingO2DOptionsSchema.parse(data)).to.deep.equal(data);
  });

  it("should allow all options to be omitted", () => {
    expect(TrainingO2DOptionsSchema.parse({})).to.deep.equal({});
  });

  it("should accept a positive epoch count without the S3D upper limit", () => {
    expect(TrainingO2DOptionsSchema.parse({ epochs: 101 })).to.deep.equal({ epochs: 101 });
  });

  it("should fail if epochs is not an integer", () => {
    expect(() => TrainingO2DOptionsSchema.parse({ epochs: 3.5 })).to.throw(z.ZodError);
  });

  it("should fail if epochs is less than 1", () => {
    expect(() => TrainingO2DOptionsSchema.parse({ epochs: 0 })).to.throw(z.ZodError);
    expect(() => TrainingO2DOptionsSchema.parse({ epochs: -1 })).to.throw(z.ZodError);
  });

  it("should accept a version without a minor number", () => {
    expect(TrainingO2DOptionsSchema.parse({ versionNumber: "1" })).to.deep.equal({ versionNumber: "1" });
  });

  it("should fail if versionNumber has an invalid format", () => {
    expect(() => TrainingO2DOptionsSchema.parse({ versionNumber: "invalid" })).to.throw(z.ZodError);
    expect(() => TrainingO2DOptionsSchema.parse({ versionNumber: "1.2.3" })).to.throw(z.ZodError);
  });

  it("should fail if features contains an unsupported image feature", () => {
    expect(() => TrainingO2DOptionsSchema.parse({ features: ["NORMAL"] })).to.throw(z.ZodError);
  });

  it("should not expose the internal validation split", () => {
    expect(TrainingO2DOptionsSchema.shape).to.have.all.keys("epochs", "versionNumber", "features");
    expect(TrainingO2DOptionsSchema.parse({ epochs: 10, validationSplit: 0.2 })).to.deep.equal({ epochs: 10 });
  });
});

describe("TrainingO2DSpecificationsCreateSchema", () => {
  it("should validate a minimal specification", () => {
    const data = {
      inputs: { scenes: ["scene-id"], detectorName: "my-detector" },
      outputs: [TrainingO2DOutputsCreate.DETECTOR],
    };
    expect(TrainingO2DSpecificationsCreateSchema.parse(data)).to.deep.equal(data);
  });

  it("should validate a full specification", () => {
    const data = {
      inputs: { scenes: ["scene-id"], preset: "path/to/preset", detectorName: "my-detector" },
      outputs: [TrainingO2DOutputsCreate.DETECTOR],
      options: { epochs: 10, versionNumber: "1.0", features: [ImageFeature.RGB] },
    };
    expect(TrainingO2DSpecificationsCreateSchema.parse(data)).to.deep.equal(data);
  });

  it("should fail if the internal metrics output is requested", () => {
    const data = {
      inputs: { scenes: ["scene-id"], detectorName: "my-detector" },
      outputs: ["detector", "metrics"],
    };
    expect(() => TrainingO2DSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingO2DSpecificationsSchema", () => {
  it("should validate a minimal specification", () => {
    const data = {
      inputs: { scenes: ["scene-id"], detectorName: "my-detector" },
      outputs: { detector: "my-detector/1.0" },
    };
    expect(TrainingO2DSpecificationsSchema.parse(data)).to.deep.equal(data);
  });

  it("should validate a full specification", () => {
    const data = {
      inputs: { scenes: ["scene-id"], preset: "path/to/preset", detectorName: "my-detector" },
      outputs: { detector: "my-detector/1.0" },
      options: { epochs: 10, versionNumber: "1.0", features: [ImageFeature.RGB] },
    };
    expect(TrainingO2DSpecificationsSchema.parse(data)).to.deep.equal(data);
  });

  it("should fail if the detector output is missing", () => {
    const data = {
      inputs: { scenes: ["scene-id"], detectorName: "my-detector" },
      outputs: {},
    };
    expect(() => TrainingO2DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

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

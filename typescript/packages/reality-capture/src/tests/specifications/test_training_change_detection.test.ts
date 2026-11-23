import { expect } from "chai";
import { z } from "zod";
import {
  Segmentation3DPairSchema,
  TrainingChangeDetectionInputsSchema,
  TrainingChangeDetectionOutputsSchema,
  TrainingChangeDetectionOptionsSchema,
  TrainingChangeDetectionOutputsCreate,
  TrainingChangeDetectionSpecificationsCreateSchema,
  TrainingChangeDetectionSpecificationsSchema,
  ChangeDetectionTrainingModel,
  ChangeDetectionPointCloudFeature,
} from "../../specifications/training";

describe("Segmentation3DPairSchema", () => {
  it("should validate a correct pair", () => {
    const data = { segmentation3DA: "csA-id", segmentation3DB: "csB-id" };
    expect(() => Segmentation3DPairSchema.parse(data)).not.to.throw();
  });

  it("should fail if segmentation3DA is missing", () => {
    const data = { segmentation3DB: "csB-id" };
    expect(() => Segmentation3DPairSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if segmentation3DB is missing", () => {
    const data = { segmentation3DA: "csA-id" };
    expect(() => Segmentation3DPairSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingChangeDetectionInputsSchema", () => {
  it("should validate a correct input", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
      ],
      detectorName: "my-cd-detector",
    };
    expect(() => TrainingChangeDetectionInputsSchema.parse(data)).not.to.throw();
  });

  it("should validate a correct input with preset", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
      ],
      preset: "path/to/preset",
      detectorName: "my-cd-detector",
    };
    expect(() => TrainingChangeDetectionInputsSchema.parse(data)).not.to.throw();
  });

  it("should validate with multiple pairs", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA1", segmentation3DB: "csB1" },
        { segmentation3DA: "csA2", segmentation3DB: "csB2" },
      ],
      detectorName: "my-cd-detector",
    };
    expect(() => TrainingChangeDetectionInputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if segmentation3DPairs is missing", () => {
    const data = { detectorName: "my-cd-detector" };
    expect(() => TrainingChangeDetectionInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if detectorName is missing", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
      ],
    };
    expect(() => TrainingChangeDetectionInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingChangeDetectionOutputsSchema", () => {
  it("should validate a correct output", () => {
    const data = { detector: "det-id" };
    expect(() => TrainingChangeDetectionOutputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if detector is missing", () => {
    const data = {};
    expect(() => TrainingChangeDetectionOutputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingChangeDetectionOptionsSchema", () => {
  it("should validate correct options", () => {
    const data = {
      epochs: 10,
      spacing: 0.5,
      model: ChangeDetectionTrainingModel.POINT_TRANSFORMER_V3,
      features: [ChangeDetectionPointCloudFeature.RGB, ChangeDetectionPointCloudFeature.NORMAL],
      versionNumber: "1.0",
    };
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).not.to.throw();
  });

  it("should accept partial data", () => {
    const data = {};
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).not.to.throw();
  });

  it("should fail if epochs is not an int", () => {
    const data = { epochs: 3.5 };
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is < 1", () => {
    const data = { epochs: 0 };
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is > 100", () => {
    const data = { epochs: 101 };
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if spacing is <= 0", () => {
    const data = { spacing: 0 };
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if versionNumber has invalid format", () => {
    const data = { versionNumber: "abc" };
    expect(() => TrainingChangeDetectionOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should accept valid versionNumber formats", () => {
    expect(() => TrainingChangeDetectionOptionsSchema.parse({ versionNumber: "1" })).not.to.throw();
    expect(() => TrainingChangeDetectionOptionsSchema.parse({ versionNumber: "2.3" })).not.to.throw();
  });
});

describe("TrainingChangeDetectionSpecificationsCreateSchema", () => {
  it("should validate a minimal spec", () => {
    const data = {
      inputs: {
        segmentation3DPairs: [
          { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
        ],
        detectorName: "my-cd-detector",
      },
      outputs: [TrainingChangeDetectionOutputsCreate.DETECTOR],
    };
    expect(() => TrainingChangeDetectionSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should validate a full spec", () => {
    const data = {
      inputs: {
        segmentation3DPairs: [
          { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
        ],
        preset: "path/to/preset",
        detectorName: "my-cd-detector",
      },
      outputs: [TrainingChangeDetectionOutputsCreate.DETECTOR],
      options: {
        epochs: 5,
        spacing: 1.0,
        model: ChangeDetectionTrainingModel.POINT_TRANSFORMER_V3,
        features: [ChangeDetectionPointCloudFeature.INTENSITY],
        versionNumber: "3.1",
      },
    };
    expect(() => TrainingChangeDetectionSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should fail if outputs contains invalid value", () => {
    const data = {
      inputs: {
        segmentation3DPairs: [
          { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
        ],
        detectorName: "my-cd-detector",
      },
      outputs: ["notValidValue"],
    };
    expect(() => TrainingChangeDetectionSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingChangeDetectionSpecificationsSchema", () => {
  it("should validate a full specification", () => {
    const data = {
      inputs: {
        segmentation3DPairs: [
          { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
        ],
        detectorName: "my-cd-detector",
      },
      outputs: { detector: "det-id" },
      options: { epochs: 2, spacing: 0.1 },
    };
    expect(() => TrainingChangeDetectionSpecificationsSchema.parse(data)).not.to.throw();
  });

  it("should fail if outputs is invalid", () => {
    const data = {
      inputs: {
        segmentation3DPairs: [
          { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
        ],
        detectorName: "my-cd-detector",
      },
      outputs: {},
    };
    expect(() => TrainingChangeDetectionSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

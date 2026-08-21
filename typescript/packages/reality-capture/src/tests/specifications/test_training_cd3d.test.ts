import { expect } from "chai";
import { z } from "zod";
import {
  Segmentation3DPairSchema,
  TrainingCD3DInputsSchema,
  TrainingCD3DOutputsSchema,
  TrainingCD3DOptionsSchema,
  TrainingCD3DOutputsCreate,
  TrainingCD3DSpecificationsCreateSchema,
  TrainingCD3DSpecificationsSchema,
  PointCloudFeature,
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

describe("TrainingCD3DInputsSchema", () => {
  it("should validate a correct input", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
      ],
      detectorName: "my-cd-detector",
    };
    expect(() => TrainingCD3DInputsSchema.parse(data)).not.to.throw();
  });

  it("should validate a correct input with preset", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
      ],
      preset: "path/to/preset",
      detectorName: "my-cd-detector",
    };
    expect(() => TrainingCD3DInputsSchema.parse(data)).not.to.throw();
  });

  it("should validate with multiple pairs", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA1", segmentation3DB: "csB1" },
        { segmentation3DA: "csA2", segmentation3DB: "csB2" },
      ],
      detectorName: "my-cd-detector",
    };
    expect(() => TrainingCD3DInputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if segmentation3DPairs is missing", () => {
    const data = { detectorName: "my-cd-detector" };
    expect(() => TrainingCD3DInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if detectorName is missing", () => {
    const data = {
      segmentation3DPairs: [
        { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
      ],
    };
    expect(() => TrainingCD3DInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingCD3DOutputsSchema", () => {
  it("should validate a correct output", () => {
    const data = { detector: "det-id" };
    expect(() => TrainingCD3DOutputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if detector is missing", () => {
    const data = {};
    expect(() => TrainingCD3DOutputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingCD3DOptionsSchema", () => {
  it("should validate correct options", () => {
    const data = {
      epochs: 10,
      spacing: 0.5,
      features: [PointCloudFeature.RGB, PointCloudFeature.NORMAL],
      ignoreClass: 0,
      versionNumber: "1.0",
    };
    expect(() => TrainingCD3DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should accept partial data", () => {
    const data = {};
    expect(() => TrainingCD3DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should fail if epochs is not an int", () => {
    const data = { epochs: 3.5 };
    expect(() => TrainingCD3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is < 1", () => {
    const data = { epochs: 0 };
    expect(() => TrainingCD3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is > 100", () => {
    const data = { epochs: 101 };
    expect(() => TrainingCD3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if spacing is <= 0", () => {
    const data = { spacing: 0 };
    expect(() => TrainingCD3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if versionNumber has invalid format", () => {
    const data = { versionNumber: "abc" };
    expect(() => TrainingCD3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should accept valid versionNumber formats", () => {
    expect(() => TrainingCD3DOptionsSchema.parse({ versionNumber: "1" })).not.to.throw();
    expect(() => TrainingCD3DOptionsSchema.parse({ versionNumber: "2.3" })).not.to.throw();
  });
});

describe("TrainingCD3DSpecificationsCreateSchema", () => {
  it("should validate a minimal spec", () => {
    const data = {
      inputs: {
        segmentation3DPairs: [
          { segmentation3DA: "csA-id", segmentation3DB: "csB-id" },
        ],
        detectorName: "my-cd-detector",
      },
      outputs: [TrainingCD3DOutputsCreate.DETECTOR],
    };
    expect(() => TrainingCD3DSpecificationsCreateSchema.parse(data)).not.to.throw();
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
      outputs: [TrainingCD3DOutputsCreate.DETECTOR],
      options: {
        epochs: 5,
        spacing: 1.0,
        features: [PointCloudFeature.INTENSITY],
        ignoreClass: 2,
        versionNumber: "3.1",
      },
    };
    expect(() => TrainingCD3DSpecificationsCreateSchema.parse(data)).not.to.throw();
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
    expect(() => TrainingCD3DSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingCD3DSpecificationsSchema", () => {
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
    expect(() => TrainingCD3DSpecificationsSchema.parse(data)).not.to.throw();
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
    expect(() => TrainingCD3DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

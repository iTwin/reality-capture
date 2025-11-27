import { expect } from "chai";
import { z } from "zod";
import {
  TrainingO2DInputsSchema,
  TrainingO2DOutputsSchema,
  TrainingO2DOptionsSchema,
  TrainingO2DOutputsCreate,
  TrainingO2DSpecificationsCreateSchema,
  TrainingO2DSpecificationsSchema,
  TrainingS3DInputsSchema,
  TrainingS3DOutputsSchema,
  TrainingS3DOptionsSchema,
  TrainingS3DOutputsCreate,
  TrainingS3DSpecificationsCreateSchema,
  TrainingS3DSpecificationsSchema,
} from "../../specifications/training";

describe("TrainingO2DInputsSchema", () => {
  it("should validate a correct input", () => {
    const data = { scene: "some-id" };
    expect(() => TrainingO2DInputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if scene is missing", () => {
    const data = {};
    expect(() => TrainingO2DInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingO2DOutputsSchema", () => {
  it("should validate a correct output with metrics", () => {
    const data = { detector: "det-id", metrics: "bkt:/metrics/path" };
    expect(() => TrainingO2DOutputsSchema.parse(data)).not.to.throw();
  });

  it("should validate a correct output without metrics", () => {
    const data = { detector: "det-id" };
    expect(() => TrainingO2DOutputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if detector is missing", () => {
    const data = { metrics: "bkt:/metrics/path" };
    expect(() => TrainingO2DOutputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if metrics does not start with bkt:", () => {
    const data = { detector: "det-id", metrics: "/metrics/path" };
    expect(() => TrainingO2DOutputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingO2DOptionsSchema", () => {
  it("should validate correct options", () => {
    const data = { epochs: 10, maxTrainingSplit: 0.8 };
    expect(() => TrainingO2DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should accept partial data", () => {
    const data = {};
    expect(() => TrainingO2DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should fail if maxTrainingSplit is <= 0", () => {
    const data = { maxTrainingSplit: 0 };
    expect(() => TrainingO2DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if maxTrainingSplit is > 1", () => {
    const data = { maxTrainingSplit: 1.1 };
    expect(() => TrainingO2DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if epochs is not an int", () => {
    const data = { epochs: 3.5 };
    expect(() => TrainingO2DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingO2DSpecificationsCreateSchema", () => {
  it("should validate a minimal spec", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: [TrainingO2DOutputsCreate.DETECTOR],
    };
    expect(() => TrainingO2DSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should validate a full spec", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: [TrainingO2DOutputsCreate.DETECTOR, TrainingO2DOutputsCreate.METRICS],
      options: { epochs: 5, maxTrainingSplit: 0.7 },
    };
    expect(() => TrainingO2DSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should fail if inputs are invalid", () => {
    const data = {
      inputs: { scene: 123 },
      outputs: [TrainingO2DOutputsCreate.DETECTOR],
    };
    expect(() => TrainingO2DSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingO2DSpecificationsSchema", () => {
  it("should validate a full specification", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: { detector: "det-id", metrics: "bkt:/metrics/path" },
      options: { epochs: 10, maxTrainingSplit: 0.9 },
    };
    expect(() => TrainingO2DSpecificationsSchema.parse(data)).not.to.throw();
  });

  it("should fail if outputs is invalid", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: { detector: "det-id", metrics: "/metrics/path" },
    };
    expect(() => TrainingO2DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingS3DInputsSchema", () => {
  it("should validate a correct input", () => {
    const data = { scene: "scene-id" };
    expect(() => TrainingS3DInputsSchema.parse(data)).not.to.throw();
  });

  it("should fail if scene is missing", () => {
    const data = {};
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
    const data = { epochs: 10, spacing: 0.5, maxTrainingSplit: 0.7 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should accept partial data", () => {
    const data = {};
    expect(() => TrainingS3DOptionsSchema.parse(data)).not.to.throw();
  });

  it("should fail if maxTrainingSplit is <= 0", () => {
    const data = { maxTrainingSplit: 0 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if maxTrainingSplit is > 1", () => {
    const data = { maxTrainingSplit: 1.2 };
    expect(() => TrainingS3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("TrainingS3DSpecificationsCreateSchema", () => {
  it("should validate a minimal spec", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: [TrainingS3DOutputsCreate.DETECTOR],
    };
    expect(() => TrainingS3DSpecificationsCreateSchema.parse(data)).not.to.throw();
  });

  it("should validate a full spec", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: [TrainingS3DOutputsCreate.DETECTOR],
      options: { epochs: 3, spacing: 2.0, maxTrainingSplit: 0.5 },
    };
    expect(() => TrainingS3DSpecificationsCreateSchema.parse(data)).not.to.throw();
  });
});

describe("TrainingS3DSpecificationsSchema", () => {
  it("should validate a full specification", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: { detector: "det-id" },
      options: { epochs: 2, spacing: 0.1, maxTrainingSplit: 0.99 },
    };
    expect(() => TrainingS3DSpecificationsSchema.parse(data)).not.to.throw();
  });

  it("should fail if outputs is invalid", () => {
    const data = {
      inputs: { scene: "scene-id" },
      outputs: {},
    };
    expect(() => TrainingS3DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

import { expect } from "chai";
import { z } from "zod";
import {
  EvalO2DInputsSchema,
  EvalO2DOutputsSchema,
  EvalO2DOptionsSchema,
  EvalO2DSpecificationsCreateSchema,
  EvalO2DSpecificationsSchema,
  EvalO2DOutputsCreate,
} from "../../src/specifications/eval_o2d";

describe("EvalO2DInputsSchema", () => {
  it("should validate correct inputs", () => {
    const valid = {
      reference: "someReferenceId",
      prediction: "somePredictionId",
    };
    expect(() => EvalO2DInputsSchema.parse(valid)).to.not.throw();
  });

  it("should fail if missing reference", () => {
    const invalid = {
      prediction: "somePredictionId",
    };
    expect(() => EvalO2DInputsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should fail if missing prediction", () => {
    const invalid = {
      reference: "someReferenceId",
    };
    expect(() => EvalO2DInputsSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("EvalO2DOutputsSchema", () => {
  it("should validate outputs with report and objects2D", () => {
    const valid = {
      report: "bkt:/path/to/report.json",
      objects2D: "someObjects2DId",
    };
    expect(() => EvalO2DOutputsSchema.parse(valid)).to.not.throw();
  });

  it("should validate outputs with only report", () => {
    const valid = {
      report: "bkt:/path/to/report.json",
    };
    expect(() => EvalO2DOutputsSchema.parse(valid)).to.not.throw();
  });

  it("should validate outputs with only objects2D", () => {
    const valid = {
      objects2D: "someObjects2DId",
    };
    expect(() => EvalO2DOutputsSchema.parse(valid)).to.not.throw();
  });

  it("should fail if report is not prefixed by bkt:", () => {
    const invalid = {
      report: "/path/to/report.json",
    };
    expect(() => EvalO2DOutputsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should allow empty outputs", () => {
    expect(() => EvalO2DOutputsSchema.parse({})).to.not.throw();
  });
});

describe("EvalO2DOptionsSchema", () => {
  it("should validate with thresholdIOU defined", () => {
    expect(() => EvalO2DOptionsSchema.parse({ thresholdIOU: 0.5 })).to.not.throw();
  });

  it("should validate with thresholdIOU missing", () => {
    expect(() => EvalO2DOptionsSchema.parse({})).to.not.throw();
  });

  it("should fail if thresholdIOU is not a number", () => {
    expect(() => EvalO2DOptionsSchema.parse({ thresholdIOU: "high" })).to.throw(z.ZodError);
  });
});

describe("EvalO2DSpecificationsCreateSchema", () => {
  it("should validate correct specification creation", () => {
    const valid = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: [EvalO2DOutputsCreate.REPORT, EvalO2DOutputsCreate.OBJECTS2D],
      options: { thresholdIOU: 0.3 },
    };
    expect(() => EvalO2DSpecificationsCreateSchema.parse(valid)).to.not.throw();
  });

  it("should fail if outputs are not valid enum values", () => {
    const invalid = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: ["invalidOutput"],
    };
    expect(() => EvalO2DSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should validate without options", () => {
    const valid = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: [EvalO2DOutputsCreate.REPORT],
    };
    expect(() => EvalO2DSpecificationsCreateSchema.parse(valid)).to.not.throw();
  });
});

describe("EvalO2DSpecificationsSchema", () => {
  it("should validate full specification", () => {
    const valid = {
      inputs: { reference: "refId", prediction: "predId" },
      outputs: { report: "bkt:/path.json", objects2D: "objId" },
      options: { thresholdIOU: 0.75 },
    };
    expect(() => EvalO2DSpecificationsSchema.parse(valid)).to.not.throw();
  });

  it("should validate specification without options", () => {
    const valid = {
      inputs: { reference: "refId", prediction: "predId" },
      outputs: { report: "bkt:/path.json" },
    };
    expect(() => EvalO2DSpecificationsSchema.parse(valid)).to.not.throw();
  });

  it("should fail if inputs are missing", () => {
    const invalid = {
      outputs: { report: "bkt:/path.json" },
    };
    expect(() => EvalO2DSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should fail if outputs are missing", () => {
    const invalid = {
      inputs: { reference: "refId", prediction: "predId" },
    };
    expect(() => EvalO2DSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

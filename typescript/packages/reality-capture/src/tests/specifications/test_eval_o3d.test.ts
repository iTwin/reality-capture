import { expect } from "chai";
import { z } from "zod";
import {
  EvalO3DInputsSchema,
  EvalO3DOutputsSchema,
  EvalO3DOptionsSchema,
  EvalO3DSpecificationsCreateSchema,
  EvalO3DSpecificationsSchema,
  EvalO3DOutputsCreate,
} from "../../specifications/eval_o3d";

describe("EvalO3DInputsSchema", () => {
  it("should validate correct input objects", () => {
    const data = {
      reference: "someReferenceId",
      prediction: "somePredictionId",
    };
    expect(() => EvalO3DInputsSchema.parse(data)).to.not.throw();
  });

  it("should fail when missing reference", () => {
    const data = {
      prediction: "somePredictionId",
    };
    expect(() => EvalO3DInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("EvalO3DOutputsSchema", () => {
  it("should validate with correct report format and objects3d", () => {
    const data = {
      report: "bkt:/my/report.json",
      objects3d: "someObjectId",
    };
    expect(() => EvalO3DOutputsSchema.parse(data)).to.not.throw();
  });

  it("should validate with only report", () => {
    const data = {
      report: "bkt:/my/report.json",
    };
    expect(() => EvalO3DOutputsSchema.parse(data)).to.not.throw();
  });

  it("should fail with invalid report format", () => {
    const data = {
      report: "/my/report.json",
    };
    expect(() => EvalO3DOutputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should validate with only objects3d", () => {
    const data = {
      objects3d: "someObjectId",
    };
    expect(() => EvalO3DOutputsSchema.parse(data)).to.not.throw();
  });

  it("should validate with empty object", () => {
    expect(() => EvalO3DOutputsSchema.parse({})).to.not.throw();
  });
});

describe("EvalO3DOptionsSchema", () => {
  it("should validate with thresholdIOU", () => {
    const data = {
      thresholdIOU: 0.5,
    };
    expect(() => EvalO3DOptionsSchema.parse(data)).to.not.throw();
  });

  it("should validate with empty object", () => {
    expect(() => EvalO3DOptionsSchema.parse({})).to.not.throw();
  });

  it("should fail when thresholdIOU is not a number", () => {
    const data = {
      thresholdIOU: "high",
    };
    expect(() => EvalO3DOptionsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("EvalO3DSpecificationsCreateSchema", () => {
  it("should validate with all required fields", () => {
    const data = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: [EvalO3DOutputsCreate.REPORT, EvalO3DOutputsCreate.OBJECTS3D],
      options: {
        thresholdIOU: 0.7,
      },
    };
    expect(() => EvalO3DSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should validate without options", () => {
    const data = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: [EvalO3DOutputsCreate.REPORT],
    };
    expect(() => EvalO3DSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should fail with invalid outputs", () => {
    const data = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: ["invalidOutput"],
    };
    expect(() => EvalO3DSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("EvalO3DSpecificationsSchema", () => {
  it("should validate with all required fields", () => {
    const data = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: {
        report: "bkt:/report.json",
        objects3d: "objId"
      },
      options: {
        thresholdIOU: 0.8,
      },
    };
    expect(() => EvalO3DSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should validate without options", () => {
    const data = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: {
        report: "bkt:/report.json"
      },
    };
    expect(() => EvalO3DSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should fail with invalid outputs shape", () => {
    const data = {
      inputs: {
        reference: "refId",
        prediction: "predId",
      },
      outputs: {
        report: "/report.json"
      },
    };
    expect(() => EvalO3DSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});

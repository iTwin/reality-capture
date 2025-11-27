import { expect } from "chai";
import { z } from "zod";
import {
  EvalS2DInputsSchema,
  EvalS2DOutputsSchema,
  EvalS2DOutputsCreate,
  EvalS2DSpecificationsCreateSchema,
  EvalS2DSpecificationsSchema,
  EvalS2DInputs,
  EvalS2DOutputs,
  EvalS2DSpecificationsCreate,
  EvalS2DSpecifications
} from "../../src/specifications/eval_s2d";

describe("EvalS2DInputsSchema", () => {
  it("should validate correct inputs", () => {
    const valid: EvalS2DInputs = {
      reference: "ref-123",
      prediction: "pred-456"
    };
    expect(() => EvalS2DInputsSchema.parse(valid)).not.to.throw();
  });

  it("should fail when reference is missing", () => {
    const invalid = { prediction: "pred-456" };
    expect(() => EvalS2DInputsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should fail when prediction is missing", () => {
    const invalid = { reference: "ref-123" };
    expect(() => EvalS2DInputsSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("EvalS2DOutputsSchema", () => {
  it("should validate correct outputs with all fields", () => {
    const valid: EvalS2DOutputs = {
      report: "bkt:reports/report.json",
      segmentedPhotos: "seg-789",
      segmentation2D: "seg2d-741"
    };
    expect(() => EvalS2DOutputsSchema.parse(valid)).not.to.throw();
  });

  it("should validate outputs with only report", () => {
    const valid: EvalS2DOutputs = {
      report: "bkt:reports/report.json"
    };
    expect(() => EvalS2DOutputsSchema.parse(valid)).not.to.throw();
  });

  it("should fail if report is not a bucket path", () => {
    const invalid: EvalS2DOutputs = {
      report: "wrong-format"
    };
    expect(() => EvalS2DOutputsSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should validate outputs with only segmentedPhotos", () => {
    const valid: EvalS2DOutputs = {
      segmentedPhotos: "seg-789"
    };
    expect(() => EvalS2DOutputsSchema.parse(valid)).not.to.throw();
  });

  it("should validate outputs with only segmentation2D", () => {
    const valid: EvalS2DOutputs = {
      segmentation2D: "seg2d-741"
    };
    expect(() => EvalS2DOutputsSchema.parse(valid)).not.to.throw();
  });
});

describe("EvalS2DOutputsCreate enum", () => {
  it("should contain correct values", () => {
    expect(EvalS2DOutputsCreate.REPORT).to.equal("report");
    expect(EvalS2DOutputsCreate.SEGMENTED_PHOTOS).to.equal("segmentedPhotos");
    expect(EvalS2DOutputsCreate.SEGMENTATION2D).to.equal("segmentation2D");
  });
});

describe("EvalS2DSpecificationsCreateSchema", () => {
  it("should validate correct specification create input", () => {
    const valid: EvalS2DSpecificationsCreate = {
      inputs: {
        reference: "ref-123",
        prediction: "pred-456"
      },
      outputs: [EvalS2DOutputsCreate.REPORT, EvalS2DOutputsCreate.SEGMENTED_PHOTOS]
    };
    expect(() => EvalS2DSpecificationsCreateSchema.parse(valid)).not.to.throw();
  });

  it("should fail if outputs contains invalid value", () => {
    const invalid = {
      inputs: {
        reference: "ref-123",
        prediction: "pred-456"
      },
      outputs: ["invalid"]
    };
    expect(() => EvalS2DSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
  });

  it("should fail if inputs do not match schema", () => {
    const invalid = {
      inputs: {
        reference: 123,
        prediction: "pred-456"
      },
      outputs: [EvalS2DOutputsCreate.REPORT]
    };
    expect(() => EvalS2DSpecificationsCreateSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

describe("EvalS2DSpecificationsSchema", () => {
  it("should validate correct specification", () => {
    const valid: EvalS2DSpecifications = {
      inputs: {
        reference: "ref-123",
        prediction: "pred-456"
      },
      outputs: {
        report: "bkt:reports/report.json",
        segmentedPhotos: "seg-789",
        segmentation2D: "seg2d-741"
      }
    };
    expect(() => EvalS2DSpecificationsSchema.parse(valid)).not.to.throw();
  });

  it("should fail if outputs do not match schema", () => {
    const invalid = {
      inputs: {
        reference: "ref-123",
        prediction: "pred-456"
      },
      outputs: {
        report: "wrong-format"
      }
    };
    expect(() => EvalS2DSpecificationsSchema.parse(invalid)).to.throw(z.ZodError);
  });
});

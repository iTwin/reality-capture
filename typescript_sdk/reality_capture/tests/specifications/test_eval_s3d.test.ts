/*import { expect } from "chai";
import { z } from "zod";

import {
  EvalS3DInputsSchema,
  EvalS3DOutputsSchema,
  EvalS3DOutputsCreate,
  EvalS3DSpecificationsCreateSchema,
  EvalS3DSpecificationsSchema,
} from "../../src/specifications/eval_s3d";

describe("EvalS3DInputsSchema", () => {
  it("should validate correct inputs", () => {
    const input = {
      reference: "ref-id",
      prediction: "pred-id",
    };
    expect(() => EvalS3DInputsSchema.parse(input)).to.not.throw();
  });

  it("should fail when missing reference", () => {
    const input = {
      prediction: "pred-id",
    };
    expect(() => EvalS3DInputsSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should fail when missing prediction", () => {
    const input = {
      reference: "ref-id",
    };
    expect(() => EvalS3DInputsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("EvalS3DOutputsSchema", () => {
  it("should validate with no outputs (all optional)", () => {
    expect(() => EvalS3DOutputsSchema.parse({})).to.not.throw();
  });

  it("should validate correct report output", () => {
    expect(() =>
      EvalS3DOutputsSchema.parse({ report: "bkt:some/path.json" })
    ).to.not.throw();
  });

  it("should fail if report does not match regex", () => {
    expect(() =>
      EvalS3DOutputsSchema.parse({ report: "some/path.json" })
    ).to.throw(z.ZodError);
  });

  it("should validate correct segmentedPointCloud output", () => {
    expect(() =>
      EvalS3DOutputsSchema.parse({ segmentedPointCloud: "cloud-id" })
    ).to.not.throw();
  });

  it("should validate correct segmentation3D output", () => {
    expect(() =>
      EvalS3DOutputsSchema.parse({ segmentation3D: "scene-id" })
    ).to.not.throw();
  });

  it("should validate multiple outputs together", () => {
    expect(() =>
      EvalS3DOutputsSchema.parse({
        report: "bkt:my/report.json",
        segmentedPointCloud: "cloud-id",
        segmentation3D: "scene-id",
      })
    ).to.not.throw();
  });
});

describe("EvalS3DOutputsCreate enum", () => {
  it("should have the right values", () => {
    expect(EvalS3DOutputsCreate.REPORT).to.equal("report");
    expect(EvalS3DOutputsCreate.SEGMENTED_POINT_CLOUD).to.equal("segmentedPointCloud");
    expect(EvalS3DOutputsCreate.SEGMENTATION3D).to.equal("segmentation3D");
  });
});

describe("EvalS3DSpecificationsCreateSchema", () => {
  it("should validate correct specification", () => {
    const input = {
      inputs: {
        reference: "ref-id",
        prediction: "pred-id",
      },
      outputs: [
        EvalS3DOutputsCreate.REPORT,
        EvalS3DOutputsCreate.SEGMENTED_POINT_CLOUD,
      ],
    };
    expect(() => EvalS3DSpecificationsCreateSchema.parse(input)).to.not.throw();
  });

  it("should fail with incorrect outputs", () => {
    const input = {
      inputs: {
        reference: "ref-id",
        prediction: "pred-id",
      },
      outputs: ["not-an-output"],
    };
    expect(() => EvalS3DSpecificationsCreateSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should fail if inputs are invalid", () => {
    const input = {
      inputs: {
        reference: "ref-id",
      },
      outputs: [EvalS3DOutputsCreate.REPORT],
    };
    expect(() => EvalS3DSpecificationsCreateSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("EvalS3DSpecificationsSchema", () => {
  it("should validate correct specification", () => {
    const input = {
      inputs: {
        reference: "ref-id",
        prediction: "pred-id",
      },
      outputs: {
        report: "bkt:my/report.json",
        segmentedPointCloud: "cloud-id",
        segmentation3D: "scene-id",
      },
    };
    expect(() => EvalS3DSpecificationsSchema.parse(input)).to.not.throw();
  });

  it("should fail if inputs are invalid", () => {
    const input = {
      inputs: {
        reference: "ref-id",
      },
      outputs: {},
    };
    expect(() => EvalS3DSpecificationsSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should fail if outputs are invalid", () => {
    const input = {
      inputs: {
        reference: "ref-id",
        prediction: "pred-id",
      },
      outputs: {
        report: "not-a-bucket-url",
      },
    };
    expect(() => EvalS3DSpecificationsSchema.parse(input)).to.throw(z.ZodError);
  });
});*/
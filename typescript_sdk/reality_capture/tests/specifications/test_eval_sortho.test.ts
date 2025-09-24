/*import { expect } from "chai";
import { z } from "zod";

import {
  EvalSOrthoOutputsCreate,
  EvalSOrthoInputsSchema,
  EvalSOrthoOutputsSchema,
  EvalSOrthoSpecificationsCreateSchema,
  EvalSOrthoSpecificationsSchema,
} from "../../src/specifications/eval_sortho";

describe("EvalSOrthoInputsSchema", () => {
  it("should validate correct inputs", () => {
    const input = {
      reference: "ref123",
      prediction: "pred456",
    };
    expect(() => EvalSOrthoInputsSchema.parse(input)).to.not.throw();
  });

  it("should reject missing reference", () => {
    const input = { prediction: "pred456" };
    expect(() => EvalSOrthoInputsSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should reject missing prediction", () => {
    const input = { reference: "ref123" };
    expect(() => EvalSOrthoInputsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("EvalSOrthoOutputsSchema", () => {
  it("should validate outputs with all fields", () => {
    const output = {
      report: "bkt:my-report.json",
      segmentedPhotos: "segmented-photos-id",
      segmentation2D: "segmentation2d-id",
    };
    expect(() => EvalSOrthoOutputsSchema.parse(output)).to.not.throw();
  });

  it("should validate outputs with only report", () => {
    const output = {
      report: "bkt:report.json",
    };
    expect(() => EvalSOrthoOutputsSchema.parse(output)).to.not.throw();
  });

  it("should fail if report does not match regex", () => {
    const output = {
      report: "notbucket:path.json",
    };
    expect(() => EvalSOrthoOutputsSchema.parse(output)).to.throw(z.ZodError);
  });

  it("should allow outputs with only segmentedPhotos", () => {
    const output = {
      segmentedPhotos: "segmented-photos-id",
    };
    expect(() => EvalSOrthoOutputsSchema.parse(output)).to.not.throw();
  });

  it("should allow outputs with only segmentation2D", () => {
    const output = {
      segmentation2D: "segmentation2d-id",
    };
    expect(() => EvalSOrthoOutputsSchema.parse(output)).to.not.throw();
  });
});

describe("EvalSOrthoSpecificationsCreateSchema", () => {
  it("should validate correct specification creation", () => {
    const data = {
      inputs: {
        reference: "ref1",
        prediction: "pred1",
      },
      outputs: [
        EvalSOrthoOutputsCreate.REPORT,
        EvalSOrthoOutputsCreate.SEGMENTED_PHOTOS,
      ],
    };
    expect(() => EvalSOrthoSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should reject invalid outputs", () => {
    const data = {
      inputs: {
        reference: "ref1",
        prediction: "pred1",
      },
      outputs: ["invalidOutput"],
    };
    expect(() => EvalSOrthoSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should reject missing inputs", () => {
    const data = {
      outputs: [EvalSOrthoOutputsCreate.REPORT],
    };
    expect(() => EvalSOrthoSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("EvalSOrthoSpecificationsSchema", () => {
  it("should validate correct specification", () => {
    const data = {
      inputs: {
        reference: "ref1",
        prediction: "pred1",
      },
      outputs: {
        report: "bkt:report.json",
        segmentedPhotos: "segmented-photos-id",
      },
    };
    expect(() => EvalSOrthoSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should reject missing outputs", () => {
    const data = {
      inputs: {
        reference: "ref1",
        prediction: "pred1",
      },
    };
    expect(() => EvalSOrthoSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should reject invalid outputs", () => {
    const data = {
      inputs: {
        reference: "ref1",
        prediction: "pred1",
      },
      outputs: {
        report: "notbkt:path.json",
      },
    };
    expect(() => EvalSOrthoSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});*/
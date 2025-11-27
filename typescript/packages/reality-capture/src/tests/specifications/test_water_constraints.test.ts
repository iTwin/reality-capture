import { expect } from "chai";
import { z } from "zod";
import {
  WaterConstraintsInputsSchema,
  WaterConstraintsOptionsSchema,
  WaterConstraintsOutputsSchema,
  WaterConstraintsSpecificationsCreateSchema,
  WaterConstraintsSpecificationsSchema,
  WaterConstraintsCostSchema,
  WaterConstraintsOutputsCreate,
} from "../../specifications/water_constraints";

describe("WaterConstraintsInputsSchema", () => {
  it("should validate correct input", () => {
    const input = {
      scene: "scene-id",
      modelingReference: "modeling-ref-id",
    };
    expect(() => WaterConstraintsInputsSchema.parse(input)).not.to.throw();
  });

  it("should fail with missing fields", () => {
    const input = {};
    expect(() => WaterConstraintsInputsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("WaterConstraintsOptionsSchema", () => {
  it("should validate with forceHorizontal true", () => {
    const input = { forceHorizontal: true };
    expect(() => WaterConstraintsOptionsSchema.parse(input)).not.to.throw();
  });

  it("should validate with forceHorizontal false", () => {
    const input = { forceHorizontal: false };
    expect(() => WaterConstraintsOptionsSchema.parse(input)).not.to.throw();
  });

  it("should validate with forceHorizontal omitted", () => {
    const input = {};
    expect(() => WaterConstraintsOptionsSchema.parse(input)).not.to.throw();
  });

  it("should fail with wrong type", () => {
    const input = { forceHorizontal: "yes" };
    expect(() => WaterConstraintsOptionsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("WaterConstraintsOutputsSchema", () => {
  it("should validate correct constraint", () => {
    const input = { constraints: "bkt:some/path" };
    expect(() => WaterConstraintsOutputsSchema.parse(input)).not.to.throw();
  });

  it("should fail on wrong constraints format", () => {
    const input = { constraints: "wrong:path" };
    expect(() => WaterConstraintsOutputsSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should fail on missing constraints", () => {
    const input = {};
    expect(() => WaterConstraintsOutputsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("WaterConstraintsSpecificationsCreateSchema", () => {
  it("should validate with correct fields", () => {
    const input = {
      inputs: {
        scene: "scene-id",
        modelingReference: "modeling-ref-id",
      },
      outputs: [WaterConstraintsOutputsCreate.CONSTRAINTS],
      options: { forceHorizontal: true },
    };
    expect(() => WaterConstraintsSpecificationsCreateSchema.parse(input)).not.to.throw();
  });

  it("should validate without options", () => {
    const input = {
      inputs: {
        scene: "scene-id",
        modelingReference: "modeling-ref-id",
      },
      outputs: [WaterConstraintsOutputsCreate.CONSTRAINTS],
    };
    expect(() => WaterConstraintsSpecificationsCreateSchema.parse(input)).not.to.throw();
  });

  it("should fail with incorrect outputs", () => {
    const input = {
      inputs: {
        scene: "scene-id",
        modelingReference: "modeling-ref-id",
      },
      outputs: ["wrong_output"],
    };
    expect(() => WaterConstraintsSpecificationsCreateSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("WaterConstraintsSpecificationsSchema", () => {
  it("should validate correct fields", () => {
    const input = {
      inputs: {
        scene: "scene-id",
        modelingReference: "modeling-ref-id",
      },
      outputs: {
        constraints: "bkt:some/path",
      },
      options: { forceHorizontal: true },
    };
    expect(() => WaterConstraintsSpecificationsSchema.parse(input)).not.to.throw();
  });

  it("should fail with incorrect outputs", () => {
    const input = {
      inputs: {
        scene: "scene-id",
        modelingReference: "modeling-ref-id",
      },
      outputs: {
        constraints: "wrong:path",
      },
    };
    expect(() => WaterConstraintsSpecificationsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("WaterConstraintsCostSchema", () => {
  it("should validate correct gpix value", () => {
    const input = { gpix: 42.5 };
    expect(() => WaterConstraintsCostSchema.parse(input)).not.to.throw();
  });

  it("should fail with negative gpix value", () => {
    const input = { gpix: -1 };
    expect(() => WaterConstraintsCostSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should fail with non-number gpix", () => {
    const input = { gpix: "not-a-number" };
    expect(() => WaterConstraintsCostSchema.parse(input)).to.throw(z.ZodError);
  });
});
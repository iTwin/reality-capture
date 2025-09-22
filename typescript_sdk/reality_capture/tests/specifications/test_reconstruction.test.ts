import { expect } from "chai";
import { z } from "zod";
import {
  ReconstructionInputsSchema,
  ReconstructionOutputsSchema,
  ReconstructionOutputsCreateSchema,
  ReconstructionSpecificationsCreateSchema,
  ReconstructionSpecificationsSchema,
  ReconstructionCostSchema,
} from "../../src/specifications/reconstruction";

// Mock dependencies for ModelingReferenceSchema, TilingOptionsSchema, ExportSchema, ExportCreateSchema
const ModelingReferenceMock = { id: "mockModelRef" };
const ExportMock = { id: "mockExport" };
const ExportCreateMock = { type: "mockType" };
const TilingOptionsMock = { option: "mockOption" };

describe("ReconstructionInputsSchema", () => {
  it("should pass with minimal valid input", () => {
    const data = { scene: "sceneId" };
    expect(() => ReconstructionInputsSchema.parse(data)).to.not.throw();
  });

  it("should pass with all valid fields", () => {
    const data = {
      scene: "sceneId",
      regionOfInterest: "bkt:/path/roi",
      extent: "bkt:/path/ext",
      modelingReference: "modelId",
      presets: ["preset1", "preset2"],
    };
    expect(() => ReconstructionInputsSchema.parse(data)).to.not.throw();
  });

  it("should fail if regionOfInterest does not start with bkt:", () => {
    const data = { scene: "sceneId", regionOfInterest: "/wrong/path" };
    expect(() => ReconstructionInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if extent does not start with bkt:", () => {
    const data = { scene: "sceneId", extent: "wrong:path" };
    expect(() => ReconstructionInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("ReconstructionOutputsSchema", () => {
  it("should accept modelingReference and exports", () => {
    const data = { modelingReference: ModelingReferenceMock, exports: [ExportMock] };
    expect(() => ReconstructionOutputsSchema.parse(data)).to.not.throw();
  });

  it("should accept empty object", () => {
    expect(() => ReconstructionOutputsSchema.parse({})).to.not.throw();
  });

  it("should fail if exports is not an array", () => {
    const data = { exports: "notAnArray" };
    expect(() => ReconstructionOutputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("ReconstructionOutputsCreateSchema", () => {
  it("should accept boolean modelingReference and exports array", () => {
    const data = { modelingReference: true, exports: [ExportCreateMock] };
    expect(() => ReconstructionOutputsCreateSchema.parse(data)).to.not.throw();
  });

  it("should accept empty object", () => {
    expect(() => ReconstructionOutputsCreateSchema.parse({})).to.not.throw();
  });
});

describe("ReconstructionSpecificationsCreateSchema", () => {
  it("should accept valid inputs, outputs, and options", () => {
    const data = {
      inputs: { scene: "sceneId" },
      outputs: { modelingReference: false, exports: [ExportCreateMock] },
      options: TilingOptionsMock,
    };
    expect(() => ReconstructionSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should fail if inputs missing", () => {
    const data = {
      outputs: { modelingReference: false, exports: [ExportCreateMock] },
      options: TilingOptionsMock,
    };
    expect(() => ReconstructionSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should accept without options", () => {
    const data = {
      inputs: { scene: "sceneId" },
      outputs: { modelingReference: false, exports: [ExportCreateMock] },
    };
    expect(() => ReconstructionSpecificationsCreateSchema.parse(data)).to.not.throw();
  });
});

describe("ReconstructionSpecificationsSchema", () => {
  it("should accept valid inputs, outputs, and options", () => {
    const data = {
      inputs: { scene: "sceneId" },
      outputs: { modelingReference: ModelingReferenceMock, exports: [ExportMock] },
      options: TilingOptionsMock,
    };
    expect(() => ReconstructionSpecificationsSchema.parse(data)).to.not.throw();
  });
});

describe("ReconstructionCostSchema", () => {
  it("should accept valid gpix and mpoints", () => {
    const data = { gpix: 10, mpoints: 20 };
    expect(() => ReconstructionCostSchema.parse(data)).to.not.throw();
  });

  it("should fail with negative gpix", () => {
    const data = { gpix: -1, mpoints: 10 };
    expect(() => ReconstructionCostSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail with negative mpoints", () => {
    const data = { gpix: 1, mpoints: -10 };
    expect(() => ReconstructionCostSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail when gpix or mpoints is missing", () => {
    const data = { gpix: 1 };
    expect(() => ReconstructionCostSchema.parse(data)).to.throw(z.ZodError);
  });
});
import { expect } from "chai";
import { z } from "zod";

import {
  ClearanceFootprintInputsSchema,
  ClearanceFootprintOutputsCreate,
  ClearanceFootprintOutputsSchema,
  ClearanceFootprintSpecificationsCreateSchema,
  ClearanceFootprintSpecificationsSchema,
} from "../../specifications/clearance_footprint";

describe("ClearanceFootprintInputsSchema", () => {
  it("should validate correct inputs", () => {
    expect(() => ClearanceFootprintInputsSchema.parse({ segmentation3D: "segmentation-id", objects3D: "objects-id" })).to.not.throw();
  });

  it("should reject missing required inputs", () => {
    expect(() => ClearanceFootprintInputsSchema.parse({ segmentation3D: "segmentation-id" })).to.throw(z.ZodError);
  });
});

describe("ClearanceFootprint specifications", () => {
  it("should allow empty outputs and omitted options", () => {
    expect(() => ClearanceFootprintOutputsSchema.parse({})).to.not.throw();
    expect(() => ClearanceFootprintSpecificationsSchema.parse({
      inputs: { segmentation3D: "segmentation-id", objects3D: "objects-id" },
      outputs: {},
    })).to.not.throw();
  });

  it("should validate create specifications with options", () => {
    expect(() => ClearanceFootprintSpecificationsCreateSchema.parse({
      inputs: { segmentation3D: "segmentation-id", objects3D: "objects-id" },
      outputs: [ClearanceFootprintOutputsCreate.FOOTPRINTS],
      options: { sourceLabel: "track", targetLabel: "structure" },
    })).to.not.throw();
  });
});
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
  it("should allow empty outputs", () => {
    expect(() => ClearanceFootprintOutputsSchema.parse({})).to.not.throw();
    expect(() => ClearanceFootprintSpecificationsSchema.parse({
      inputs: { segmentation3D: "segmentation-id", objects3D: "objects-id" },
      outputs: {},
    })).to.not.throw();
  });

  it("should validate create specifications", () => {
    const specifications = {
      inputs: { segmentation3D: "segmentation-id", objects3D: "objects-id" },
      outputs: [ClearanceFootprintOutputsCreate.FOOTPRINTS],
    };
    expect(ClearanceFootprintSpecificationsCreateSchema.parse(specifications)).to.deep.equal(specifications);
  });

  it("should validate result specifications", () => {
    const specifications = {
      inputs: { segmentation3D: "segmentation-id", objects3D: "objects-id" },
      outputs: { footprints: "footprints-id" },
    };
    expect(ClearanceFootprintSpecificationsSchema.parse(specifications)).to.deep.equal(specifications);
  });
});
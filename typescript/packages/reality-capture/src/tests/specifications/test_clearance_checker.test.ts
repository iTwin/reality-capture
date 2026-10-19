import { expect } from "chai";
import { z } from "zod";

import {
  ClearanceCheckerInputsSchema,
  ClearanceCheckerOutputsCreate,
  ClearanceCheckerOutputsSchema,
  ClearanceCheckerSpecificationsCreateSchema,
  ClearanceCheckerSpecificationsSchema,
} from "../../specifications/clearance_checker";

describe("ClearanceCheckerInputsSchema", () => {
  it("should validate correct inputs", () => {
    expect(() => ClearanceCheckerInputsSchema.parse({ model3D: "model-id", footprints: "footprints-id" })).to.not.throw();
  });

  it("should reject missing required inputs", () => {
    expect(() => ClearanceCheckerInputsSchema.parse({ model3D: "model-id" })).to.throw(z.ZodError);
  });
});

describe("ClearanceChecker specifications", () => {
  it("should allow an empty output response", () => {
    expect(() => ClearanceCheckerOutputsSchema.parse({})).to.not.throw();
  });

  it("should validate create and response specifications", () => {
    expect(() => ClearanceCheckerSpecificationsCreateSchema.parse({
      inputs: { model3D: "model-id", footprints: "footprints-id" },
      outputs: [ClearanceCheckerOutputsCreate.CLEARANCE],
    })).to.not.throw();
    expect(() => ClearanceCheckerSpecificationsSchema.parse({
      inputs: { model3D: "model-id", footprints: "footprints-id" },
      outputs: { clearance: "clearance-id" },
    })).to.not.throw();
  });
});
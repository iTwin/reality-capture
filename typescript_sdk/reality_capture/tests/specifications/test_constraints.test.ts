import { expect } from "chai";
import { z } from "zod";
import {
  ConstraintType,
  ConstraintToAddSchema,
  ConstraintInfoSchema,
  ConstraintsInfoSchema,
  ConstraintsInputsSchema,
  ConstraintsOutputsSchema,
  ConstraintsOutputsCreate,
  ConstraintsSpecificationsSchema,
  ConstraintsSpecificationsCreateSchema,
  ConstraintsCostSchema,
} from "../../src/specifications/constraints";

describe("ConstraintToAddSchema", () => {
  it("should pass with valid constraint", () => {
    const obj = {
      constraintPath: "bkt:/path/to/constraint.obj",
      crs: "EPSG:4326",
      type: ConstraintType.MESH,
      resolution: 0.5,
      texturePath: "bkt:/path/to/texture.jpg",
      textureSize: 1024,
      fillColor: "#FF0000",
      name: "Constraint 1",
      description: "Test constraint",
    };
    expect(() => ConstraintToAddSchema.parse(obj)).not.to.throw();
  });

  it("should fail if constraintPath does not start with bkt:", () => {
    const obj = {
      constraintPath: "/local/path/to/constraint.obj",
      crs: "EPSG:4326",
    };
    expect(() => ConstraintToAddSchema.parse(obj)).to.throw(z.ZodError);
  });

  it("should fail if texturePath is present but does not start with bkt:", () => {
    const obj = {
      constraintPath: "bkt:/path/to/constraint.obj",
      crs: "EPSG:4326",
      texturePath: "/local/path/to/texture.jpg",
    };
    expect(() => ConstraintToAddSchema.parse(obj)).to.throw(z.ZodError);
  });

  it("should allow optional fields to be omitted", () => {
    const obj = {
      constraintPath: "bkt:/path/to/constraint.obj",
      crs: "EPSG:4326",
    };
    expect(() => ConstraintToAddSchema.parse(obj)).not.to.throw();
  });
});

describe("ConstraintInfoSchema", () => {
  it("should pass with valid info", () => {
    const obj = {
      constraintPath: "bkt:/path/to/constraint.obj",
      crs: "EPSG:4326",
      id: "b5c9d1e1-5766-4058-a8a6-d1e2d1e2d1e2",
      surfaces: ["mesh1", "mesh2"],
      crsSurfaces: "EPSG:3857",
    };
    expect(() => ConstraintInfoSchema.parse(obj)).not.to.throw();
  });

  it("should fail if id is not uuid", () => {
    const obj = {
      constraintPath: "bkt:/path/to/constraint.obj",
      crs: "EPSG:4326",
      id: "not-a-uuid",
      surfaces: ["mesh1", "mesh2"],
      crsSurfaces: "EPSG:3857",
    };
    expect(() => ConstraintInfoSchema.parse(obj)).to.throw(z.ZodError);
  });
});

describe("ConstraintsInfoSchema", () => {
  it("should pass with array of valid ConstraintInfo", () => {
    const constraintInfo = {
      constraintPath: "bkt:/path/to/constraint.obj",
      crs: "EPSG:4326",
      id: "b5c9d1e1-5766-4058-a8a6-d1e2d1e2d1e2",
      surfaces: ["mesh1"],
      crsSurfaces: "EPSG:3857",
    };
    const obj = {
      constraints: [constraintInfo],
    };
    expect(() => ConstraintsInfoSchema.parse(obj)).not.to.throw();
  });
});

describe("ConstraintsInputsSchema", () => {
  it("should pass with minimum required fields", () => {
    const obj = {
      modelingReference: "model-ref-123",
    };
    expect(() => ConstraintsInputsSchema.parse(obj)).not.to.throw();
  });

  it("should pass with constraintsToDelete and constraintsToAdd", () => {
    const obj = {
      modelingReference: "model-ref-123",
      constraintsToDelete: ["b5c9d1e1-5766-4058-a8a6-d1e2d1e2d1e2"],
      constraintsToAdd: [
        {
          constraintPath: "bkt:/path/to/constraint.obj",
          crs: "EPSG:4326",
        },
      ],
    };
    expect(() => ConstraintsInputsSchema.parse(obj)).not.to.throw();
  });

  it("should fail if constraintsToDelete contains invalid UUID", () => {
    const obj = {
      modelingReference: "model-ref-123",
      constraintsToDelete: ["not-a-uuid"],
    };
    expect(() => ConstraintsInputsSchema.parse(obj)).to.throw(z.ZodError);
  });
});

describe("ConstraintsOutputsSchema", () => {
  it("should pass with valid addedConstraintsInfo path", () => {
    const obj = {
      addedConstraintsInfo: "bkt:/bucket/added_constraints_info.json",
    };
    expect(() => ConstraintsOutputsSchema.parse(obj)).not.to.throw();
  });

  it("should fail if addedConstraintsInfo does not start with bkt:", () => {
    const obj = {
      addedConstraintsInfo: "/local/path/constraints_info.json",
    };
    expect(() => ConstraintsOutputsSchema.parse(obj)).to.throw(z.ZodError);
  });
});

describe("ConstraintsOutputsCreate Enum", () => {
  it("should have correct enum value", () => {
    expect(ConstraintsOutputsCreate.ADDED_CONSTRAINTS_INFO).to.equal("addedConstraintsInfo");
  });
});

describe("ConstraintsSpecificationsSchema", () => {
  it("should pass with valid inputs and outputs", () => {
    const obj = {
      inputs: {
        modelingReference: "model-ref-123",
      },
      outputs: {
        addedConstraintsInfo: "bkt:/bucket/info.json",
      },
    };
    expect(() => ConstraintsSpecificationsSchema.parse(obj)).not.to.throw();
  });
});

describe("ConstraintsSpecificationsCreateSchema", () => {
  it("should pass with valid inputs and outputs array", () => {
    const obj = {
      inputs: {
        modelingReference: "model-ref-123",
      },
      outputs: [ConstraintsOutputsCreate.ADDED_CONSTRAINTS_INFO],
    };
    expect(() => ConstraintsSpecificationsCreateSchema.parse(obj)).not.to.throw();
  });
});

describe("ConstraintsCostSchema", () => {
  it("should pass if surface is >= 0", () => {
    expect(() => ConstraintsCostSchema.parse({ surface: 1 })).not.to.throw();
    expect(() => ConstraintsCostSchema.parse({ surface: 0 })).not.to.throw();
  });

  it("should fail if surface < 0", () => {
    expect(() => ConstraintsCostSchema.parse({ surface: -1 })).to.throw(z.ZodError);
  });
});
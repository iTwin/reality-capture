/*import { expect } from "chai";
import { z } from "zod";
import {
  PCConversionInputsSchema,
  PCConversionOutputsSchema,
  PCConversionOptionsSchema,
  PointCloudConversionSpecificationsCreateSchema,
  PointCloudConversionSpecificationsSchema,
  PCConversionOutputsCreate,
} from "../../src/specifications/point_cloud_conversion";

describe("PCConversionInputsSchema", () => {
  it("should validate correct input", () => {
    const data = { pointClouds: ["id1", "id2"] };
    expect(() => PCConversionInputsSchema.parse(data)).to.not.throw();
  });

  it("should fail if pointClouds is missing", () => {
    const data = {};
    expect(() => PCConversionInputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if pointClouds is not an array", () => {
    const data = { pointClouds: "not-an-array" };
    expect(() => PCConversionInputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("PCConversionOutputsSchema", () => {
  it("should validate with only opc", () => {
    const data = { opc: "conversion-id" };
    expect(() => PCConversionOutputsSchema.parse(data)).to.not.throw();
  });

  it("should validate with only pnts", () => {
    const data = { pnts: "conversion-id" };
    expect(() => PCConversionOutputsSchema.parse(data)).to.not.throw();
  });

  it("should fail if both opc and pnts are provided", () => {
    const data = { opc: "id", pnts: "id" };
    expect(() => PCConversionOutputsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if neither opc nor pnts is provided", () => {
    const data = {};
    expect(() => PCConversionOutputsSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("PCConversionOptionsSchema", () => {
  it("should validate with merge true", () => {
    const data = { merge: true };
    expect(() => PCConversionOptionsSchema.parse(data)).to.not.throw();
  });

  it("should validate with merge false", () => {
    const data = { merge: false };
    expect(() => PCConversionOptionsSchema.parse(data)).to.not.throw();
  });

  it("should validate with merge missing", () => {
    const data = {};
    expect(() => PCConversionOptionsSchema.parse(data)).to.not.throw();
  });
});

describe("PointCloudConversionSpecificationsCreateSchema", () => {
  it("should validate correct creation spec", () => {
    const data = {
      inputs: { pointClouds: ["id1"] },
      outputs: [PCConversionOutputsCreate.OPC, PCConversionOutputsCreate.GLB],
      options: { merge: true },
    };
    expect(() => PointCloudConversionSpecificationsCreateSchema.parse(data)).to.not.throw();
  });

  it("should fail if outputs contain an invalid value", () => {
    const data = {
      inputs: { pointClouds: ["id1"] },
      outputs: ["invalid"],
    };
    expect(() => PointCloudConversionSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if inputs is missing", () => {
    const data = {
      outputs: [PCConversionOutputsCreate.OPC],
    };
    expect(() => PointCloudConversionSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("PointCloudConversionSpecificationsSchema", () => {
  it("should validate correct spec with opc output", () => {
    const data = {
      inputs: { pointClouds: ["id1"] },
      outputs: { opc: "id" },
      options: { merge: true },
    };
    expect(() => PointCloudConversionSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should validate correct spec with pnts output", () => {
    const data = {
      inputs: { pointClouds: ["id1"] },
      outputs: { pnts: "id" },
      options: {},
    };
    expect(() => PointCloudConversionSpecificationsSchema.parse(data)).to.not.throw();
  });

  it("should fail if outputs are incorrect", () => {
    const data = {
      inputs: { pointClouds: ["id1"] },
      outputs: { opc: "id", pnts: "id" },
    };
    expect(() => PointCloudConversionSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if inputs are missing", () => {
    const data = {
      outputs: { opc: "id" },
    };
    expect(() => PointCloudConversionSpecificationsSchema.parse(data)).to.throw(z.ZodError);
  });
});*/
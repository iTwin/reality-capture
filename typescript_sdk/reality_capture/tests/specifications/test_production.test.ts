import { expect } from "chai";
import { z } from "zod";
import {
  Format,
  ColorSource,
  ThermalUnit,
  LODScope,
  LODType,
  CesiumCompression,
  I3SVersion,
  SamplingStrategy,
  LasCompression,
  ProjectionMode,
  OrthoFormat,
  DSMFormat,
  OrthoColorSource,
  ProductionInputsSchema,
  OptionsLASSchema,
  OptionsOBJSchema,
  ExportCreateSchema,
  ProductionOutputsSchema,
  ProductionSpecificationsSchema,
  ProductionCostSchema
} from "../../src/specifications/production";

describe("ProductionInputsSchema", () => {
  it("should validate minimal valid input", () => {
    const input = {
      scene: "scene-id",
      modelingReference: "ref-id",
    };
    expect(() => ProductionInputsSchema.parse(input)).to.not.throw();
  });

  it("should fail invalid extent format", () => {
    const input = {
      scene: "scene-id",
      modelingReference: "ref-id",
      extent: "invalid-format",
    };
    expect(() => ProductionInputsSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should validate with optional fields", () => {
    const input = {
      scene: "scene-id",
      modelingReference: "ref-id",
      extent: "bkt:some-path",
      presets: ["preset1", "preset2"],
    };
    expect(() => ProductionInputsSchema.parse(input)).to.not.throw();
  });
});

describe("OptionsOBJSchema", () => {
  it("should validate minimal valid input", () => {
    expect(() => OptionsOBJSchema.parse({})).to.not.throw();
  });

  it("should validate with all fields", () => {
    const input = {
      textureColorSource: ColorSource.VISIBLE,
      textureColorSourceResMin: 1,
      textureColorSourceResMax: 10,
      textureColorSourceThermalUnit: ThermalUnit.CELSIUS,
      textureColorSourceThermalMin: 20.5,
      textureColorSourceThermalMax: 50.5,
      maximumTextureSize: 1024,
      textureCompression: 80,
      textureSharpening: true,
      lodScope: LODScope.TILE_WISE,
      lodType: LODType.QUADTREE,
      crs: "EPSG:4326",
      crsOrigin: { x: 1, y: 2, z: 3 },
      doublePrecision: true,
    };
    expect(() => OptionsOBJSchema.parse(input)).to.not.throw();
  });

  it("should fail if textureCompression is out of range", () => {
    const input = {
      textureCompression: 101,
    };
    expect(() => OptionsOBJSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("ExportCreateSchema", () => {
  it("should validate minimal valid input", () => {
    const input = {
      format: Format.LAS
    };
    expect(() => ExportCreateSchema.parse(input)).to.not.throw();
  });

  it("should validate with options and name", () => {
    const input = {
      format: Format.LAS,
      options: { generateWebApp: true },
      name: "RealityData"
    };
    expect(() => ExportCreateSchema.parse(input)).to.not.throw();
  });

  it("should fail if name is too short", () => {
    const input = {
      format: Format.LAS,
      name: "ab"
    };
    expect(() => ExportCreateSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("ProductionOutputsSchema", () => {
  it("should validate with exports", () => {
    const input = {
      exports: [
        {
          format: Format.LAS,
          location: "export-location"
        }
      ]
    };
    expect(() => ProductionOutputsSchema.parse(input)).to.not.throw();
  });

  it("should fail if exports missing location", () => {
    const input = {
      exports: [
        {
          format: Format.LAS
        }
      ]
    };
    expect(() => ProductionOutputsSchema.parse(input)).to.throw(z.ZodError);
  });
});

describe("ProductionSpecificationsSchema", () => {
  it("should validate minimal valid input", () => {
    const input = {
      inputs: {
        scene: "scene-id",
        modelingReference: "ref-id"
      },
      outputs: {
        exports: [
          {
            format: Format.LAS,
            location: "export-location"
          }
        ]
      }
    };
    expect(() => ProductionSpecificationsSchema.parse(input)).to.not.throw();
  });
});

describe("ProductionCostSchema", () => {
  it("should validate minimal valid input", () => {
    const input = {
      gpix: 0,
      mpoints: 0
    };
    expect(() => ProductionCostSchema.parse(input)).to.not.throw();
  });

  it("should fail if gpix negative", () => {
    const input = {
      gpix: -1,
      mpoints: 0
    };
    expect(() => ProductionCostSchema.parse(input)).to.throw(z.ZodError);
  });

  it("should validate with geometricPrecision", () => {
    const input = {
      gpix: 10,
      mpoints: 20,
      geometricPrecision: "High"
    };
    expect(() => ProductionCostSchema.parse(input)).to.not.throw();
  });
});
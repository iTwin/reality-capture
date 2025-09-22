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
  Options3MXSchema,
  OptionsOBJSchema,
  ExportCreateSchema,
  ProductionOutputsSchema,
  ProductionSpecificationsSchema,
  ProductionCostSchema
} from "../../src/specifications/production";

describe("Enums", () => {
  it("Format should have correct values", () => {
    expect(Format.THREEMX).to.equal("3MX");
    expect(Format.FBX).to.equal("FBX");
  });

  it("ColorSource enum values", () => {
    expect(ColorSource.NO).to.equal("None");
    expect(ColorSource.VISIBLE).to.equal("Visible");
  });

  it("ThermalUnit enum values", () => {
    expect(ThermalUnit.ABSOLUTE).to.equal("Absolute");
    expect(ThermalUnit.CELSIUS).to.equal("Celsius");
  });

  it("LODScope enum values", () => {
    expect(LODScope.TILE_WISE).to.equal("TileWise");
    expect(LODScope.ACROSS_TILES).to.equal("AcrossTiles");
  });

  it("I3SVersion enum values", () => {
    expect(CesiumCompression.DRACO).to.equal("Draco");
    expect(CesiumCompression.NO).to.equal("None");
  });

  it("I3SVersion enum values", () => {
    expect(I3SVersion.V1_6).to.equal("v1_6");
    expect(I3SVersion.V1_8).to.equal("v1_8");
  });

  it("SamplingStrategy enum values", () => {
    expect(SamplingStrategy.RESOLUTION).to.equal("Resolution");
    expect(SamplingStrategy.ABSOLUTE).to.equal("Absolute");
  });

  it("LasCompression enum values", () => {
    expect(LasCompression.LAZ).to.equal("LAZ");
    expect(LasCompression.NONE).to.equal("None");
  });

  it("ProjectionMode enum values", () => {
    expect(ProjectionMode.HIGHEST_POINT).to.equal("HighestPoint");
    expect(ProjectionMode.LOWEST_POINT).to.equal("LowestPoint");
  });

  it("OrthoFormat enum values", () => {
    expect(OrthoFormat.GEOTIFF).to.equal("GeoTIFF");
    expect(OrthoFormat.JPEG).to.equal("JPEG");
    expect(OrthoFormat.KML_SUPER_OVERLAY).to.equal("KML_SuperOverlay");
    expect(OrthoFormat.NONE).to.equal("None");
  });

  it("DSMFormat enum values", () => {
    expect(DSMFormat.ASC).to.equal("ASC");
    expect(DSMFormat.GEOTIFF).to.equal("GeoTIFF");
    expect(DSMFormat.NONE).to.equal("None");
    expect(DSMFormat.XYZ).to.equal("XYZ");
  });

  it("OrthoColorSource enum values", () => {
    expect(OrthoColorSource.OPTIMIZED_COMPUTATION_THERMAL).to.equal("OptimizedComputationThermal");
    expect(OrthoColorSource.OPTIMIZED_COMPUTATION_VISIBLE).to.equal("OptimizedComputationVisible");
    expect(OrthoColorSource.REFERENCE_3D_MODEL_THERMAL).to.equal("Reference3dModelThermal");
    expect(OrthoColorSource.REFERENCE_3D_MODEL_VISIBLE).to.equal("Reference3dModelVisible");
  });
});

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

describe("Options3MXSchema", () => {
  it("should validate minimal valid input", () => {
    expect(() => Options3MXSchema.parse({})).to.not.throw();
  });

  it("should validate with all fields", () => {
    const input = {
      textureColorSource: ColorSource.VISIBLE,
      textureColorSourceResMin: 1,
      textureColorSourceResMax: 10,
      textureColorSourceThermalUnit: ThermalUnit.CELSIUS,
      textureColorSourceThermalMin: 20.5,
      textureColorSourceThermalMax: 50.5,
      crs: "EPSG:4326",
      crsOrigin: { x: 1, y: 2, z: 3 },
      lodScope: LODScope.TILE_WISE,
      generateWebApp: true,
    };
    expect(() => Options3MXSchema.parse(input)).to.not.throw();
  });

  it("should fail if textureColorSourceResMin is negative", () => {
    const input = {
      textureColorSourceResMin: -1,
    };
    expect(() => Options3MXSchema.parse(input)).to.throw(z.ZodError);
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
      format: Format.THREEMX
    };
    expect(() => ExportCreateSchema.parse(input)).to.not.throw();
  });

  it("should validate with options and name", () => {
    const input = {
      format: Format.THREEMX,
      options: { generateWebApp: true },
      name: "RealityData"
    };
    expect(() => ExportCreateSchema.parse(input)).to.not.throw();
  });

  it("should fail if name is too short", () => {
    const input = {
      format: Format.THREEMX,
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
          format: Format.THREEMX,
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
          format: Format.THREEMX
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
            format: Format.THREEMX,
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
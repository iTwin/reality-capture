import { expect } from "chai";
import { z } from "zod";
import {
  TouchLevel,
  TouchUpExportOutputsCreate,
  TouchUpImportOutputsCreate,
  TouchUpExportInputsSchema,
  TouchUpExportOptionsSchema,
  TouchUpExportOutputsSchema,
  TouchUpExportSpecificationsSchema,
  TouchUpExportSpecificationsCreateSchema,
  TouchUpExportCostSchema,
  TouchUpImportInputsSchema,
  TouchUpImportOutputsSchema,
  TouchUpImportSpecificationsCreateSchema,
  TouchUpImportSpecificationsSchema,
  TouchUpImportCostSchema,
  ImportTileInfoSchema,
  ImportInfoSchema,
} from "../../src/specifications/touchup";

describe("Touchup Specifications Schemas", () => {
  describe("TouchUpExportInputsSchema", () => {
    it("should validate minimal input", () => {
      const data = { modelingReference: "ref123" };
      expect(() => TouchUpExportInputsSchema.parse(data)).to.not.throw();
    });

    it("should validate with optional tilesToTouchUp", () => {
      const data = {
        modelingReference: "ref123",
        tilesToTouchUp: ["tile1", "tile2"],
      };
      expect(() => TouchUpExportInputsSchema.parse(data)).to.not.throw();
    });

    it("should fail if modelingReference is missing", () => {
      const data = {};
      expect(() => TouchUpExportInputsSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpExportOptionsSchema", () => {
    it("should validate empty options", () => {
      expect(() => TouchUpExportOptionsSchema.parse({})).to.not.throw();
    });

    it("should validate with all options", () => {
      const data = {
        level: TouchLevel.GEOMETRY_AND_TEXTURE,
        crs: "EPSG:4326",
      };
      expect(() => TouchUpExportOptionsSchema.parse(data)).to.not.throw();
    });
  });

  describe("TouchUpExportOutputsSchema", () => {
    it("should validate correct output", () => {
      const data = { touchUpData: "someId" };
      expect(() => TouchUpExportOutputsSchema.parse(data)).to.not.throw();
    });

    it("should fail if touchUpData missing", () => {
      const data = {};
      expect(() => TouchUpExportOutputsSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpExportSpecificationsSchema", () => {
    it("should validate correct specification", () => {
      const data = {
        inputs: { modelingReference: "ref1" },
        outputs: { touchUpData: "data1" },
        options: { crs: "CRS" },
      };
      expect(() => TouchUpExportSpecificationsSchema.parse(data)).to.not.throw();
    });

    it("should fail if inputs missing", () => {
      const data = {
        outputs: { touchUpData: "data1" },
      };
      expect(() => TouchUpExportSpecificationsSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpExportSpecificationsCreateSchema", () => {
    it("should validate with required fields", () => {
      const data = {
        inputs: { modelingReference: "ref1" },
        outputs: [TouchUpExportOutputsCreate.TOUCH_UP_DATA],
      };
      expect(() => TouchUpExportSpecificationsCreateSchema.parse(data)).to.not.throw();
    });

    it("should validate with optional options", () => {
      const data = {
        inputs: { modelingReference: "ref1" },
        outputs: [TouchUpExportOutputsCreate.TOUCH_UP_DATA],
        options: { crs: "CRS" },
      };
      expect(() => TouchUpExportSpecificationsCreateSchema.parse(data)).to.not.throw();
    });

    it("should fail if outputs is not array", () => {
      const data = {
        inputs: { modelingReference: "ref1" },
        outputs: TouchUpExportOutputsCreate.TOUCH_UP_DATA,
      };
      expect(() => TouchUpExportSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpExportCostSchema", () => {
    it("should validate with tileCount >= 0", () => {
      expect(() => TouchUpExportCostSchema.parse({ tileCount: 3 })).to.not.throw();
      expect(() => TouchUpExportCostSchema.parse({ tileCount: 0 })).to.not.throw();
    });

    it("should fail with negative tileCount", () => {
      expect(() => TouchUpExportCostSchema.parse({ tileCount: -1 })).to.throw(z.ZodError);
    });
  });

  describe("TouchUpImportInputsSchema", () => {
    it("should validate minimal input", () => {
      const data = {
        modelingReference: "refX",
        touchUpData: "dataY",
      };
      expect(() => TouchUpImportInputsSchema.parse(data)).to.not.throw();
    });

    it("should fail if touchUpData missing", () => {
      const data = { modelingReference: "refX" };
      expect(() => TouchUpImportInputsSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpImportOutputsSchema", () => {
    it("should validate with importInfo correct format", () => {
      const data = { importInfo: "bkt:bucket/path" };
      expect(() => TouchUpImportOutputsSchema.parse(data)).to.not.throw();
    });

    it("should validate with importInfo undefined", () => {
      const data = { importInfo: undefined };
      expect(() => TouchUpImportOutputsSchema.parse(data)).to.not.throw();
    });

    it("should fail if importInfo is invalid format", () => {
      const data = { importInfo: "wrongprefix:path" };
      expect(() => TouchUpImportOutputsSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpImportSpecificationsCreateSchema", () => {
    it("should validate with required fields", () => {
      const data = {
        inputs: { modelingReference: "refA", touchUpData: "dataB" },
        outputs: [TouchUpImportOutputsCreate.IMPORT_INFO],
      };
      expect(() => TouchUpImportSpecificationsCreateSchema.parse(data)).to.not.throw();
    });
  });

  describe("TouchUpImportSpecificationsSchema", () => {
    it("should validate with required fields", () => {
      const data = {
        inputs: { modelingReference: "refA", touchUpData: "dataB" },
        outputs: { importInfo: "bkt:bucket/path" },
      };
      expect(() => TouchUpImportSpecificationsSchema.parse(data)).to.not.throw();
    });

    it("should fail if importInfo format is invalid", () => {
      const data = {
        inputs: { modelingReference: "refA", touchUpData: "dataB" },
        outputs: { importInfo: "invalid:path" },
      };
      expect(() => TouchUpImportSpecificationsSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("TouchUpImportCostSchema", () => {
    it("should validate with tileCount >= 0", () => {
      expect(() => TouchUpImportCostSchema.parse({ tileCount: 1 })).to.not.throw();
      expect(() => TouchUpImportCostSchema.parse({ tileCount: 0 })).to.not.throw();
    });

    it("should fail with negative tileCount", () => {
      expect(() => TouchUpImportCostSchema.parse({ tileCount: -5 })).to.throw(z.ZodError);
    });
  });

  describe("ImportTileInfoSchema", () => {
    it("should validate correct tile info", () => {
      const data = {
        tileName: "tileXYZ",
        level: TouchLevel.GEOMETRY_AND_TEXTURE,
      };
      expect(() => ImportTileInfoSchema.parse(data)).to.not.throw();
    });

    it("should fail if level is invalid", () => {
      const data = {
        tileName: "tileXYZ",
        level: "INVALID_LEVEL",
      };
      expect(() => ImportTileInfoSchema.parse(data)).to.throw(z.ZodError);
    });
  });

  describe("ImportInfoSchema", () => {
    it("should validate with array of ImportTileInfo", () => {
      const data = {
        importInfo: [
          { tileName: "tile1", level: TouchLevel.GEOMETRY },
          { tileName: "tile2", level: TouchLevel.GEOMETRY_AND_TEXTURE },
        ],
      };
      expect(() => ImportInfoSchema.parse(data)).to.not.throw();
    });

    it("should fail if importInfo is not array", () => {
      const data = { importInfo: { tileName: "tile1", level: TouchLevel.GEOMETRY } };
      expect(() => ImportInfoSchema.parse(data)).to.throw(z.ZodError);
    });
  });
});
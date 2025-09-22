import { expect } from "chai";
import { z } from "zod";
import {
  DetectorExport,
  DetectorStatus,
  DetectorType,
  CapabilitiesSchema,
  DetectorVersionSchema,
  DetectorBaseSchema,
  DetectorSchema,
  DetectorResponseSchema,
  DetectorMinimalSchema,
  DetectorsMinimalResponseSchema,
} from "../../src/service/detectors";

describe("CapabilitiesSchema", () => {
  it("should validate correct capabilities", () => {
    const data = {
      labels: ["Car", "Tree"],
      exports: [DetectorExport.OBJECTS, DetectorExport.LINES],
    };
    expect(() => CapabilitiesSchema.parse(data)).to.not.throw();
  });
  
  it("should fail on missing labels", () => {
    const data = {
      exports: [DetectorExport.OBJECTS],
    };
    expect(() => CapabilitiesSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail on invalid export value", () => {
    const data = {
      labels: ["Car"],
      exports: ["InvalidExport"],
    };
    expect(() => CapabilitiesSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("DetectorVersionSchema", () => {
  it("should validate correct detector version", () => {
    const data = {
      creationDate: new Date().toISOString(),
      version: "1.0.0",
      status: DetectorStatus.READY,
      downloadUrl: "http://example.com",
      creatorId: "user123",
      capabilities: {
        labels: ["Car"],
        exports: [DetectorExport.OBJECTS],
      },
    };
    expect(() => DetectorVersionSchema.parse(data)).to.not.throw();
  });

  it("should fail on missing required fields", () => {
    const data = {
      version: "1.0.0",
      status: DetectorStatus.READY,
      capabilities: {
        labels: ["Car"],
        exports: [DetectorExport.OBJECTS],
      },
    };
    expect(() => DetectorVersionSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should coerce date string", () => {
    const data = {
      creationDate: "2020-01-01T00:00:00.000Z",
      version: "1.0.0",
      status: DetectorStatus.READY,
      capabilities: {
        labels: ["Car"],
        exports: [DetectorExport.OBJECTS],
      },
    };
    expect(() => DetectorVersionSchema.parse(data)).to.not.throw();
  });
});

describe("DetectorBaseSchema", () => {
  it("should validate correct detector base", () => {
    const data = {
      name: "DetectorA",
      type: DetectorType.PHOTO_OBJECT_DETECTOR,
    };
    expect(() => DetectorBaseSchema.parse(data)).to.not.throw();
  });

  it("should fail on missing type", () => {
    const data = {
      name: "DetectorA",
    };
    expect(() => DetectorBaseSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("DetectorSchema", () => {
  it("should validate detector with versions", () => {
    const data = {
      name: "DetectorA",
      type: DetectorType.PHOTO_OBJECT_DETECTOR,
      versions: [
        {
          creationDate: new Date().toISOString(),
          version: "1.0.0",
          status: DetectorStatus.READY,
          capabilities: {
            labels: ["Car"],
            exports: [DetectorExport.OBJECTS],
          },
        },
      ],
    };
    expect(() => DetectorSchema.parse(data)).to.not.throw();
  });
  it("should fail if versions is missing", () => {
    const data = {
      name: "DetectorA",
      type: DetectorType.PHOTO_OBJECT_DETECTOR,
    };
    expect(() => DetectorSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("DetectorResponseSchema", () => {
  it("should validate correct detector response", () => {
    const data = {
      detector: {
        name: "DetectorA",
        type: DetectorType.PHOTO_OBJECT_DETECTOR,
        versions: [
          {
            creationDate: new Date().toISOString(),
            version: "1.0.0",
            status: DetectorStatus.READY,
            capabilities: {
              labels: ["Car"],
              exports: [DetectorExport.OBJECTS],
            },
          },
        ],
      },
    };
    expect(() => DetectorResponseSchema.parse(data)).to.not.throw();
  });
});

describe("DetectorMinimalSchema", () => {
  it("should validate minimal detector", () => {
    const data = {
      name: "DetectorA",
      type: DetectorType.PHOTO_OBJECT_DETECTOR,
      latestVersion: "1.0.0",
    };
    expect(() => DetectorMinimalSchema.parse(data)).to.not.throw();
  });
});

describe("DetectorsMinimalResponseSchema", () => {
  it("should validate detectors minimal response", () => {
    const data = {
      detectors: [
        {
          name: "DetectorA",
          type: DetectorType.PHOTO_OBJECT_DETECTOR,
          latestVersion: "1.0.0",
        },
        {
          name: "DetectorB",
          type: DetectorType.PHOTO_SEGMENTATION_DETECTOR,
        },
      ],
    };
    expect(() => DetectorsMinimalResponseSchema.parse(data)).to.not.throw();
  });

  it("should fail if detectors field is missing", () => {
    const data = {};
    expect(() => DetectorsMinimalResponseSchema.parse(data)).to.throw(z.ZodError);
  });
});
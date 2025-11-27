import { expect } from "chai";
import { z } from "zod";
import {
  CostEstimationCreateSchema,
  CostEstimationSchema,
  getAppropriateServiceForEstimation,
  UnitType
} from "../../service/estimation";
import { CalibrationOutputsCreate } from "../../specifications/calibration"; // TODO : mock
import { JobType, Service } from "../../service/job"; // TODO : mock


describe("CostEstimationCreateSchema", () => {
  it("should validate a correct estimation object", () => {
    const validEstimation = {
      type: JobType.CALIBRATION,
      specifications: {
        inputs: {
          scene: "scene",
        },
        outputs: [CalibrationOutputsCreate.SCENE]
      },
      costParameters: {
        gpix: 1,
        mpoints: 50
      }
    };
    expect(() => CostEstimationCreateSchema.parse(validEstimation)).not.to.throw();
  });

  it("should fail validation for missing required fields", () => {
    const invalidEstimation = {
      type: JobType.CALIBRATION,
    };
    expect(() => CostEstimationCreateSchema.parse(invalidEstimation)).to.throw(z.ZodError);
  });
});

describe("CostEstimationSchema", () => {
  it("should validate a correct full estimation object", () => {
    const validEstimation = {
      type: JobType.CALIBRATION,
      specifications: {
        inputs: {
          scene: "scene",
        },
        outputs: [CalibrationOutputsCreate.SCENE]
      },
      costParameters: {
        gpix: 1,
        mpoints: 50
      }
    };
    const fullEstimation = {
      ...validEstimation,
      id: "test-id",
      estimatedUnits: 42,
      unitType: UnitType.MODELING,
    };
    expect(() => CostEstimationSchema.parse(fullEstimation)).not.to.throw();
  });

  it("should fail if missing id, estimatedUnits, or unitType", () => {
    const validEstimation = {
      type: JobType.CALIBRATION,
      specifications: {
        inputs: {
          scene: "scene",
        },
        outputs: [CalibrationOutputsCreate.SCENE]
      },
      costParameters: {
        gpix: 1,
        mpoints: 50
      }
    };
    const incompleteEstimation = {
      ...validEstimation,
      estimatedUnits: 42,
      unitType: UnitType.MODELING,
    };
    expect(() => CostEstimationSchema.parse(incompleteEstimation)).to.throw(z.ZodError);
  });
});

describe("getAppropriateServiceForEstimation", () => {
  it("should return the appropriate service for a valid estimation", () => {
    const validEstimation = {
      type: JobType.CALIBRATION,
      specifications: {
        inputs: {
          scene: "scene",
        },
        outputs: [CalibrationOutputsCreate.SCENE]
      },
      costParameters: {
        gpix: 1,
        mpoints: 50
      }
    };
    const service = getAppropriateServiceForEstimation(validEstimation);
    expect(service).to.be.a("string");
    expect(service).to.equal(Service.MODELING);
  });
});
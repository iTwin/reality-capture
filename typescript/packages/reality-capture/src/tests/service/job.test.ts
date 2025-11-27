import { expect } from "chai";
import { z } from "zod";
import {
  JobType,
  Service,
  getAppropriateService,
  JobState,
  JobCreateSchema,
  ExecutionSchema,
  JobSchema,
  JobResponseSchema,
  ProgressSchema,
  ProgressResponseSchema,
  MessageSchema,
  MessagesSchema,
  MessagesResponseSchema
} from "../../service/job";
import { ImportPCOutputsCreate } from "../../specifications/import_point_cloud"; // TODO : mock?

function getCommonFields(type: JobType) {
  return {
    id: "job1",
    name: "MyJob",
    itwinId: "itwin123",
    state: JobState.QUEUED,
    executionInfo: {
      createdDateTime: new Date(),
      startedDateTime: new Date(),
      endedDateTime: new Date(),
      processingUnits: 5
    },
    userId: "user42",
    type,
    specifications: {
      inputs: { scene: "scene" },
      outputs: [ImportPCOutputsCreate.SCAN_COLLECTION]
    }
  };
}

describe("getAppropriateService", () => {
  it("should return Service.MODELING for PRODUCTION", () => {
    expect(getAppropriateService(JobType.PRODUCTION)).to.equal(Service.MODELING);
  });

  it("should return Service.ANALYSIS for OBJECTS_2D", () => {
    expect(getAppropriateService(JobType.OBJECTS_2D)).to.equal(Service.ANALYSIS);
  });

  /*it("should return Service.CONVERSION for POINT_CLOUD_CONVERSION", () => {
    expect(getAppropriateService(JobType.POINT_CLOUD_CONVERSION)).to.equal(Service.CONVERSION);
  });*/
});

describe("JobState Enum", () => {
  it("should contain ACTIVE value", () => {
    expect(JobState.ACTIVE).to.equal("Active");
  });
});

describe("JobCreateSchema", () => {
  it("should validate a correct job create schema", () => {
    const data = {
      name: "JobName",
      type: JobType.PRODUCTION,
      specifications: {
        inputs: { scene: "scene" },
        outputs: [ImportPCOutputsCreate.SCAN_COLLECTION]
      },
      iTwinId: "itwin123"
    };
    expect(() => JobCreateSchema.parse(data)).to.not.throw();
  });

  it("should fail if type is missing", () => {
    const data = {
      name: "JobName",
      specifications: {
        inputs: { scene: "scene" },
        outputs: [ImportPCOutputsCreate.SCAN_COLLECTION]
      },
      iTwinId: "itwin123"
    };
    expect(() => JobCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if iTwinId is missing", () => {
    const data = {
      name: "JobName",
      type: JobType.PRODUCTION,
      specifications: {
        inputs: { scene: "scene" },
        outputs: [ImportPCOutputsCreate.SCAN_COLLECTION]
      },
    };
    expect(() => JobCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if name is too short", () => {
    const data = {
      name: "ab",
      type: JobType.PRODUCTION,
      specifications: {
        inputs: { scene: "scene" },
        outputs: [ImportPCOutputsCreate.SCAN_COLLECTION]
      },
      iTwinId: "itwin123"
    };
    expect(() => JobCreateSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("ExecutionSchema", () => {
  it("should validate correct execution info", () => {
    const data = {
      createdDateTime: new Date().toISOString(),
      startedDateTime: new Date().toISOString(),
      endedDateTime: new Date().toISOString(),
      processingUnits: 9
    };
    expect(() => ExecutionSchema.parse(data)).to.not.throw();
  });

  it("should allow missing startedDateTime and endedDateTime", () => {
    const data = {
      createdDateTime: new Date().toISOString(),
      processingUnits: 4
    };
    expect(() => ExecutionSchema.parse(data)).to.not.throw();
  });

  it("should allow nullable processingUnits", () => {
    const data = {
      createdDateTime: new Date().toISOString(),
      processingUnits: null
    };
    expect(() => ExecutionSchema.parse(data)).to.not.throw();
  });

  it("should fail if createdDateTime is missing", () => {
    const data = {
      processingUnits: 3
    };
    expect(() => ExecutionSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("JobResponseSchema", () => {
  it("should validate correct job response", () => {
    const data = {
      job: {
        id: "job1",
        name: "MyJob",
        itwinId: "itwin123",
        state: JobState.QUEUED,
        executionInfo: {
          createdDateTime: new Date(),
          startedDateTime: new Date(),
          endedDateTime: new Date(),
          processingUnits: 5
        },
        userId: "user42",
        type: JobType.IMPORT_POINT_CLOUD,
        specifications: {
          inputs: { scene: "scene" },
          outputs: { scanCollection: "outputId" }
        }
      }
    };
    expect(() => JobResponseSchema.parse(data)).to.not.throw();
  });
});

describe("ProgressSchema", () => {
  it("should validate correct progress info", () => {
    const data = {
      state: JobState.ACTIVE,
      percentage: 55
    };
    expect(() => ProgressSchema.parse(data)).to.not.throw();
  });

  it("should fail if percentage is out of range", () => {
    const data = {
      state: JobState.ACTIVE,
      percentage: 120
    };
    expect(() => ProgressSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("ProgressResponseSchema", () => {
  it("should validate correct progress response", () => {
    const data = {
      progress: {
        state: JobState.SUCCESS,
        percentage: 100
      }
    };
    expect(() => ProgressResponseSchema.parse(data)).to.not.throw();
  });

  it("should fail if progress is missing", () => {
    expect(() => ProgressResponseSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("MessageSchema", () => {
  it("should validate correct message", () => {
    const msg = {
      code: "ERR1",
      title: "Error title",
      message: "Error message",
      params: ["param1", "param2"]
    };
    expect(() => MessageSchema.parse(msg)).to.not.throw();
  });

  it("should fail if params is missing", () => {
    const msg = {
      code: "ERR1",
      title: "Error title",
      message: "Error message"
    };
    expect(() => MessageSchema.parse(msg)).to.throw(z.ZodError);
  });
});

describe("MessagesSchema", () => {
  it("should validate correct messages", () => {
    const data = {
      errors: [{
        code: "E1", title: "t1", message: "m1", params: []
      }],
      warnings: [{
        code: "W1", title: "t2", message: "m2", params: ["p"]
      }]
    };
    expect(() => MessagesSchema.parse(data)).to.not.throw();
  });

  it("should fail if errors field is missing", () => {
    const data = {
      warnings: []
    };
    expect(() => MessagesSchema.parse(data)).to.throw(z.ZodError);
  });
});

describe("MessagesResponseSchema", () => {
  it("should validate correct messages response", () => {
    const data = {
      messages: {
        errors: [{ code: "E1", title: "t1", message: "m1", params: [] }],
        warnings: []
      }
    };
    expect(() => MessagesResponseSchema.parse(data)).to.not.throw();
  });

  it("should fail if messages field is missing", () => {
    expect(() => MessagesResponseSchema.parse({})).to.throw(z.ZodError);
  });
});
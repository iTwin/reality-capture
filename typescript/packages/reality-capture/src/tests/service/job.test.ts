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
  MessagesResponseSchema,
  NextLinkSchema,
} from "../../service/job";

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
      outputs: { scene: "output" }
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
        inputs: { scene: "scene", modelingReference: "ref" },
        outputs: { exports: [{ format: "3DTiles" }] }
      },
      iTwinId: "itwin123"
    };
    expect(() => JobCreateSchema.parse(data)).to.not.throw();
  });

  it("should fail if type is missing", () => {
    const data = {
      name: "JobName",
      specifications: {
        inputs: { scene: "scene", modelingReference: "ref" },
        outputs: { exports: [{ format: "3DTiles" }] }
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
        inputs: { scene: "scene", modelingReference: "ref" },
        outputs: { exports: [{ format: "3DTiles" }] }
      },
    };
    expect(() => JobCreateSchema.parse(data)).to.throw(z.ZodError);
  });

  it("should fail if name is too short", () => {
    const data = {
      name: "ab",
      type: JobType.PRODUCTION,
      specifications: {
        inputs: { scene: "scene", modelingReference: "ref" },
        outputs: { exports: [{ format: "3DTiles" }] }
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
          createdDateTime: new Date().toISOString(),
          startedDateTime: new Date().toISOString(),
          endedDateTime: new Date().toISOString(),
          processingUnits: 5
        },
        userId: "user42",
        type: "TrainingS3D",
        specifications: {
          inputs: {
            segmentations3D: ["rd-001", "rd-002"],
            detectorName: "MyDetector",
          },
          outputs: { detector: "MyDetector/1.0" }
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

describe("NextLinkSchema", () => {
  it ("should validate correct next link", () => {
    const data = {
      next: {
        href: "https://api.bentley.com/reality-modeling/jobs?$filter=iTwinId%20eq%202c8e4988-eb9b-4e5f-a903-8c7c18f3030a&$top=2&continuationToken=MTRmZDkwOGYtNWEzOS00YzY3LWFmMGYtMGMxMWQxYWNkMDhl"
      }
    };
    expect(() => NextLinkSchema.parse(data)).to.not.throw();
  });

  it ("should fail if empty", () => {
    expect(() => NextLinkSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("JobSchema — type literal regression", () => {
  const activeJobTypes = Object.values(JobType);

  function makeServerPayload(type: string) {
    return {
      id: "job-regression-test",
      name: "Regression test",
      itwinId: "itwin-regression",
      state: JobState.QUEUED,
      executionInfo: {
        createdDateTime: new Date().toISOString(),
        processingUnits: null,
      },
      userId: "user-test",
      type,
      specifications: getSpecificationsForType(type),
    };
  }

  function getSpecificationsForType(type: string): Record<string, unknown> {
    const specs: Record<string, Record<string, unknown>> = {
      Calibration:              { inputs: { scene: "s1" }, outputs: { scene: "s2" } },
      ChangeDetection:          { inputs: { model3DA: "a1", model3DB: "b1" }, outputs: {} },
      Constraints:              { inputs: { modelingReference: "ref1" }, outputs: { addedConstraintsInfo: "bkt:info" } },
      EvalO2D:                  { inputs: { reference: "r1", prediction: "p1" }, outputs: {} },
      EvalO3D:                  { inputs: { reference: "r1", prediction: "p1" }, outputs: {} },
      EvalS2D:                  { inputs: { reference: "r1", prediction: "p1" }, outputs: {} },
      EvalS3D:                  { inputs: { reference: "r1", prediction: "p1" }, outputs: {} },
      EvalSOrtho:               { inputs: { reference: "r1", prediction: "p1" }, outputs: {} },
      FillImageProperties:      { inputs: {}, outputs: { scene: "s1" } },
      GaussianSplats:           { inputs: { scene: "s1" }, outputs: {} },
      ImportPointCloud:          { inputs: { scene: "s1" }, outputs: { scanCollection: "sc1" } },
      Objects2D:                { inputs: { photos: "p1", photoObjectDetector: "d1" }, outputs: { objects2D: "o1" } },
      Production:               { inputs: { scene: "s1", modelingReference: "ref1" }, outputs: { exports: [{ format: "3DTiles", location: "loc1" }] } },
      Reconstruction:           { inputs: { scene: "s1" }, outputs: {} },
      Segmentation2D:           { inputs: { photos: "p1", photoSegmentationDetector: "d1" }, outputs: { segmentation2D: "s1" } },
      Segmentation3D:           { inputs: { pointClouds: ["pc1"], pointCloudSegmentationDetector: "d1" }, outputs: { segmentation3D: "s1" } },
      SegmentationOrthophoto:   { inputs: { orthophoto: "o1", orthophotoSegmentationDetector: "d1" }, outputs: { segmentationOrthophoto: "s1" } },
      Tiling:                   { inputs: { scene: "s1" }, outputs: { modelingReference: { location: "loc1" } } },
      TrainingS3D:              { inputs: { segmentations3D: ["s1"], detectorName: "Det" }, outputs: { detector: "Det/1" } },
      TouchUpExport:            { inputs: { modelingReference: "ref1" }, outputs: { touchUpData: "t1" } },
      TouchUpImport:            { inputs: { modelingReference: "ref1", touchUpData: "t1" }, outputs: {} },
      WaterConstraints:         { inputs: { scene: "s1", modelingReference: "ref1" }, outputs: { constraints: "bkt:w1" } },
    };
    return specs[type] ?? {};
  }

  for (const jobType of activeJobTypes) {
    it(`should parse a server payload with type="${jobType}"`, () => {
      const payload = makeServerPayload(jobType);
      const result = JobSchema.parse(payload);
      expect(result.type).to.equal(jobType);
    });
  }

  it("should reject a misspelled type literal (e.g. 'TraningS3D')", () => {
    const payload = makeServerPayload("TrainingS3D");
    payload.type = "TraningS3D";
    expect(() => JobSchema.parse(payload)).to.throw(z.ZodError);
  });
});
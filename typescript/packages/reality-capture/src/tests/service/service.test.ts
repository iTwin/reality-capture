import { expect } from "chai";
import sinon from "sinon";
import { RealityCaptureService } from "../../service/service";
import type { AuthorizationClient } from "@itwin/core-common";
import { Response } from "../../service/response";
import { JobCreate, JobType, Service } from "../../service/job";
import { CostEstimationCreate } from "../../service/estimation";

describe("RealityCaptureService tests", function () {
  it("should validate RealityCaptureService urls based on environment", async () => {
    const getAccessTokenStub = sinon.stub().resolves("fake-token");
    const mockAuthClient = { getAccessToken: getAccessTokenStub } as AuthorizationClient;
    const serviceDev = new RealityCaptureService(mockAuthClient, { env: "dev" });
    const serviceQa = new RealityCaptureService(mockAuthClient, { env: "qa" });
    const serviceProd = new RealityCaptureService(mockAuthClient);
    expect((serviceDev as any)._serviceUrl).to.be.a("string").and.satisfy((url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.host === "dev-api.bentley.com";
      } catch (e) { return false; }
    });
    expect((serviceQa as any)._serviceUrl).to.be.a("string").and.satisfy((url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.host === "qa-api.bentley.com";
      } catch (e) { return false; }
    });
    expect((serviceProd as any)._serviceUrl).to.be.a("string").and.satisfy((url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.host === "api.bentley.com";
      } catch (e) { return false; }
    });
  });

  it("should validate service url", async () => {
    const getAccessTokenStub = sinon.stub().resolves("fake-token");
    const mockAuthClient = { getAccessToken: getAccessTokenStub } as AuthorizationClient;
    const service = new RealityCaptureService(mockAuthClient, { env: "dev" });
    expect((service as any)._getCorrectUrl(Service.ANALYSIS)).to.be.a("string").and.satisfy((url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" &&
          parsed.host === "dev-api.bentley.com" &&
          parsed.pathname.startsWith("/reality-analysis/");
      } catch (e) { return false; }
    });
    expect((service as any)._getCorrectUrl(Service.MODELING)).to.be.a("string").and.satisfy((url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" &&
          parsed.host === "dev-api.bentley.com" &&
          parsed.pathname.startsWith("/reality-modeling/");
      } catch (e) { return false; }
    });
    expect(() => (service as any)._getCorrectUrl("OTHER")).to.throw("Other services not yet implemented");
  });
});

describe("RealityCaptureService API calls tests", function () {
  let service: RealityCaptureService;
  let axiosPostStub: sinon.SinonStub;
  let axiosGetStub: sinon.SinonStub;
  let axiosPatchStub: sinon.SinonStub;
  let axiosDeleteStub: sinon.SinonStub;
  let getAccessTokenStub: sinon.SinonStub;
  const iTwinId = "uuidIT";

  beforeEach(() => {
    // Mock AuthorizationClient
    getAccessTokenStub = sinon.stub().resolves("fake-token");
    const mockAuthClient = { getAccessToken: getAccessTokenStub } as AuthorizationClient;

    service = new RealityCaptureService(mockAuthClient, { env: "dev" });

    // Stub axios instance methods
    axiosPostStub = sinon.stub();
    axiosGetStub = sinon.stub();
    axiosPatchStub = sinon.stub();
    axiosDeleteStub = sinon.stub();
    (service as any)._axios = {
      post: axiosPostStub,
      get: axiosGetStub,
      patch: axiosPatchStub,
      delete: axiosDeleteStub
    };

    // Reset stub history
    sinon.restore();
  });

  // getBucket tests
  it("getBucket should call axios.get and return a Response<BucketResponse>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "bucket":
        {
          "iTwinId": "uuidIT"
        },
        "_links":
        {
          "containerUrl":
          {
            "href": "https://realityprodneusa01.blob.core.windows.net/78e3a82d-076e-4d1d-b8ef-ab0625fbb856?sv=2020-08-04&se=2021-07-22T03%3A50%3A21Z&sr=c&sp=rl&sig=**removed**"
          }
        }
      }
    });
    const result = await service.getBucket(iTwinId);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.bucket.iTwinId).to.equal(iTwinId);
  });

  it("getBucket 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getBucket(iTwinId);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getBucket ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getBucket(iTwinId);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getServiceFiles tests
  it("getServiceFiles should call axios.get and return a Response<Files>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "files": [{
          "id": "File_1",
          "name": "file 1",
          "type": "Preset",
          "description": "preset file"
        },
        {
          "id": "File_2",
          "name": "file 2",
          "type": "Preset",
          "deprecated": true
        }
        ]
      }
    });
    const result = await service.getServiceFiles();
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.files).to.have.lengthOf(2);
    expect(result.value!.files[0].deprecated).to.be.undefined;
    expect(result.value!.files[0].description).to.equal("preset file");
    expect(result.value!.files[1].description).to.be.undefined;
    expect(result.value!.files[1].deprecated).to.be.true;
  });

  it("getServiceFiles 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getServiceFiles();
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getServiceFiles ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getServiceFiles();
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getDetectors tests
  it("getDetectors should call axios.get and return a Response<DetectorsMinimalResponse>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "detectors": [{
          "name": "@bentley/cracks-ortho",
          "displayName": "Cracks Ortho",
          "description": "Detects cracks in concrete infrastructure to enable defect inspection workflows.",
          "type": "OrthophotoSegmentationDetector",
          "documentationUrl": "https://www.bentley.com",
          "latestVersion": "1.0"
        },
        {
          "name": "traffic-signs",
          "displayName": "Traffic signs detector",
          "description": "Detects all traffic signs within a scene.",
          "type": "PhotoObjectDetector",
          "documentationUrl": "https://www.example.com"
        }
        ]
      }
    });
    const result = await service.getDetectors();
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.detectors).to.have.lengthOf(2);
  });

  it("getDetectors 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getDetectors();
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getDetectors ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getDetectors();
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getDetector tests
  it("getDetector should call axios.get and return a Response<DetectorResponse>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "detector": {
          "name": "mydetector",
          "displayName": "Cracks detector",
          "description": "Detects all the cracks within a scene.",
          "type": "PhotoObjectDetector",
          "documentationUrl": "https://www.bentley.com",
          "versions": [{
            "creationDate": "2025-03-18T14:11:15.5325351Z",
            "version": "2.0",
            "status": "AwaitingData",
            "creatorId": "e8be5445-c76a-41c6-9bfe-6a3d71953624",
            "capabilities": {
              "labels": [
                "crack"
              ],
              "exports": [
                "Lines"
              ]
            }
          },
          {
            "creationDate": "2025-03-12T13:32:06.8787916Z",
            "version": "1.1",
            "status": "Ready",
            "creatorId": "e8be5445-c76a-41c6-9bfe-6a3d71953624",
            "downloadUrl": "https://cicsdetectorsprodeussa01.blob.core.windows.net/bd9bf908-9b82-4fcd-9ab4-ff15286d2ada/cracks-detector-1.1.zip?sv=2024-08-04&se=2025-04-23T11%3A26%3A11Z&sr=b&sp=r&sig=***REMOVED***",
            "capabilities": {
              "labels": [
                "crack"
              ],
              "exports": [
                "Lines"
              ]
            }
          },
          {
            "creationDate": "2025-03-11T15:11:24.2712971Z",
            "version": "1.0",
            "status": "Ready",
            "creatorId": "d2b5b8e7-8248-49a3-94ac-b097a7a67b6d",
            "downloadUrl": "https://cicsdetectorsprodeussa01.blob.core.windows.net/bd9bf908-9b82-4fcd-9ab4-ff15286d2ada/cracks-detector-1.0.zip?sv=2024-08-04&se=2025-04-23T11%3A26%3A11Z&sr=b&sp=r&sig=***REMOVED***",
            "capabilities": {
              "labels": [
                "Crack Object"
              ],
              "exports": [
                "Lines"
              ]
            }
          }
          ]
        }
      }
    });
    const result = await service.getDetector("mydetector");
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.detector.name).to.equal("mydetector");
  });

  it("getDetector 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getDetector("mydetector");
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getDetector ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getDetector("mydetector");
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  //estimateCost tests
  it("estimateCost should call axios.post and return a Response<CostEstimation>", async () => {
    axiosPostStub.resolves({
      status: 200,
      data: {
        "costEstimation": {
          "id": "jobId",
          "estimatedUnits": 8,
          "unitType": "Modeling"
        }
      }
    });
    const costCreate: CostEstimationCreate = { type: JobType.CALIBRATION } as any;
    const result = await service.estimateCost(costCreate);
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.estimatedUnits).to.equal(8);
  });

  it("estimateCost 401 error", async () => {
    axiosPostStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const costCreate: CostEstimationCreate = { type: JobType.CALIBRATION } as any;
    const result = await service.estimateCost(costCreate);
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("estimateCost ill formed error", async () => {
    axiosPostStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const costCreate: CostEstimationCreate = { type: JobType.CALIBRATION } as any;
    const result = await service.estimateCost(costCreate);
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // cancelJob tests
  it("cancelJob should call axios.delete and return a Response<Job>", async () => {
    axiosDeleteStub.resolves({
      status: 200,
      data: {
        "job": {
          "id": "jobId",
          "state": "Terminating",
          "userId": "911edf8b-59ad-404c-a743-aec05ca038e9",
          "executionInfo": {
            "startedDateTime": "2025-03-10T11:30:03Z",
            "createdDateTime": "2025-03-10T11:30:00Z"
          },
          "specifications": {
            "inputs": {
              "scene": "sceneId"
            },
            "outputs": {
              "modelingReference": {
                "location": "modelingReferenceId"
              }
            }
          },
          "name": "jobName",
          "type": "Reconstruction",
          "iTwinId": "uuidIT"
        }
      }
    });
    const result = await service.cancelJob("jobId", Service.MODELING);
    expect(axiosDeleteStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.state).to.equal("Terminating");
  });

  it("cancelJob 401 error", async () => {
    axiosDeleteStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.cancelJob("jobId", Service.MODELING);
    expect(axiosDeleteStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("cancelJob ill formed error", async () => {
    axiosDeleteStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.cancelJob("jobId", Service.MODELING);
    expect(axiosDeleteStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJobProgress tests
  it("getJobProgress should call axios.get and return a Response<Progress>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "progress": {
          "percentage": 5,
          "state": "Active"
        }
      }
    });
    const result = await service.getJobProgress("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.percentage).to.equal(5);
  });

  it("getJobProgress 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getJobProgress("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("cancelJob ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getJobProgress("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJobMessages
  it("getJobMessages should call axios.get and return a Response<Messages>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "messages": {
          "errors": [{
            "code": "InputData_Invalid",
            "message": "Invalid input data. Please check the documentation. (\"%1\")",
            "title": "Invalid input data",
            "params": ["Sample_scan"]
          }],
          "warnings": []
        }
      }
    });
    const result = await service.getJobMessages("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.errors).to.have.lengthOf(1);
    expect(result.value!.errors[0].code).to.equal("InputData_Invalid");
  });

  it("getJobMessages 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getJobMessages("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getJobMessages ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getJobMessages("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJob tests
  it("getJobMessages should call axios.get and return a Response<Messages>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "job": {
          "id": "jobId",
          "state": "Active",
          "userId": "userId",
          "executionInfo": {
            "createdDateTime": "2025-03-06T09:42:33Z"
          },
          "specifications": {
            "inputs": {
              "sceneToProcess": "sceneId"
            },
            "outputs": {
              "scene": "sceneId"
            }
          },
          "name": "jobName",
          "type": "FillImageProperties",
          "iTwinId": "uuidIT"
        }
      }
    });
    const result = await service.getJob("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.state).to.equal("Active");
    expect(result.value!.id).to.equal("jobId");
  });

  it("getJob 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const result = await service.getJob("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getJob ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const result = await service.getJob("jobId", Service.MODELING);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // submitJob tests
  it("submitJob should call axios.post and return a Response<Job>", async () => {
    axiosPostStub.resolves({
      status: 200,
      data: {
        "job": {
          "id": "jobId",
          "state": "Active",
          "userId": "userId",
          "executionInfo": {
            "createdDateTime": "2025-03-10T11:30:00Z"
          },
          "specifications": {
            "inputs": {
              "scene": "sceneId"
            },
            "outputs": {
              "modelingReference": {
                "location": "modelingReferenceId"
              }
            }
          },
          "name": "jobName",
          "type": "Reconstruction",
          "iTwinId": "uuidIT"
        }
      }
    });
    const jobCreate: JobCreate = { type: JobType.RECONSTRUCTION } as any;
    const result = await service.submitJob(jobCreate);
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.false;
    expect(result.value!.type).to.equal(JobType.RECONSTRUCTION);
  });

  it("submitJob 401 error", async () => {
    axiosPostStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message: "Header Authorization was not found in the request. Access denied."
          }
        }
      }
    });
    const jobCreate: JobCreate = { type: JobType.RECONSTRUCTION } as any;
    const result = await service.submitJob(jobCreate);
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("submitJob ill formed error", async () => {
    axiosPostStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response"
        }
      }
    });
    const jobCreate: JobCreate = { type: JobType.RECONSTRUCTION } as any;
    const result = await service.submitJob(jobCreate);
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.be.true;
    expect(result.error!.error.code).to.equal("UnknownError");
  });
});
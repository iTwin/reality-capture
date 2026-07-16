import { expect } from "chai";
import sinon from "sinon";
import { RealityCaptureService } from "../../service/service";
import type { AuthorizationClient } from "@itwin/core-common";
import { Response } from "../../service/response";
import { JobCreate, JobType, Service } from "../../service/job";
import { CostEstimationCreate } from "../../service/estimation";
import { DetectorBase, DetectorExport, DetectorType, DetectorUpdate, DetectorVersionCreate } from "../../service/detectors";
import { Access, Prefer, RealityDataFilter, Type } from "../../service/reality_data";

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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.files).to.have.lengthOf(2);
    expect(result.value!.files[0].deprecated).to.equal(undefined);
    expect(result.value!.files[0].description).to.equal("preset file");
    expect(result.value!.files[1].description).to.equal(undefined);
    expect(result.value!.files[1].deprecated).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detectors).to.have.lengthOf(2);
  });

  it("getDetectors should pass filters as query params", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "detectors": []
      }
    });
    const detectorsFilter = "exports in ('Polygons', 'Lines') and labels in ('crack')";
    const result = await service.getDetectors(detectorsFilter);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors");
    expect(axiosGetStub.firstCall.args[1].params).to.deep.equal({ "$filter": detectorsFilter });
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getDetector tests
  it("getDetector should call axios.get and return a Response<DetectorResponse>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        "detector": {
          "name": "@bentley/mydetector",
          "displayName": "Cracks detector",
          "description": "Detects all the cracks within a scene.",
          "type": "PhotoObjectDetector",
          "documentationUrl": "https://www.bentley.com",
          "versions": [{
            "creationDate": "2025-03-18T14:11:15.5325351Z",
            "versionNumber": "2.0",
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
            "versionNumber": "1.1",
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
            "versionNumber": "1.0",
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
    const result = await service.getDetector("@bentley/mydetector");
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector");
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detector.name).to.equal("@bentley/mydetector");
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("createDetector should call axios.post and return a Response<DetectorResponse>", async () => {
    axiosPostStub.resolves({
      status: 201,
      data: {
        detector: {
          name: "@bentley/new-detector",
          displayName: "New detector",
          description: "Creates a detector.",
          type: "PhotoObjectDetector",
          documentationUrl: "https://www.bentley.com",
          versions: []
        }
      }
    });
    const detectorCreate: DetectorBase = {
      name: "@bentley/new-detector",
      displayName: "New detector",
      description: "Creates a detector.",
      type: DetectorType.PHOTO_OBJECT_DETECTOR,
      documentationUrl: "https://www.bentley.com"
    };
    const result = await service.createDetector(detectorCreate);
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors");
    expect(axiosPostStub.firstCall.args[1]).to.deep.equal(detectorCreate);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detector.name).to.equal("@bentley/new-detector");
  });

  it("updateDetector should call axios.patch with an encoded detector name", async () => {
    axiosPatchStub.resolves({
      status: 200,
      data: {
        detector: {
          name: "@bentley/mydetector",
          displayName: "Updated detector",
          description: "Updated description",
          type: "PhotoObjectDetector",
          documentationUrl: "https://www.bentley.com/docs",
          versions: []
        }
      }
    });
    const detectorUpdate: DetectorUpdate = {
      displayName: "Updated detector",
      description: "Updated description",
      documentationUrl: "https://www.bentley.com/docs"
    };
    const result = await service.updateDetector("@bentley/mydetector", detectorUpdate);
    expect(axiosPatchStub.calledOnce).to.equal(true);
    expect(axiosPatchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector");
    expect(axiosPatchStub.firstCall.args[1]).to.deep.equal(detectorUpdate);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detector.displayName).to.equal("Updated detector");
  });

  it("deleteDetector should call axios.delete with an encoded detector name", async () => {
    axiosDeleteStub.resolves({
      status: 204,
      data: {}
    });
    const result = await service.deleteDetector("@bentley/mydetector");
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(axiosDeleteStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector");
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("createDetectorVersion should call axios.post with the version payload", async () => {
    axiosPostStub.resolves({
      status: 201,
      data: {
        version: {
          versionNumber: "1.0",
          capabilities: { labels: ["crack"], exports: ["Lines"] },
          creationDate: "2025-03-18T14:11:15.5325351Z",
          status: "AwaitingData",
          creatorId: "e8be5445-c76a-41c6-9bfe-6a3d71953624"
        },
        _links: {
          completeUrl: { href: "https://example.com/complete" },
          uploadUrl: { href: "https://example.com/upload" }
        }
      }
    });
    const versionCreate: DetectorVersionCreate = {
      versionNumber: "1.0",
      capabilities: {
        labels: ["crack"],
        exports: [DetectorExport.LINES]
      }
    };
    const result = await service.createDetectorVersion("@bentley/mydetector", versionCreate);
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions");
    expect(axiosPostStub.firstCall.args[1]).to.deep.equal(versionCreate);
    expect(result.isError()).to.be.false;
    expect(result.value!.version.versionNumber).to.equal("1.0");
    expect(result.value!._links.uploadUrl.href).to.equal("https://example.com/upload");
  });

  it("deleteDetectorVersion should call axios.delete with encoded detector and version names", async () => {
    axiosDeleteStub.resolves({
      status: 204,
      data: {}
    });
    const result = await service.deleteDetectorVersion("@bentley/mydetector", "1.0-beta/1");
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(axiosDeleteStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0-beta%2F1");
    expect(result.isError()).to.equal(false);
  });

  it("publishDetectorVersion should call axios.post on the publish endpoint", async () => {
    axiosPostStub.resolves({
      status: 200,
      data: {}
    });
    const result = await service.publishDetectorVersion("@bentley/mydetector", "1.0");
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0/publish");
    expect(result.isError()).to.equal(false);
  });

  it("unpublishDetectorVersion should call axios.post on the unpublish endpoint", async () => {
    axiosPostStub.resolves({
      status: 200,
      data: {}
    });
    const result = await service.unpublishDetectorVersion("@bentley/mydetector", "1.0");
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0/unpublish");
    expect(result.isError()).to.equal(false);
  });

  it("completeDetectorVersionUpload should call axios.post on the complete endpoint", async () => {
    axiosPostStub.resolves({
      status: 200,
      data: {}
    });
    const result = await service.completeDetectorVersionUpload("@bentley/mydetector", "1.0");
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0/complete");
    expect(result.isError()).to.equal(false);
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
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
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
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
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
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJobs tests
  it("getJobs should call axios.get and return a Response<Jobs>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        jobs: [
          {
            id: "2e8b5984-15b1-45d5-8175-572583d8c3c8",
            state: "Success",
            userId: "c6ed4bad-b7d1-46d5-b9f3-7bae29cf39a9",
            executionInfo: {
              startedDateTime: "2025-11-24T08:12:33Z",
              endedDateTime: "2025-11-24T08:14:00Z",
              createdDateTime: "2025-11-24T08:12:09Z",
              processingUnits: 0,
            },
            specifications: {
              inputs: {
                imageCollections: ["fc2746d5-7b62-4f00-9a88-1bfaa22475d7"],
              },
              outputs: {
                scene: "0bdccf29-452e-4610-b00c-d2a1f58c9100",
              },
              options: {
                recursiveImageCollections: false,
                altitudeReference: "SeaLevel",
              },
            },
            name: "Unified Job- FillImageProperties",
            type: "FillImageProperties",
            iTwinId: "2c8e4988-eb9b-4e5f-a903-8c7c18f3030a",
          },
          {
            id: "7358a7f6-dcf3-4f81-8cdd-5df3396bb0c9",
            state: "Failed",
            userId: "c6ed4bad-b7d1-46d5-b9f3-7bae29cf39a9",
            executionInfo: {
              startedDateTime: "2025-11-24T13:31:39Z",
              endedDateTime: "2025-11-24T13:31:39Z",
              createdDateTime: "2025-11-24T08:12:12Z",
              processingUnits: 0.0,
            },
            specifications: {
              inputs: {
                imageCollections: ["fc2746d5-7b62-4f00-9a88-1bfaa22475d7"],
              },
              outputs: {
                scene: "66d86817-e959-4eea-ac65-176dde1093cf",
              },
              options: {
                recursiveImageCollections: false,
                altitudeReference: "SeaLevel",
              },
            },
            name: "Unified Job- FillImageProperties",
            type: "FillImageProperties",
            iTwinId: "2c8e4988-eb9b-4e5f-a903-8c7c18f3030a",
          },
        ],
        _links: {
          next: {
            href: "https://api.bentley.com/reality-modeling/jobs?$filter=iTwinId%20eq%202c8e4988-eb9b-4e5f-a903-8c7c18f3030a&$top=2&continuationToken=MTRmZDkwOGYtNWEzOS00YzY3LWFmMGYtMGMxMWQxYWNkMDhl",
          },
        },
      },
    });
    const result = await service.getJobs(Service.MODELING, "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[1].params).to.deep.include({
      $filter: "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a",
    });
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.jobs).to.have.lengthOf(2);
    expect(result.value!.jobs[0].id).to.equal(
      "2e8b5984-15b1-45d5-8175-572583d8c3c8"
    );
    expect(result.value!.jobs[1].state).to.equal("Failed");
    expect(result.value!._links).to.not.be.undefined;
    expect(result.value!._links!.next.href).to.include("continuationToken");
  });

  it("getJobs 401 error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 401,
        data: {
          error: {
            code: "HeaderNotFound",
            message:
              "Header Authorization was not found in the request. Access denied.",
          },
        },
      },
    });
    const result = await service.getJobs(Service.MODELING, "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getJobs ill formed error", async () => {
    axiosGetStub.rejects({
      response: {
        status: 400,
        data: {
          bad: "response",
        },
      },
    });
    const result = await service.getJobs(Service.MODELING, "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  const rdId = "rd-uuid-001";
  const sampleRealityData = {
    id: rdId,
    displayName: "Test RD",
    type: "CCImageCollection",
    createdDateTime: "2024-01-01T00:00:00Z",
    modifiedDateTime: "2024-01-02T00:00:00Z",
    lastAccessedDateTime: "2024-01-03T00:00:00Z",
    dataCenterLocation: "East US",
    size: 512,
  };
  const sampleContainerDetails = {
    type: "AzureBlobSasUrl",
    access: "Read",
    _links: { containerUrl: { href: "https://blob.core.windows.net/container?sas=token" } },
  };

  it("getRealityData should return a Response<RealityData> on success", async () => {
    axiosGetStub.resolves({ status: 200, data: { realityData: sampleRealityData } });
    const result = await service.getRealityData(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[0]).to.equal(`https://dev-api.bentley.com/reality-management/reality-data/${rdId}`);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.id).to.equal(rdId);
  });

  it("getRealityData with iTwinId should append query param", async () => {
    axiosGetStub.resolves({ status: 200, data: { realityData: sampleRealityData } });
    await service.getRealityData(rdId, iTwinId);
    expect(axiosGetStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}?iTwinId=${iTwinId}`
    );
  });

  it("getRealityData 401 error", async () => {
    axiosGetStub.rejects({
      response: { status: 401, data: { error: { code: "HeaderNotFound", message: "Access denied." } } }
    });
    const result = await service.getRealityData(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityData ill formed error", async () => {
    axiosGetStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.getRealityData(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("createRealityData should call axios.post and return a Response<RealityData>", async () => {
    axiosPostStub.resolves({ status: 201, data: { realityData: sampleRealityData } });
    const create = { iTwinId, displayName: "Test RD", type: Type.CC_IMAGE_COLLECTION };
    const result = await service.createRealityData(create);
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-management/reality-data");
    expect(axiosPostStub.firstCall.args[1]).to.deep.equal(create);
    expect(result.isError()).to.equal(false);
    expect(result.value!.id).to.equal(rdId);
  });

  it("createRealityData 422 error", async () => {
    axiosPostStub.rejects({
      response: { status: 422, data: { error: { code: "InvalidRealityData", message: "Invalid payload." } } }
    });
    const result = await service.createRealityData({ iTwinId, displayName: "Test", type: Type.LAS });
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("InvalidRealityData");
  });

  it("createRealityData ill formed error", async () => {
    axiosPostStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.createRealityData({ iTwinId, displayName: "Test", type: Type.LAS });
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("updateRealityData should call axios.patch and return a Response<RealityData>", async () => {
    const updated = { ...sampleRealityData, displayName: "Updated RD" };
    axiosPatchStub.resolves({ status: 200, data: { realityData: updated } });
    const update = { displayName: "Updated RD" };
    const result = await service.updateRealityData(update, rdId);
    expect(axiosPatchStub.calledOnce).to.equal(true);
    expect(axiosPatchStub.firstCall.args[0]).to.equal(`https://dev-api.bentley.com/reality-management/reality-data/${rdId}`);
    expect(axiosPatchStub.firstCall.args[1]).to.deep.equal(update);
    expect(result.isError()).to.equal(false);
    expect(result.value!.displayName).to.equal("Updated RD");
  });

  it("updateRealityData 401 error", async () => {
    axiosPatchStub.rejects({
      response: { status: 401, data: { error: { code: "HeaderNotFound", message: "Access denied." } } }
    });
    const result = await service.updateRealityData({ displayName: "New" }, rdId);
    expect(axiosPatchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("updateRealityData ill formed error", async () => {
    axiosPatchStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.updateRealityData({}, rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("deleteRealityData should call axios.delete and return a Response<void>", async () => {
    axiosDeleteStub.resolves({ status: 204, data: {} });
    const result = await service.deleteRealityData(rdId);
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(axiosDeleteStub.firstCall.args[0]).to.equal(`https://dev-api.bentley.com/reality-management/reality-data/${rdId}`);
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("deleteRealityData 404 error", async () => {
    axiosDeleteStub.rejects({
      response: { status: 404, data: { error: { code: "RealityDataNotFound", message: "Not found." } } }
    });
    const result = await service.deleteRealityData(rdId);
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("deleteRealityData ill formed error", async () => {
    axiosDeleteStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.deleteRealityData(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataReadAccess should return a Response<ContainerDetails>", async () => {
    axiosGetStub.resolves({ status: 200, data: sampleContainerDetails });
    const result = await service.getRealityDataReadAccess(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/readaccess`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value!.access).to.equal(Access.READ);
    expect(result.value!._links.containerUrl.href).to.equal("https://blob.core.windows.net/container?sas=token");
  });

  it("getRealityDataReadAccess with iTwinId should append query param only once", async () => {
    axiosGetStub.resolves({ status: 200, data: sampleContainerDetails });
    await service.getRealityDataReadAccess(rdId, iTwinId);
    const calledUrl: string = axiosGetStub.firstCall.args[0];
    expect(calledUrl).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/readaccess?iTwinId=${iTwinId}`
    );
    expect(calledUrl.split("iTwinId=").length - 1).to.equal(1);
  });

  it("getRealityDataReadAccess 401 error", async () => {
    axiosGetStub.rejects({
      response: { status: 401, data: { error: { code: "HeaderNotFound", message: "Access denied." } } }
    });
    const result = await service.getRealityDataReadAccess(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataReadAccess ill formed error", async () => {
    axiosGetStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.getRealityDataReadAccess(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataWriteAccess should return a Response<ContainerDetails> with WRITE access", async () => {
    const writeDetails = { ...sampleContainerDetails, access: "Write" };
    axiosGetStub.resolves({ status: 200, data: writeDetails });
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/writeaccess`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value!.access).to.equal(Access.WRITE);
  });

  it("getRealityDataWriteAccess with iTwinId should append query param only once", async () => {
    axiosGetStub.resolves({ status: 200, data: { ...sampleContainerDetails, access: "Write" } });
    await service.getRealityDataWriteAccess(rdId, iTwinId);
    const calledUrl: string = axiosGetStub.firstCall.args[0];
    expect(calledUrl).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/writeaccess?iTwinId=${iTwinId}`
    );
    expect(calledUrl.split("iTwinId=").length - 1).to.equal(1);
  });

  it("getRealityDataWriteAccess 401 error", async () => {
    axiosGetStub.rejects({
      response: { status: 401, data: { error: { code: "HeaderNotFound", message: "Access denied." } } }
    });
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataWriteAccess ill formed error", async () => {
    axiosGetStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataList should return a Response<RealityDatas>", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        realityData: [
          { id: "rd-001", displayName: "RD1", type: "CCImageCollection" },
          { id: "rd-002", displayName: "RD2", type: "LAS" },
        ],
        links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/?continuationToken=token123" } },
      },
    });
    const result = await service.getRealityDataList();
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(false);
    expect(result.value!.realityData).to.have.lengthOf(2);
  });

  it("getRealityDataList should send Prefer: return=representation when specified", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        realityData: [],
        links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
      },
    });
    await service.getRealityDataList(undefined, Prefer.REPRESENTATION);
    expect(axiosGetStub.firstCall.args[1].headers["Prefer"]).to.equal("return=representation");
  });

  it("getRealityDataList should send Prefer: return=minimal by default", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        realityData: [],
        links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
      },
    });
    await service.getRealityDataList();
    expect(axiosGetStub.firstCall.args[1].headers["Prefer"]).to.equal("return=minimal");
  });

  it("getRealityDataList should pass filter as params", async () => {
    axiosGetStub.resolves({
      status: 200,
      data: {
        realityData: [],
        links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
      },
    });
    const filter: RealityDataFilter = { iTwinId, $top: 10 };
    await service.getRealityDataList(filter);
    expect(axiosGetStub.firstCall.args[1].params).to.deep.equal({ iTwinId, $top: 10 });
  });

  it("getRealityDataList 401 error", async () => {
    axiosGetStub.rejects({
      response: { status: 401, data: { error: { code: "HeaderNotFound", message: "Access denied." } } }
    });
    const result = await service.getRealityDataList();
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataList ill formed error", async () => {
    axiosGetStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.getRealityDataList();
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("moveRealityData should call axios.patch on the move endpoint", async () => {
    axiosPatchStub.resolves({ status: 200, data: {} });
    const result = await service.moveRealityData(rdId, iTwinId);
    expect(axiosPatchStub.calledOnce).to.equal(true);
    expect(axiosPatchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/move`
    );
    expect(axiosPatchStub.firstCall.args[1]).to.deep.equal({ iTwinId });
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("moveRealityData 404 error", async () => {
    axiosPatchStub.rejects({
      response: { status: 404, data: { error: { code: "RealityDataNotFound", message: "Not found." } } }
    });
    const result = await service.moveRealityData(rdId, iTwinId);
    expect(axiosPatchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("moveRealityData ill formed error", async () => {
    axiosPatchStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.moveRealityData(rdId, iTwinId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataITwins should return a Response<string[]>", async () => {
    axiosGetStub.resolves({ status: 200, data: { iTwins: ["itwin-001", "itwin-002"] } });
    const result = await service.getRealityDataITwins(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(axiosGetStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/iTwins`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value).to.deep.equal(["itwin-001", "itwin-002"]);
  });

  it("getRealityDataITwins 404 error", async () => {
    axiosGetStub.rejects({
      response: { status: 404, data: { error: { code: "RealityDataNotFound", message: "Not found." } } }
    });
    const result = await service.getRealityDataITwins(rdId);
    expect(axiosGetStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("getRealityDataITwins ill formed error", async () => {
    axiosGetStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.getRealityDataITwins(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // associateRealityData tests
  it("associateRealityData should call axios.post on the iTwins endpoint", async () => {
    axiosPostStub.resolves({ status: 200, data: {} });
    const result = await service.associateRealityData(iTwinId, rdId);
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(axiosPostStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/iTwins/${iTwinId}`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("associateRealityData 404 error", async () => {
    axiosPostStub.rejects({
      response: { status: 404, data: { error: { code: "RealityDataNotFound", message: "Not found." } } }
    });
    const result = await service.associateRealityData(iTwinId, rdId);
    expect(axiosPostStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("associateRealityData ill formed error", async () => {
    axiosPostStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.associateRealityData(iTwinId, rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // dissociateRealityData tests
  it("dissociateRealityData should call axios.delete on the iTwins endpoint", async () => {
    axiosDeleteStub.resolves({ status: 204, data: {} });
    const result = await service.dissociateRealityData(iTwinId, rdId);
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(axiosDeleteStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/iTwins/${iTwinId}`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("dissociateRealityData 404 error", async () => {
    axiosDeleteStub.rejects({
      response: { status: 404, data: { error: { code: "RealityDataNotFound", message: "Not found." } } }
    });
    const result = await service.dissociateRealityData(iTwinId, rdId);
    expect(axiosDeleteStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("dissociateRealityData ill formed error", async () => {
    axiosDeleteStub.rejects({ response: { status: 500, data: { bad: "response" } } });
    const result = await service.dissociateRealityData(iTwinId, rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });
});

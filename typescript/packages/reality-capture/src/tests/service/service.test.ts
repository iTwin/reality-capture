import { expect } from "chai";
import sinon from "sinon";
import { RealityCaptureService } from "../../service/service";
import type { AuthorizationClient } from "@itwin/core-common";
import { Response } from "../../service/response";
import { JobCreate, JobType, Service } from "../../service/job";
import { CostEstimationCreate } from "../../service/estimation";
import { DetectorBase, DetectorExport, DetectorType, DetectorUpdate, DetectorVersionCreate } from "../../service/detectors";
import { Access, Prefer, RealityDataFilter, Type } from "../../service/reality_data";
import { mockFetchResponse } from "./test_helpers";


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
  let fetchStub: sinon.SinonStub;
  let getAccessTokenStub: sinon.SinonStub;
  const iTwinId = "uuidIT";

  beforeEach(() => {
    // Mock AuthorizationClient
    getAccessTokenStub = sinon.stub().resolves("fake-token");
    const mockAuthClient = { getAccessToken: getAccessTokenStub } as AuthorizationClient;

    service = new RealityCaptureService(mockAuthClient, { env: "dev" });
    fetchStub = sinon.stub(globalThis, "fetch");
  });

  afterEach(() => {
    sinon.restore();
  });

  // getBucket tests
  it("getBucket should call fetch and return a Response<BucketResponse>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getBucket(iTwinId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.bucket.iTwinId).to.equal(iTwinId);
  });

  it("getBucket 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getBucket(iTwinId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getBucket ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getBucket(iTwinId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getServiceFiles tests
  it("getServiceFiles should call fetch and return a Response<Files>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getServiceFiles();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.files).to.have.lengthOf(2);
    expect(result.value!.files[0].deprecated).to.equal(undefined);
    expect(result.value!.files[0].description).to.equal("preset file");
    expect(result.value!.files[1].description).to.equal(undefined);
    expect(result.value!.files[1].deprecated).to.equal(true);
  });

  it("getServiceFiles 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getServiceFiles();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getServiceFiles ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getServiceFiles();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getDetectors tests
  it("getDetectors should call fetch and return a Response<DetectorsMinimalResponse>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getDetectors();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detectors).to.have.lengthOf(2);
  });

  it("getDetectors should pass filters as query params", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      "detectors": []
    }
    ));
    const detectorsFilter = "exports in ('Polygons', 'Lines') and labels in ('crack')";
    const result = await service.getDetectors(detectorsFilter);
    const calledUrl = new URL(fetchStub.firstCall.args[0]);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(calledUrl.origin + calledUrl.pathname).to.equal("https://dev-api.bentley.com/reality-analysis/detectors");
    expect(calledUrl.searchParams.get("$filter")).to.equal(detectorsFilter);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
  });

  it("getDetectors 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getDetectors();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getDetectors ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getDetectors();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getDetector tests
  it("getDetector should call fetch and return a Response<DetectorResponse>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getDetector("@bentley/mydetector");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector");
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detector.name).to.equal("@bentley/mydetector");
  });

  it("getDetector 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getDetector("mydetector");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getDetector ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getDetector("mydetector");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("createDetector should call fetch and return a Response<DetectorResponse>", async () => {
    fetchStub.resolves(mockFetchResponse(201, {
      detector: {
        name: "@bentley/new-detector",
        displayName: "New detector",
        description: "Creates a detector.",
        type: "PhotoObjectDetector",
        documentationUrl: "https://www.bentley.com",
        versions: []
      }
    }
    ));
    const detectorCreate: DetectorBase = {
      name: "@bentley/new-detector",
      displayName: "New detector",
      description: "Creates a detector.",
      type: DetectorType.PHOTO_OBJECT_DETECTOR,
      documentationUrl: "https://www.bentley.com"
    };
    const result = await service.createDetector(detectorCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors");
    expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal(detectorCreate);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detector.name).to.equal("@bentley/new-detector");
  });

  it("updateDetector should call fetch with an encoded detector name", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      detector: {
        name: "@bentley/mydetector",
        displayName: "Updated detector",
        description: "Updated description",
        type: "PhotoObjectDetector",
        documentationUrl: "https://www.bentley.com/docs",
        versions: []
      }
    }
    ));
    const detectorUpdate: DetectorUpdate = {
      displayName: "Updated detector",
      description: "Updated description",
      documentationUrl: "https://www.bentley.com/docs"
    };
    const result = await service.updateDetector("@bentley/mydetector", detectorUpdate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector");
    expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal(detectorUpdate);
    expect(result.isError()).to.equal(false);
    expect(result.value!.detector.displayName).to.equal("Updated detector");
  });

  it("deleteDetector should call fetch with an encoded detector name", async () => {
    fetchStub.resolves(mockFetchResponse(204, {}
    ));
    const result = await service.deleteDetector("@bentley/mydetector");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector");
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("createDetectorVersion should call fetch with the version payload", async () => {
    fetchStub.resolves(mockFetchResponse(201, {
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
    ));
    const versionCreate: DetectorVersionCreate = {
      versionNumber: "1.0",
      capabilities: {
        labels: ["crack"],
        exports: [DetectorExport.LINES]
      }
    };
    const result = await service.createDetectorVersion("@bentley/mydetector", versionCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions");
    expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal(versionCreate);
    expect(result.isError()).to.equal(false);
    expect(result.value!.version.versionNumber).to.equal("1.0");
    expect(result.value!._links.uploadUrl.href).to.equal("https://example.com/upload");
  });

  it("deleteDetectorVersion should call fetch with encoded detector and version names", async () => {
    fetchStub.resolves(mockFetchResponse(204, {}
    ));
    const result = await service.deleteDetectorVersion("@bentley/mydetector", "1.0-beta/1");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0-beta%2F1");
    expect(result.isError()).to.equal(false);
  });

  it("publishDetectorVersion should call fetch on the publish endpoint", async () => {
    fetchStub.resolves(mockFetchResponse(200, {}
    ));
    const result = await service.publishDetectorVersion("@bentley/mydetector", "1.0");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0/publish");
    expect(result.isError()).to.equal(false);
  });

  it("unpublishDetectorVersion should call fetch on the unpublish endpoint", async () => {
    fetchStub.resolves(mockFetchResponse(200, {}
    ));
    const result = await service.unpublishDetectorVersion("@bentley/mydetector", "1.0");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0/unpublish");
    expect(result.isError()).to.equal(false);
  });

  it("completeDetectorVersionUpload should call fetch on the complete endpoint", async () => {
    fetchStub.resolves(mockFetchResponse(200, {}
    ));
    const result = await service.completeDetectorVersionUpload("@bentley/mydetector", "1.0");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-analysis/detectors/%40bentley%2Fmydetector/versions/1.0/complete");
    expect(result.isError()).to.equal(false);
  });

  //estimateCost tests
  it("estimateCost should call fetch and return a Response<CostEstimation>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      "costEstimation": {
        "id": "jobId",
        "estimatedUnits": 8,
        "unitType": "Modeling"
      }
    }
    ));
    const costCreate: CostEstimationCreate = { type: JobType.CALIBRATION } as any;
    const result = await service.estimateCost(costCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.estimatedUnits).to.equal(8);
  });

  it("estimateCost 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const costCreate: CostEstimationCreate = { type: JobType.CALIBRATION } as any;
    const result = await service.estimateCost(costCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("estimateCost ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const costCreate: CostEstimationCreate = { type: JobType.CALIBRATION } as any;
    const result = await service.estimateCost(costCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // cancelJob tests
  it("cancelJob should call fetch and return a Response<Job>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.cancelJob("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.state).to.equal("Terminating");
  });

  it("cancelJob 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.cancelJob("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("cancelJob ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.cancelJob("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJobProgress tests
  it("getJobProgress should call fetch and return a Response<Progress>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      "progress": {
        "percentage": 5,
        "state": "Active"
      }
    }
    ));
    const result = await service.getJobProgress("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.percentage).to.equal(5);
  });

  it("getJobProgress 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getJobProgress("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("cancelJob ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getJobProgress("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJobMessages
  it("getJobMessages should call fetch and return a Response<Messages>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getJobMessages("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.errors).to.have.lengthOf(1);
    expect(result.value!.errors[0].code).to.equal("InputData_Invalid");
  });

  it("getJobMessages 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getJobMessages("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getJobMessages ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getJobMessages("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJob tests
  it("getJobMessages should call fetch and return a Response<Messages>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getJob("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.state).to.equal("Active");
    expect(result.value!.id).to.equal("jobId");
  });

  it("getJob 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const result = await service.getJob("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getJob ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const result = await service.getJob("jobId", Service.MODELING);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // submitJob tests
  it("submitJob should call fetch and return a Response<Job>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const jobCreate: JobCreate = { type: JobType.RECONSTRUCTION } as any;
    const result = await service.submitJob(jobCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.type).to.equal(JobType.RECONSTRUCTION);
  });

  it("submitJob 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message: "Header Authorization was not found in the request. Access denied."
      }
    }
    ));
    const jobCreate: JobCreate = { type: JobType.RECONSTRUCTION } as any;
    const result = await service.submitJob(jobCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("submitJob ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response"
    }
    ));
    const jobCreate: JobCreate = { type: JobType.RECONSTRUCTION } as any;
    const result = await service.submitJob(jobCreate);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // getJobs tests
  it("getJobs should call fetch and return a Response<Jobs>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
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
    ));
    const result = await service.getJobs(Service.MODELING, "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    const calledUrl = new URL(fetchStub.firstCall.args[0]);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(calledUrl.origin + calledUrl.pathname).to.equal("https://dev-api.bentley.com/reality-modeling/jobs");
    expect(calledUrl.searchParams.get("$filter")).to.equal("iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    expect(calledUrl.searchParams.get("$top")).to.equal("100");
    expect(calledUrl.searchParams.get("continuationToken")).to.equal("");
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.jobs).to.have.lengthOf(2);
    expect(result.value!.jobs[0].id).to.equal(
      "2e8b5984-15b1-45d5-8175-572583d8c3c8"
    );
    expect(result.value!.jobs[1].state).to.equal("Failed");
    expect(result.value!._links).to.not.equal(undefined);
    expect(result.value!._links!.next.href).to.include("continuationToken");
  });

  it("getJobs 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, {
      error: {
        code: "HeaderNotFound",
        message:
          "Header Authorization was not found in the request. Access denied.",
      },
    }));
    const result = await service.getJobs(Service.MODELING, "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getJobs ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(400, {
      bad: "response",
    }));
    const result = await service.getJobs(Service.MODELING, "iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a");
    expect(fetchStub.calledOnce).to.equal(true);
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
    fetchStub.resolves(mockFetchResponse(200, { realityData: sampleRealityData } ));
    const result = await service.getRealityData(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(`https://dev-api.bentley.com/reality-management/reality-data/${rdId}`);
    expect(result).to.be.instanceOf(Response);
    expect(result.isError()).to.equal(false);
    expect(result.value!.id).to.equal(rdId);
  });

  it("getRealityData with iTwinId should append query param", async () => {
    fetchStub.resolves(mockFetchResponse(200, { realityData: sampleRealityData } ));
    await service.getRealityData(rdId, iTwinId);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}?iTwinId=${iTwinId}`
    );
  });

  it("getRealityData 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } }));
    const result = await service.getRealityData(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityData(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("createRealityData should call fetch and return a Response<RealityData>", async () => {
    fetchStub.resolves(mockFetchResponse(201, { realityData: sampleRealityData } ));
    const create = { iTwinId, displayName: "Test RD", type: Type.CC_IMAGE_COLLECTION };
    const result = await service.createRealityData(create);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal("https://dev-api.bentley.com/reality-management/reality-data");
    expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal(create);
    expect(result.isError()).to.equal(false);
    expect(result.value!.id).to.equal(rdId);
  });

  it("createRealityData 422 error", async () => {
    fetchStub.resolves(mockFetchResponse(422, { error: { code: "InvalidRealityData", message: "Invalid payload." } } ));
    const result = await service.createRealityData({ iTwinId, displayName: "Test", type: Type.LAS });
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("InvalidRealityData");
  });

  it("createRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.createRealityData({ iTwinId, displayName: "Test", type: Type.LAS });
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("updateRealityData should call fetch and return a Response<RealityData>", async () => {
    const updated = { ...sampleRealityData, displayName: "Updated RD" };
    fetchStub.resolves(mockFetchResponse(200, { realityData: updated } ));
    const update = { displayName: "Updated RD" };
    const result = await service.updateRealityData(update, rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(`https://dev-api.bentley.com/reality-management/reality-data/${rdId}`);
    expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal(update);
    expect(result.isError()).to.equal(false);
    expect(result.value!.displayName).to.equal("Updated RD");
  });

  it("updateRealityData 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } } ));
    const result = await service.updateRealityData({ displayName: "New" }, rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("updateRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.updateRealityData({}, rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("deleteRealityData should call fetch and return a Response<void>", async () => {
    fetchStub.resolves(mockFetchResponse(204, {} ));
    const result = await service.deleteRealityData(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(`https://dev-api.bentley.com/reality-management/reality-data/${rdId}`);
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("deleteRealityData 404 error", async () => {
    fetchStub.resolves(mockFetchResponse(404, { error: { code: "RealityDataNotFound", message: "Not found." } } ));
    const result = await service.deleteRealityData(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("deleteRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.deleteRealityData(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataReadAccess should return a Response<ContainerDetails>", async () => {
    fetchStub.resolves(mockFetchResponse(200, sampleContainerDetails ));
    const result = await service.getRealityDataReadAccess(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/readaccess`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value!.access).to.equal(Access.READ);
    expect(result.value!._links.containerUrl.href).to.equal("https://blob.core.windows.net/container?sas=token");
  });

  it("getRealityDataReadAccess with iTwinId should append query param only once", async () => {
    fetchStub.resolves(mockFetchResponse(200, sampleContainerDetails ));
    await service.getRealityDataReadAccess(rdId, iTwinId);
    const calledUrl: string = fetchStub.firstCall.args[0];
    expect(calledUrl).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/readaccess?iTwinId=${iTwinId}`
    );
    expect(calledUrl.split("iTwinId=").length - 1).to.equal(1);
  });

  it("getRealityDataReadAccess 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } } ));
    const result = await service.getRealityDataReadAccess(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataReadAccess ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityDataReadAccess(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataWriteAccess should return a Response<ContainerDetails> with WRITE access", async () => {
    const writeDetails = { ...sampleContainerDetails, access: "Write" };
    fetchStub.resolves(mockFetchResponse(200, writeDetails ));
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/writeaccess`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value!.access).to.equal(Access.WRITE);
  });

  it("getRealityDataWriteAccess with iTwinId should append query param only once", async () => {
    fetchStub.resolves(mockFetchResponse(200, { ...sampleContainerDetails, access: "Write" } ));
    await service.getRealityDataWriteAccess(rdId, iTwinId);
    const calledUrl: string = fetchStub.firstCall.args[0];
    expect(calledUrl).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/writeaccess?iTwinId=${iTwinId}`
    );
    expect(calledUrl.split("iTwinId=").length - 1).to.equal(1);
  });

  it("getRealityDataWriteAccess 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } } ));
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataWriteAccess ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataList should return a Response<RealityDatas>", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [
        { id: "rd-001", displayName: "RD1", type: "CCImageCollection" },
        { id: "rd-002", displayName: "RD2", type: "LAS" },
      ],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/?continuationToken=token123" } },
    },
    ));
    const result = await service.getRealityDataList();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(false);
    expect(result.value!.realityData).to.have.lengthOf(2);
  });

  it("getRealityDataList should send Prefer: return=representation when specified", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
    },
    ));
    await service.getRealityDataList(undefined, Prefer.REPRESENTATION);
    expect(fetchStub.firstCall.args[1].headers["Prefer"]).to.equal("return=representation");
  });

  it("getRealityDataList should send Prefer: return=minimal by default", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
    },
    ));
    await service.getRealityDataList();
    expect(fetchStub.firstCall.args[1].headers["Prefer"]).to.equal("return=minimal");
  });

  it("getRealityDataList should pass filter as params", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
    },
    ));
    const filter: RealityDataFilter = { iTwinId, $top: 10 };
    await service.getRealityDataList(filter);
    const calledUrl = new URL(fetchStub.firstCall.args[0]);
    expect(calledUrl.origin + calledUrl.pathname).to.equal("https://dev-api.bentley.com/reality-management/reality-data");
    expect(calledUrl.searchParams.get("iTwinId")).to.equal(iTwinId);
    expect(calledUrl.searchParams.get("$top")).to.equal("10");
  });

  it("getRealityDataList should serialize array-valued params as repeated keys", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
    },
    ));
    const filter: RealityDataFilter = { types: [Type.LAS, Type.E57] };
    await service.getRealityDataList(filter);
    const calledUrl = new URL(fetchStub.firstCall.args[0]);
    expect(calledUrl.searchParams.getAll("types")).to.deep.equal(["LAS", "E57"]);
    expect(calledUrl.search).to.not.include(",");
  });

  it("getRealityDataList 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } } ));
    const result = await service.getRealityDataList();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataList ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityDataList();
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("moveRealityData should call fetch on the move endpoint", async () => {
    fetchStub.resolves(mockFetchResponse(200, {} ));
    const result = await service.moveRealityData(rdId, iTwinId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/move`
    );
    expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal({ iTwinId });
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("moveRealityData 404 error", async () => {
    fetchStub.resolves(mockFetchResponse(404, { error: { code: "RealityDataNotFound", message: "Not found." } } ));
    const result = await service.moveRealityData(rdId, iTwinId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("moveRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.moveRealityData(rdId, iTwinId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataITwins should return a Response<string[]>", async () => {
    fetchStub.resolves(mockFetchResponse(200, { iTwins: ["itwin-001", "itwin-002"] } ));
    const result = await service.getRealityDataITwins(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/iTwins`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value).to.deep.equal(["itwin-001", "itwin-002"]);
  });

  it("getRealityDataITwins 404 error", async () => {
    fetchStub.resolves(mockFetchResponse(404, { error: { code: "RealityDataNotFound", message: "Not found." } } ));
    const result = await service.getRealityDataITwins(rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("getRealityDataITwins ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityDataITwins(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // associateRealityData tests
  it("associateRealityData should call fetch on the iTwins endpoint", async () => {
    fetchStub.resolves(mockFetchResponse(200, {} ));
    const result = await service.associateRealityData(iTwinId, rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/iTwins/${iTwinId}`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("associateRealityData 404 error", async () => {
    fetchStub.resolves(mockFetchResponse(404, { error: { code: "RealityDataNotFound", message: "Not found." } } ));
    const result = await service.associateRealityData(iTwinId, rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("associateRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.associateRealityData(iTwinId, rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  // dissociateRealityData tests
  it("dissociateRealityData should call fetch on the iTwins endpoint", async () => {
    fetchStub.resolves(mockFetchResponse(204, {} ));
    const result = await service.dissociateRealityData(iTwinId, rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[0]).to.equal(
      `https://dev-api.bentley.com/reality-management/reality-data/${rdId}/iTwins/${iTwinId}`
    );
    expect(result.isError()).to.equal(false);
    expect(result.value).to.equal(null);
  });

  it("dissociateRealityData 404 error", async () => {
    fetchStub.resolves(mockFetchResponse(404, { error: { code: "RealityDataNotFound", message: "Not found." } } ));
    const result = await service.dissociateRealityData(iTwinId, rdId);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("dissociateRealityData ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.dissociateRealityData(iTwinId, rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });
});

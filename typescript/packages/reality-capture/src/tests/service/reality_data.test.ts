/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { z } from "zod";
import sinon from "sinon";
import type { AuthorizationClient } from "@itwin/core-common";
import { Response } from "../../service/response";
import { RealityCaptureService } from "../../service/service";
import {
  Access, AcquisitionSchema, Classification, ContainerDetailsSchema, ContainerLinksSchema,
  ContainerType, CoordinateSchema, CrsSchema, ExtentSchema, Prefer, RealityDataBaseSchema,
  RealityDataCreateSchema, RealityDataFilter, RealityDataFilterSchema, realityDataFilterAsParams,
  RealityDataMinimalSchema, RealityDatasSchema, RealityDataSchema, RealityDataUpdateSchema, Type, URLSchema,
} from "../../service/reality_data";
import { mockFetchResponse } from "./test_helpers";


describe("CoordinateSchema", () => {
  it("should validate a correct coordinate", () => {
    expect(() => CoordinateSchema.parse({ latitude: 45.0, longitude: 90.0 })).to.not.throw();
  });

  it("should throw for latitude out of range", () => {
    expect(() => CoordinateSchema.parse({ latitude: 91, longitude: 0 })).to.throw(z.ZodError);
    expect(() => CoordinateSchema.parse({ latitude: -91, longitude: 0 })).to.throw(z.ZodError);
  });

  it("should throw for longitude out of range", () => {
    expect(() => CoordinateSchema.parse({ latitude: 0, longitude: 181 })).to.throw(z.ZodError);
    expect(() => CoordinateSchema.parse({ latitude: 0, longitude: -181 })).to.throw(z.ZodError);
  });

  it("should throw for missing fields", () => {
    expect(() => CoordinateSchema.parse({})).to.throw(z.ZodError);
    expect(() => CoordinateSchema.parse({ latitude: 0 })).to.throw(z.ZodError);
  });
});

describe("ExtentSchema", () => {
  const validExtent = {
    southWest: { latitude: -10, longitude: -20 },
    northEast: { latitude: 10, longitude: 20 },
  };

  it("should validate a correct extent", () => {
    expect(() => ExtentSchema.parse(validExtent)).to.not.throw();
  });

  it("should throw for missing southWest or northEast", () => {
    expect(() => ExtentSchema.parse({ southWest: validExtent.southWest })).to.throw(z.ZodError);
    expect(() => ExtentSchema.parse({ northEast: validExtent.northEast })).to.throw(z.ZodError);
  });

  it("should throw for invalid coordinate in extent", () => {
    expect(() => ExtentSchema.parse({
      southWest: { latitude: -91, longitude: 0 },
      northEast: { latitude: 10, longitude: 20 },
    })).to.throw(z.ZodError);
  });
});

describe("CrsSchema", () => {
  it("should validate a correct Crs with only id", () => {
    expect(() => CrsSchema.parse({ id: "EPSG:4326" })).to.not.throw();
  });

  it("should validate a correct Crs with id and verticalId", () => {
    expect(() => CrsSchema.parse({ id: "EPSG:4326", verticalId: "EPSG:5773" })).to.not.throw();
  });

  it("should throw for missing id", () => {
    expect(() => CrsSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("AcquisitionSchema", () => {
  it("should validate an empty acquisition", () => {
    expect(() => AcquisitionSchema.parse({})).to.not.throw();
  });

  it("should validate a full acquisition", () => {
    expect(() => AcquisitionSchema.parse({
      startDateTime: "2024-01-01T00:00:00Z",
      endDateTime: "2024-01-02T00:00:00Z",
      acquirer: "Some Company",
    })).to.not.throw();
  });

  it("should coerce date strings", () => {
    const result = AcquisitionSchema.parse({ startDateTime: "2024-06-15T12:00:00Z" });
    expect(result.startDateTime).to.be.instanceOf(Date);
  });
});

describe("RealityDataBaseSchema", () => {
  it("should validate an empty object (all fields optional)", () => {
    expect(() => RealityDataBaseSchema.parse({})).to.not.throw();
  });

  it("should validate a full base object", () => {
    expect(() => RealityDataBaseSchema.parse({
      classification: Classification.IMAGERY,
      description: "A test reality data",
      tags: ["tag1", "tag2"],
      authoring: false,
    })).to.not.throw();
  });

  it("should throw for invalid classification", () => {
    expect(() => RealityDataBaseSchema.parse({ classification: "InvalidClass" })).to.throw(z.ZodError);
  });
});

describe("RealityDataCreateSchema", () => {
  const valid = {
    iTwinId: "itwin-001",
    displayName: "My Reality Data",
    type: Type.CC_IMAGE_COLLECTION,
  };

  it("should validate a minimal create payload", () => {
    expect(() => RealityDataCreateSchema.parse(valid)).to.not.throw();
  });

  it("should throw for missing iTwinId", () => {
    expect(() => RealityDataCreateSchema.parse({ ...valid, iTwinId: undefined })).to.throw(z.ZodError);
  });

  it("should throw for missing displayName", () => {
    expect(() => RealityDataCreateSchema.parse({ ...valid, displayName: undefined })).to.throw(z.ZodError);
  });

  it("should throw for invalid type", () => {
    expect(() => RealityDataCreateSchema.parse({ ...valid, type: "BadType" })).to.throw(z.ZodError);
  });
});

describe("RealityDataSchema", () => {
  const valid = {
    id: "rd-001",
    displayName: "My Reality Data",
    type: Type.LAS,
    createdDateTime: "2024-01-01T00:00:00Z",
    modifiedDateTime: "2024-01-02T00:00:00Z",
    lastAccessedDateTime: "2024-01-03T00:00:00Z",
    dataCenterLocation: "East US",
    size: 1024,
  };

  it("should validate a full reality data object", () => {
    expect(() => RealityDataSchema.parse(valid)).to.not.throw();
  });

  it("should coerce date strings to Date objects", () => {
    const result = RealityDataSchema.parse(valid);
    expect(result.createdDateTime).to.be.instanceOf(Date);
    expect(result.modifiedDateTime).to.be.instanceOf(Date);
    expect(result.lastAccessedDateTime).to.be.instanceOf(Date);
  });

  it("should throw for negative size", () => {
    expect(() => RealityDataSchema.parse({ ...valid, size: -1 })).to.throw(z.ZodError);
  });

  it("should throw for missing required fields", () => {
    expect(() => RealityDataSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("RealityDataUpdateSchema", () => {
  it("should validate an empty update (all fields optional)", () => {
    expect(() => RealityDataUpdateSchema.parse({})).to.not.throw();
  });

  it("should validate a partial update", () => {
    expect(() => RealityDataUpdateSchema.parse({ displayName: "New Name", authoring: true })).to.not.throw();
  });
});

describe("RealityDataMinimalSchema", () => {
  it("should validate a minimal reality data", () => {
    expect(() => RealityDataMinimalSchema.parse({
      id: "rd-001",
      displayName: "Minimal RD",
      type: Type.E57,
    })).to.not.throw();
  });

  it("should throw for missing id", () => {
    expect(() => RealityDataMinimalSchema.parse({ displayName: "Minimal RD", type: Type.E57 })).to.throw(z.ZodError);
  });
});

describe("URLSchema", () => {
  it("should validate a correct URL object", () => {
    expect(() => URLSchema.parse({ href: "https://example.com" })).to.not.throw();
  });

  it("should throw for missing href", () => {
    expect(() => URLSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("ContainerLinksSchema", () => {
  it("should validate a correct ContainerLinks object", () => {
    expect(() => ContainerLinksSchema.parse({ containerUrl: { href: "https://blob.example.com" } })).to.not.throw();
  });

  it("should throw for missing containerUrl", () => {
    expect(() => ContainerLinksSchema.parse({})).to.throw(z.ZodError);
  });
});

describe("ContainerDetailsSchema", () => {
  const valid = {
    type: ContainerType.AZURE_BLOB_SAS_URL,
    access: Access.READ,
    _links: { containerUrl: { href: "https://blob.example.com?sas=token" } },
  };

  it("should validate a correct ContainerDetails object", () => {
    expect(() => ContainerDetailsSchema.parse(valid)).to.not.throw();
  });

  it("should validate with WRITE access", () => {
    expect(() => ContainerDetailsSchema.parse({ ...valid, access: Access.WRITE })).to.not.throw();
  });

  it("should throw for invalid access", () => {
    expect(() => ContainerDetailsSchema.parse({ ...valid, access: "BadAccess" })).to.throw(z.ZodError);
  });

  it("should throw for missing _links", () => {
    expect(() => ContainerDetailsSchema.parse({ type: ContainerType.AZURE_BLOB_SAS_URL, access: Access.READ })).to.throw(z.ZodError);
  });
});

describe("RealityDatasSchema", () => {
  it("should validate a list with minimal reality data", () => {
    expect(() => RealityDatasSchema.parse({
      realityData: [{ id: "rd-001", displayName: "RD1", type: Type.LAS }],
      links: { next: { href: "https://api.bentley.com/reality-data?continuationToken=abc" } },
    })).to.not.throw();
  });

  it("should validate an empty list", () => {
    expect(() => RealityDatasSchema.parse({
      realityData: [],
      links: { next: { href: "https://api.bentley.com/reality-data" } },
    })).to.not.throw();
  });
});

describe("RealityDataFilterSchema", () => {
  it("should validate an empty filter", () => {
    expect(() => RealityDataFilterSchema.parse({})).to.not.throw();
  });

  it("should validate a filter with all fields", () => {
    expect(() => RealityDataFilterSchema.parse({
      iTwinId: "itwin-001",
      $top: 50,
      types: [Type.LAS, Type.E57],
      ownerId: "owner-001",
    })).to.not.throw();
  });

  it("should throw for $top exceeding max", () => {
    expect(() => RealityDataFilterSchema.parse({ $top: 1001 })).to.throw(z.ZodError);
  });

  it("should throw for $top below min", () => {
    expect(() => RealityDataFilterSchema.parse({ $top: 0 })).to.throw(z.ZodError);
  });
});

describe("RealityDataFilter.asParamsForServiceCall", () => {
  it("should exclude undefined fields", () => {
    const filter: RealityDataFilter = { iTwinId: "itwin-001" };
    const params = realityDataFilterAsParams(filter);
    expect(params).to.have.key("iTwinId");
    expect(Object.keys(params)).to.have.lengthOf(1);
  });

  it("should convert dateTime tuples to 'start/end' strings", () => {
    const filter: RealityDataFilter = {
      createdDateTime: ["2024-01-01T00:00:00Z", "2024-12-31T00:00:00Z"],
    };
    const params = realityDataFilterAsParams(filter);
    expect(params["createdDateTime"]).to.equal("2024-01-01T00:00:00Z/2024-12-31T00:00:00Z");
  });

  it("should handle multiple datetime range fields", () => {
    const filter: RealityDataFilter = {
      createdDateTime: ["2024-01-01T00:00:00Z", "2024-06-01T00:00:00Z"],
      modifiedDateTime: ["2024-02-01T00:00:00Z", "2024-07-01T00:00:00Z"],
    };
    const params = realityDataFilterAsParams(filter);
    expect(params["createdDateTime"]).to.equal("2024-01-01T00:00:00Z/2024-06-01T00:00:00Z");
    expect(params["modifiedDateTime"]).to.equal("2024-02-01T00:00:00Z/2024-07-01T00:00:00Z");
  });

  it("should pass non-datetime fields through unchanged", () => {
    const filter: RealityDataFilter = { iTwinId: "itwin-123", $top: 10 };
    const params = realityDataFilterAsParams(filter);
    expect(params["iTwinId"]).to.equal("itwin-123");
    expect(params["$top"]).to.equal(10);
  });
});

describe("RealityCaptureService reality data API calls", function () {
  let service: RealityCaptureService;
  let fetchStub: sinon.SinonStub;

  const rdId = "rd-uuid-001";
  const iTwinId = "itwin-uuid-001";

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

  beforeEach(() => {
    const getAccessTokenStub = sinon.stub().resolves("fake-token");
    const mockAuthClient = { getAccessToken: getAccessTokenStub } as AuthorizationClient;
    service = new RealityCaptureService(mockAuthClient, { env: "dev" });
    fetchStub = sinon.stub(globalThis, "fetch");
  });

  afterEach(() => {
    sinon.restore();
  });


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
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } } ));
    const result = await service.getRealityData(rdId);
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
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("HeaderNotFound");
  });

  it("getRealityDataWriteAccess ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityDataWriteAccess(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityDataList should return a Response<RealityDatas> with minimal prefer", async () => {
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
    const callArgs = fetchStub.firstCall.args[1];
    expect(callArgs.headers["Prefer"]).to.equal("return=representation");
  });

  it("getRealityDataList should send Prefer: return=minimal by default", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
    },
    ));
    await service.getRealityDataList();
    const callArgs = fetchStub.firstCall.args[1];
    expect(callArgs.headers["Prefer"]).to.equal("return=minimal");
  });

  it("getRealityDataList should pass filter as params", async () => {
    fetchStub.resolves(mockFetchResponse(200, {
      realityData: [],
      links: { next: { href: "https://dev-api.bentley.com/reality-management/reality-data/" } },
    },
    ));
    await service.getRealityDataList({ iTwinId, $top: 10 });
    const calledUrl = new URL(fetchStub.firstCall.args[0]);
    expect(calledUrl.origin + calledUrl.pathname).to.equal("https://dev-api.bentley.com/reality-management/reality-data");
    expect(calledUrl.searchParams.get("iTwinId")).to.equal(iTwinId);
    expect(calledUrl.searchParams.get("$top")).to.equal("10");
  });

  it("getRealityDataList 401 error", async () => {
    fetchStub.resolves(mockFetchResponse(401, { error: { code: "HeaderNotFound", message: "Access denied." } } ));
    const result = await service.getRealityDataList();
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
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("RealityDataNotFound");
  });

  it("getRealityDataITwins ill formed error", async () => {
    fetchStub.resolves(mockFetchResponse(500, { bad: "response" } ));
    const result = await service.getRealityDataITwins(rdId);
    expect(result.isError()).to.equal(true);
    expect(result.error!.error.code).to.equal("UnknownError");
  });

  it("getRealityData should encode the realityDataId in the URL", async () => {
    fetchStub.resolves(mockFetchResponse(200, { realityData: sampleRealityData } ));
    const specialId = "rd/with special&chars";
    await service.getRealityData(specialId);
    expect(fetchStub.firstCall.args[0]).to.include(encodeURIComponent(specialId));
  });

  it("deleteRealityData should encode the realityDataId in the URL", async () => {
    fetchStub.resolves(mockFetchResponse(204, {} ));
    const specialId = "rd/with special&chars";
    await service.deleteRealityData(specialId);
    expect(fetchStub.firstCall.args[0]).to.include(encodeURIComponent(specialId));
  });
});

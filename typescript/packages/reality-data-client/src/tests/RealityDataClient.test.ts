/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import sinon from "sinon";
import { RealityDataAccessClient } from "../RealityDataClient";
import { ITwinRealityData } from "../RealityData";
import { RealityDataClientError } from "../RealityDataClientError";
import { mockFetchResponse, mockRCSuccess, mockRCError, sampleRealityDataPayload } from "./test_helpers";

describe("RealityDataAccessClient constructor / URL", () => {
  it("should use default prod baseUrl", () => {
    const client = new RealityDataAccessClient();
    expect(client.baseUrl).to.include("api.bentley.com");
    expect(client.baseUrl).to.not.include("dev-api");
    expect(client.baseUrl).to.not.include("qa-api");
  });

  it("should accept dev baseUrl", () => {
    const client = new RealityDataAccessClient({ baseUrl: "https://dev-api.bentley.com" });
    expect(client.baseUrl).to.include("dev-api.bentley.com");
  });

  it("should accept qa baseUrl", () => {
    const client = new RealityDataAccessClient({ baseUrl: "https://qa-api.bentley.com" });
    expect(client.baseUrl).to.include("qa-api.bentley.com");
  });

  it("should throw for an invalid host", () => {
    expect(() => new RealityDataAccessClient({ baseUrl: "https://unknown.example.com" })).to.throw();
  });
});

describe("RealityDataAccessClient authorizationClient override", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should use authorizationClient.getAccessToken() instead of the provided token", async () => {
    const getAccessToken = sinon.stub().resolves("override-token");
    const client = new RealityDataAccessClient({ authorizationClient: { getAccessToken } });
    const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
    await client.getRealityDatas("original-token", "iTwin-1", undefined);
    expect(getAccessToken.calledOnce).to.be.true;
    const headers = (fetchStub.firstCall.args[1] as RequestInit).headers as Record<string, string>;
    expect(headers["authorization"]).to.equal("override-token");
  });
});

describe("RealityDataAccessClient getRealityDataUrl", () => {
  let client: RealityDataAccessClient;

  beforeEach(() => {
    client = new RealityDataAccessClient();
  });

  it("should include realityDataId and iTwinId in the URL", async () => {
    const url = await client.getRealityDataUrl("iTwin-1", "rd-001");
    expect(url).to.include("rd-001");
    expect(url).to.include("iTwinId=iTwin-1");
  });

  it("should include realityDataId but not iTwinId when iTwinId is undefined", async () => {
    const url = await client.getRealityDataUrl(undefined, "rd-001");
    expect(url).to.include("rd-001");
    expect(url).to.not.include("iTwinId");
  });
});

describe("RealityDataAccessClient API calls", () => {
  let client: RealityDataAccessClient;

  beforeEach(() => {
    client = new RealityDataAccessClient();
  });

  afterEach(() => {
    sinon.restore();
  });

  // ─── getRealityData ──────────────────────────────────────────────────────────

  describe("getRealityData", () => {
    it("should return an ITwinRealityData on success", async () => {
      sinon.stub((client as any)._rcService, "getRealityData").resolves(mockRCSuccess(sampleRealityDataPayload));
      const result = await client.getRealityData("token", "iTwin-1", "rd-001");
      expect(result).to.be.instanceOf(ITwinRealityData);
      expect(result.id).to.equal("rd-001");
      expect(result.displayName).to.equal("Test Reality Data");
    });

    it("should reject when service returns an error response", async () => {
      sinon.stub((client as any)._rcService, "getRealityData").resolves(mockRCError(401, "Unauthorized"));
      try {
        await client.getRealityData("token", "iTwin-1", "rd-001");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Unauthorized");
      }
    });
  });

  // ─── getRealityDatas ─────────────────────────────────────────────────────────

  describe("getRealityDatas", () => {
    it("should return a RealityDataResponse with an array of ITwinRealityData", async () => {
      sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, {
        realityData: [sampleRealityDataPayload],
        _links: {},
      }));
      const result = await client.getRealityDatas("token", "iTwin-1", undefined);
      expect(result.realityDatas).to.have.lengthOf(1);
      expect(result.realityDatas[0]).to.be.instanceOf(ITwinRealityData);
      expect(result.realityDatas[0].id).to.equal("rd-001");
    });

    it("should extract continuationToken from _links.next.href", async () => {
      sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, {
        realityData: [],
        _links: { next: { href: "https://api.bentley.com/reality-management/reality-data?ContinuationToken=abc123" } },
      }));
      const result = await client.getRealityDatas("token", "iTwin-1", undefined);
      expect(result.continuationToken).to.equal("abc123");
    });

    it("should reject when top exceeds 500", async () => {
      try {
        await client.getRealityDatas("token", "iTwin-1", { top: 501 });
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("500");
      }
    });

    it("should pass $top query param when top is provided", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { top: 10 });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("%24top=10");
    });

    it("should append search query param", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { search: "myKeyword" });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("search=myKeyword");
    });

    it("should append orderBy query param", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { orderBy: "size desc" });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("orderBy");
      expect(calledUrl).to.include("size+desc");
    });

    it("should append types query param", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { types: ["CCImageCollection", "OPC"] });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("types=CCImageCollection%2COPC");
    });

    it("should append ownerId query param", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { ownerId: "user-123" });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("ownerId=user-123");
    });

    it("should append tag query param", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { tag: "my-tag" });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("tag=my-tag");
    });

    it("should append acquisitionDates range query param", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", {
        acquisitionDates: { startDateTime: new Date("2024-01-01"), endDateTime: new Date("2024-06-01") },
      });
      const calledUrl: string = fetchStub.firstCall.args[0].toString();
      expect(calledUrl).to.include("acquisitionDateTime");
      expect(calledUrl).to.include("2024-01-01");
      expect(calledUrl).to.include("2024-06-01");
    });

    it("should send Prefer: return=representation when getFullRepresentation is true", async () => {
      const fetchStub = sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { realityData: [], _links: {} }));
      await client.getRealityDatas("token", "iTwin-1", { getFullRepresentation: true });
      const requestInit = fetchStub.firstCall.args[1] as RequestInit;
      const headers = requestInit.headers as Record<string, string>;
      expect(headers["prefer"]).to.equal("return=representation");
    });

    it("should reject with RealityDataClientError on network failure", async () => {
      sinon.stub(globalThis, "fetch").rejects(new TypeError("Failed to fetch"));
      try {
        await client.getRealityDatas("token", "iTwin-1", undefined);
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error).to.be.instanceOf(RealityDataClientError);
        expect(error.errorNumber).to.equal(422);
      }
    });
  });

  // ─── createRealityData ───────────────────────────────────────────────────────

  describe("createRealityData", () => {
    it("should return a new ITwinRealityData on success", async () => {
      sinon.stub((client as any)._rcService, "createRealityData").resolves(mockRCSuccess(sampleRealityDataPayload));
      const toCreate = new ITwinRealityData(client, sampleRealityDataPayload, "iTwin-1");
      const result = await client.createRealityData("token", "iTwin-1", toCreate);
      expect(result).to.be.instanceOf(ITwinRealityData);
      expect(result.id).to.equal("rd-001");
    });

    it("should reject when service returns an error response", async () => {
      sinon.stub((client as any)._rcService, "createRealityData").resolves(mockRCError(403, "Forbidden"));
      const toCreate = new ITwinRealityData(client, sampleRealityDataPayload, "iTwin-1");
      try {
        await client.createRealityData("token", "iTwin-1", toCreate);
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Forbidden");
      }
    });
  });

  // ─── modifyRealityData ───────────────────────────────────────────────────────

  describe("modifyRealityData", () => {
    it("should return an updated ITwinRealityData on success", async () => {
      const updated = { ...sampleRealityDataPayload, displayName: "Updated Name" };
      sinon.stub((client as any)._rcService, "updateRealityData").resolves(mockRCSuccess(updated));
      const toModify = new ITwinRealityData(client, sampleRealityDataPayload, "iTwin-1");
      const result = await client.modifyRealityData("token", "iTwin-1", toModify);
      expect(result).to.be.instanceOf(ITwinRealityData);
      expect(result.displayName).to.equal("Updated Name");
    });

    it("should reject when service returns an error response", async () => {
      sinon.stub((client as any)._rcService, "updateRealityData").resolves(mockRCError(404, "Not Found"));
      const toModify = new ITwinRealityData(client, sampleRealityDataPayload, "iTwin-1");
      try {
        await client.modifyRealityData("token", "iTwin-1", toModify);
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Not Found");
      }
    });
  });

  // ─── deleteRealityData ───────────────────────────────────────────────────────

  describe("deleteRealityData", () => {
    it("should return true on success", async () => {
      sinon.stub((client as any)._rcService, "deleteRealityData").resolves(mockRCSuccess(null));
      const result = await client.deleteRealityData("token", "rd-001");
      expect(result).to.be.true;
    });

    it("should reject when service returns an error response", async () => {
      sinon.stub((client as any)._rcService, "deleteRealityData").resolves(mockRCError(404, "Not Found"));
      try {
        await client.deleteRealityData("token", "rd-001");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Not Found");
      }
    });
  });

  // ─── associateRealityData ────────────────────────────────────────────────────

  describe("associateRealityData", () => {
    it("should return true on success", async () => {
      sinon.stub((client as any)._rcService, "associateRealityData").resolves(mockRCSuccess(null));
      const result = await client.associateRealityData("token", "iTwin-1", "rd-001");
      expect(result).to.be.true;
    });

    it("should reject when service returns an error response", async () => {
      sinon.stub((client as any)._rcService, "associateRealityData").resolves(mockRCError(404, "Not Found"));
      try {
        await client.associateRealityData("token", "iTwin-1", "rd-001");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Not Found");
      }
    });
  });

  // ─── dissociateRealityData ───────────────────────────────────────────────────

  describe("dissociateRealityData", () => {
    it("should return true on success", async () => {
      sinon.stub((client as any)._rcService, "dissociateRealityData").resolves(mockRCSuccess(null));
      const result = await client.dissociateRealityData("token", "iTwin-1", "rd-001");
      expect(result).to.be.true;
    });

    it("should reject on error", async () => {
      sinon.stub((client as any)._rcService, "dissociateRealityData").resolves(mockRCError(404, "Association not found"));
      try {
        await client.dissociateRealityData("token", "iTwin-1", "rd-001");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Association not found");
      }
    });
  });

  // ─── moveRealityData ─────────────────────────────────────────────────────────

  describe("moveRealityData", () => {
    it("should return true on success", async () => {
      sinon.stub((client as any)._rcService, "moveRealityData").resolves(mockRCSuccess(null));
      const result = await client.moveRealityData("token", "rd-001", "iTwin-2");
      expect(result).to.be.true;
    });

    it("should reject on error", async () => {
      sinon.stub((client as any)._rcService, "moveRealityData").resolves(mockRCError(409, "Already associated"));
      try {
        await client.moveRealityData("token", "rd-001", "iTwin-2");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Already associated");
      }
    });
  });

  // ─── getRealityDataITwins ────────────────────────────────────────────────────

  describe("getRealityDataITwins", () => {
    it("should return an array of iTwin identifiers", async () => {
      sinon.stub((client as any)._rcService, "getRealityDataITwins").resolves(mockRCSuccess(["iTwin-1", "iTwin-2"]));
      const result = await client.getRealityDataITwins("token", "rd-001");
      expect(result).to.deep.equal(["iTwin-1", "iTwin-2"]);
    });

    it("should reject on error", async () => {
      sinon.stub((client as any)._rcService, "getRealityDataITwins").resolves(mockRCError(401, "Unauthorized"));
      try {
        await client.getRealityDataITwins("token", "rd-001");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error.message).to.include("Unauthorized");
      }
    });
  });

  // ─── getRealityDataProjects (deprecated) ─────────────────────────────────────

  describe("getRealityDataProjects", () => {
    it("should return an array of Projects on success", async () => {
      sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(200, { iTwins: ["iTwin-1", "iTwin-2"] }));
      const result = await client.getRealityDataProjects("token", "rd-001");
      expect(result).to.have.lengthOf(2);
      expect(result[0].id).to.equal("iTwin-1");
    });

    it("should reject when fetch returns a non-ok response", async () => {
      sinon.stub(globalThis, "fetch").resolves(mockFetchResponse(401, { error: { code: "Unauthorized", message: "Unauthorized" } }));
      try {
        await client.getRealityDataProjects("token", "rd-001");
        expect.fail("should have thrown");
      } catch (error: any) {
        expect(error).to.be.instanceOf(RealityDataClientError);
        expect(error.errorNumber).to.equal(401);
      }
    });
  });
});

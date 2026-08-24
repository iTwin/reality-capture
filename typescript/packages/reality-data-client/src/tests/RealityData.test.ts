/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import sinon from "sinon";
import { ITwinRealityData, type Acquisition } from "../RealityData";
import { RealityDataAccessClient } from "../RealityDataClient";
import { mockFetchResponse, sampleContainerUrl, sampleRealityDataPayload } from "./test_helpers";

describe("ITwinRealityData constructor", () => {
  let client: RealityDataAccessClient;

  beforeEach(() => {
    client = new RealityDataAccessClient();
  });

  it("should create an instance with all properties from realityData payload", () => {
    const rd = new ITwinRealityData(client, sampleRealityDataPayload, "iTwin-1");
    expect(rd.id).to.equal("rd-001");
    expect(rd.displayName).to.equal("Test Reality Data");
    expect(rd.type).to.equal("CCImageCollection");
    expect(rd.classification).to.equal("Imagery");
    expect(rd.rootDocument).to.equal("root.json");
    expect(rd.iTwinId).to.equal("iTwin-1");
    expect(rd.modifiedDateTime).to.be.instanceOf(Date);
    expect(rd.createdDateTime).to.be.instanceOf(Date);
    expect(rd.lastAccessedDateTime).to.be.instanceOf(Date);
  });

  it("should create an instance without realityData payload", () => {
    const rd = new ITwinRealityData(client, undefined, "iTwin-1");
    expect(rd.id).to.be.undefined;
    expect(rd.displayName).to.be.undefined;
    expect(rd.iTwinId).to.equal("iTwin-1");
  });

  it("should not set iTwinId when not provided", () => {
    const rd = new ITwinRealityData(client);
    expect(rd.iTwinId).to.be.undefined;
  });

  it("should parse acquisition dates", () => {
    const payload = {
      ...sampleRealityDataPayload,
      acquisition: {
        startDateTime: "2024-03-01T00:00:00.000Z",
        endDateTime: "2024-03-10T00:00:00.000Z",
        acquirer: "Company A",
      },
    };
    const rd = new ITwinRealityData(client, payload, "iTwin-1");
    expect(rd.acquisition).to.not.be.undefined;
    expect((rd.acquisition as Acquisition).startDateTime).to.be.instanceOf(Date);
    expect((rd.acquisition as Acquisition).endDateTime).to.be.instanceOf(Date);
    expect((rd.acquisition as Acquisition).acquirer).to.equal("Company A");
  });

  it("should handle acquisition without optional fields", () => {
    const payload = {
      ...sampleRealityDataPayload,
      acquisition: { startDateTime: "2024-03-01T00:00:00.000Z" },
    };
    const rd = new ITwinRealityData(client, payload, "iTwin-1");
    expect((rd.acquisition as Acquisition).endDateTime).to.be.undefined;
    expect((rd.acquisition as Acquisition).acquirer).to.be.undefined;
  });
});

describe("ITwinRealityData getBlobUrl", () => {
  let client: RealityDataAccessClient;
  let rd: ITwinRealityData;
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    client = new RealityDataAccessClient();
    rd = new ITwinRealityData(client, sampleRealityDataPayload, "iTwin-1");
    fetchStub = sinon.stub(globalThis, "fetch");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return a URL combining container URL and blob path", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    const url = await rd.getBlobUrl("fake-token", "data/file.json");
    expect(fetchStub.calledOnce).to.be.true;
    expect(url).to.be.instanceOf(URL);
    expect(url.href).to.include("data/file.json");
    expect(url.href).to.include("account.blob.core.windows.net");
  });

  it("should include the SAS query string in the blob URL", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    const url = await rd.getBlobUrl("fake-token", "tiles/0.b3dm");
    expect(url.search).to.include("sv=2020-08-04");
  });

  it("should return container URL when blobPath is undefined", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    const url = await rd.getBlobUrl("fake-token", undefined as any);
    expect(url.href).to.equal(new URL(sampleContainerUrl).href);
  });

  it("should use cached container URL on second call", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    await rd.getBlobUrl("fake-token", "file.json");
    await rd.getBlobUrl("fake-token", "other.json");
    expect(fetchStub.calledOnce).to.be.true;
  });

  it("should request write access URL when writeAccess is true", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    await rd.getBlobUrl("fake-token", "file.json", true);
    const calledUrl: string = (fetchStub.firstCall.args[0] as URL).toString();
    expect(calledUrl).to.include("writeAccess");
  });

  it("should request read access URL by default", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    await rd.getBlobUrl("fake-token", "file.json");
    const calledUrl: string = (fetchStub.firstCall.args[0] as URL).toString();
    expect(calledUrl).to.include("readAccess");
  });

  it("should throw when client is not set", async () => {
    rd.client = undefined;
    try {
      await rd.getBlobUrl("fake-token", "file.json");
      expect.fail("should have thrown");
    } catch (error: any) {
      expect(error.message).to.include("RealityDataAccessClient");
    }
  });

  it("should throw when axios returns no data", async () => {
    fetchStub.resolves(mockFetchResponse(422, null));
    try {
      await rd.getBlobUrl("fake-token", "file.json");
      expect.fail("should have thrown");
    } catch (error: any) {
      expect(error.message).to.be.a("string");
    }
  });

  it("should use separate caches for read and write access", async () => {
    fetchStub.resolves(mockFetchResponse(200, { _links: { containerUrl: { href: sampleContainerUrl } } }));
    await rd.getBlobUrl("fake-token", "file.json", false); // read — populates read cache
    await rd.getBlobUrl("fake-token", "file.json", true);  // write — different cache, must fetch again
    expect(fetchStub.callCount).to.equal(2);
  });
});

/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { type AccessToken, type GuidString, Logger, LogLevel} from "@itwin/core-bentley";
import { CartographicRange, type RealityData, type RealityDataAccess } from "@itwin/core-common";
import { Point3d, Range3d, Transform } from "@itwin/core-geometry";

import { ApiVersion, RealityDataAccessClient, type RealityDataClientOptions, type RealityDataQueryCriteria } from "../../RealityDataClient";
import { TestConfig } from "../TestConfig";
import { ITwinRealityData } from "../../RealityData";

/* eslint-disable @typescript-eslint/naming-convention */

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isInstanceOfDate(object: any): object is Date {
  return object;
}

chai.config.showDiff = true;

chai.should();
chai.use(chaiAsPromised);

const LOG_CATEGORY: string = "RealityDataClient.Test";

Logger.initializeToConsole();
Logger.setLevel(LOG_CATEGORY, LogLevel.Info);

const realityDataClientConfig: RealityDataClientOptions = {
  version: ApiVersion.v1,
  baseUrl: "https://api.bentley.com/reality-management/reality-data",
};

describe("RealityServicesClient Normal (#integration)", () => {

  let iTwinId: GuidString;

  const tilesId: string = "f2065aea-5dcd-49e2-9077-e082dde506bc";

  let accessToken: AccessToken;

  before(async () => {
    accessToken = await TestConfig.getAccessToken();
    iTwinId = TestConfig.integrationTestsItwinId;
    chai.assert.isDefined(iTwinId);
  });

  it("should properly redirect configured URL to proper Reality Data API URL", async () => {

    // dev
    const realityDataClientConfigDev: RealityDataClientOptions = {
      version: ApiVersion.v1,
      baseUrl: "https://dev-api.bentley.com/realitydata",
    };

    const realityDataAccessClientDev = new RealityDataAccessClient(realityDataClientConfigDev);
    chai.assert(realityDataAccessClientDev.baseUrl === "https://dev-api.bentley.com/reality-management/reality-data");

    // qa
    const realityDataClientConfigQa:  RealityDataClientOptions = {
      version: ApiVersion.v1,
      baseUrl: "https://qa-api.bentley.com/www.someotherfakehost.com/",
    };

    const realityDataAccessClientQa = new RealityDataAccessClient(realityDataClientConfigQa);
    chai.assert(realityDataAccessClientQa.baseUrl === "https://qa-api.bentley.com/reality-management/reality-data");

    // prod
    const realityDataClientConfigProd: RealityDataClientOptions = {
      version: ApiVersion.v1,
      baseUrl: "https://api.bentley.com/realitydata",
    };

    const realityDataAccessClientProd = new RealityDataAccessClient(realityDataClientConfigProd);
    chai.assert(realityDataAccessClientProd.baseUrl === "https://api.bentley.com/reality-management/reality-data");

    // error test
    const realityDataClientConfigError:  RealityDataClientOptions = {
      version: ApiVersion.v1,
      baseUrl: "https://evilwebsite.net",
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const realityDataAccessClientError = new RealityDataAccessClient(realityDataClientConfigError);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.message === "invalid host", `Error message should be 'invalid host'. It is '${errorResponse.errorNumber}.`);
      return;
    }

  });

  it("should return a RealityData URL properly from a given ID", async () => {
    try {
      const realityDataId = "f2065aea-5dcd-49e2-9077-e082dde506bc";
      const realityDataAccessClient = new RealityDataAccessClient();

      // test with iTwinId
      let realityDataUrl = await realityDataAccessClient.getRealityDataUrl(iTwinId, realityDataId);
      const expectedUrl = `${realityDataClientConfig.baseUrl}/f2065aea-5dcd-49e2-9077-e082dde506bc?iTwinId=${iTwinId}`;
      chai.assert(realityDataUrl === expectedUrl);

      // test without iTwinId
      realityDataUrl = await realityDataAccessClient.getRealityDataUrl(undefined, realityDataId);
      chai.assert(realityDataUrl === `${realityDataClientConfig.baseUrl}/f2065aea-5dcd-49e2-9077-e082dde506bc`);

    } catch (errorResponse: any) {
      throw Error(`Test error: ${errorResponse}`);
    }
  });

  it("should return a RealityData from a given ID", async () => {
    try {
      const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
      let realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, tilesId);
      chai.assert(realityData);
      chai.assert(realityData.id === tilesId);

      // test without iTwinId
      await delay(1000);
      realityData = await realityDataAccessClient.getRealityData(accessToken, undefined, tilesId);
      chai.assert(realityData);
      chai.assert(realityData.id === tilesId);

    } catch (errorResponse: any) {
      throw Error(`Test error: ${errorResponse}`);
    }
  });

  it("should return a RealityData from a given ID and respect RealityDataAccessProps interfaces", async () => {
    try {
      const realityDataAccessClient: RealityDataAccess = new RealityDataAccessClient(realityDataClientConfig);
      const realityData: RealityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, tilesId);
      chai.assert(realityData);
      chai.assert(realityData.id === tilesId);
    } catch (errorResponse: any) {
      throw Error(`Test error: ${errorResponse}`);
    }
  });

  // TODO remove once getRealityDataProjects method is removed in next major release
  it("should be able to get project information from a RealityData", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    // displayName: iTwinjs RealityData Client get projects test, id: d344d5ec-5068-4752-9432-ff1c8f087111
    const realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, "d344d5ec-5068-4752-9432-ff1c8f087111");

    chai.assert(realityData);
    // get all projects information

    // eslint-disable-next-line deprecation/deprecation
    const projects = await realityDataAccessClient.getRealityDataProjects(accessToken, realityData.id);
    chai.assert(projects);
    chai.assert(projects.length === 2);
    projects.forEach((value) => {
      chai.assert(value.id);
      chai.assert(value.projectDetailsLink);
    });

  });

  it("should be able to get iTwin information from a RealityData", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    // displayName: iTwinjs RealityData Client get projects test, id: d344d5ec-5068-4752-9432-ff1c8f087111
    const realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, "d344d5ec-5068-4752-9432-ff1c8f087111");

    chai.assert(realityData);
    // get all projects information
    const projects = await realityDataAccessClient.getRealityDataITwins(accessToken, realityData.id);
    chai.assert(projects);
    chai.assert(projects.length === 2);
    projects.forEach((value) => {
      chai.assert(value);
    });

  });

  it("should be able to retrieve the azure blob url", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, tilesId);
    const url: URL = await realityData.getBlobUrl(accessToken, "test");
    chai.assert(url);
    chai.assert(url.toString().includes("test"));

    // cache test, wait 1 second and make the same call again, url should be the same.
    await delay(1000);
    const fakeAccessToken = "fake"; // this ensures that we are not executing a request to APIM for a new SAS url, otherwise it would fail
    const url2: URL = await realityData.getBlobUrl(fakeAccessToken, "test");
    chai.assert(url.href === url2.href);

    // cache test, wait 1 second and request the same reality data with WRITE access, url should be different.
    await delay(1000);
    const url2_write: URL = await realityData.getBlobUrl(accessToken, "test", true);
    chai.assert(url2.href !== url2_write.href);

    // test without iTwinId
    await delay(1000);

    const realityData2 = await realityDataAccessClient.getRealityData(accessToken, undefined, tilesId);
    const url3: URL = await realityData2.getBlobUrl(accessToken, "test");
    chai.assert(url3);
    chai.assert(url3.toString().includes("test"));

  });

  it("should be able to retrieve reality data properties for every reality data associated with iTwin", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, undefined);
    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas);

    realityDatas.forEach((value) => {
      // chai.assert(value.rootDocument ); // not every RealityData has a root document.
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
    });

  });

  it("should be able to retrieve reality data properties for every available realitydata", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, undefined, undefined);
    const realityDatas = realityDataResponse.realityDatas;

    chai.assert(realityDatas);

    realityDatas.forEach((value) => {
      chai.assert(value.id);
      chai.assert(value.type);
      chai.assert(value.displayName);
    });

  });

  it("should query the first 10 reality data using the $top=10 parameter", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      top: 10,
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas);

    chai.assert(realityDatas.length === 10);
    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
    });

    // max results > 500 should fail.
    const badRealityDataQueryCriteria: RealityDataQueryCriteria = {
      top: 501,
    };
    await chai.expect(realityDataAccessClient.getRealityDatas(accessToken, iTwinId, badRealityDataQueryCriteria)).to.eventually.be.rejectedWith(Error);
  });

  it("should be able to query using continuationToken", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    // get the first 5
    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      top: 5,
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas);

    chai.assert(realityDatas.length === 5);
    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
    });

    chai.assert(realityDataResponse.continuationToken);

    // get another 5 with continuation token
    const realityDataQueryCriteriaContinuationToken: RealityDataQueryCriteria = {
      top: 5,
      continuationToken: realityDataResponse.continuationToken,
    };

    const realityDataResponseContinuation = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteriaContinuationToken);

    const realityDatasContinued = realityDataResponseContinuation.realityDatas;
    chai.assert(realityDatasContinued);

    chai.assert(realityDatasContinued.length === 5);
    realityDatasContinued.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
    });

    // test until no more continuation
    const realityDataQueryUntilTheEnd: RealityDataQueryCriteria = {
      top: 5,
      continuationToken: realityDataResponseContinuation.continuationToken,
    };

    while (realityDataQueryUntilTheEnd.continuationToken) {
      const realityDataResponseUntilTheEnd = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryUntilTheEnd);
      realityDataQueryUntilTheEnd.continuationToken = realityDataResponseUntilTheEnd.continuationToken;
    }

  });

  it("should be able to retrieve reality data properties for every reality data associated with iTwin within an extent", async () => {

    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const cornerSpatial = new Array<Point3d>();
    cornerSpatial.push(new Point3d(813907, -4775048, 4135438));
    cornerSpatial.push(new Point3d(814123, -4776318, 4135438));
    cornerSpatial.push(new Point3d(812222, -4776642, 4135438));
    cornerSpatial.push(new Point3d(812007, -4775372, 4135438));

    const rdRange = Range3d.createArray(cornerSpatial);
    const rdCartographicRange = new CartographicRange(rdRange, Transform.createIdentity());

    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      top: 10,
      extent: rdCartographicRange,
    };
    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    chai.expect(realityDataResponse);

    // currently in prod, only one result should be possible
    /*
      id: 'de1badb3-012f-4f18-b28a-57d3f2164ba8',
      extent: {
        southWest: { latitude: 40.6706, longitude: -80.3455 },
        northEast: { latitude: 40.6716, longitude: -80.3359 }
      }
    */
    // with http request : https://api.bentley.com/reality-management/realitydata/?iTwinId=614a3c70-cc9f-4de9-af87-f834002ca19e&$top=10&extent=-80.35221279383678,40.6693689301031,-80.32437826187261,40.68067531423824'
    chai.expect(realityDataResponse.realityDatas.length === 1);
    chai.assert(realityDataResponse.realityDatas[0].id === "de1badb3-012f-4f18-b28a-57d3f2164ba8");

  });

  it("should get a realityData and should create an ITwinRealityData instance with proper types", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityDataResponse = await realityDataAccessClient.getRealityData(accessToken, iTwinId, "ac78eae2-496a-4d26-a87d-1dab0b93ab00");

    chai.assert(realityDataResponse.id === "ac78eae2-496a-4d26-a87d-1dab0b93ab00");
    chai.assert(realityDataResponse.displayName === "property test realityData");
    chai.assert(realityDataResponse.dataset === "Dataset");
    chai.assert(realityDataResponse.group === "GroupId");
    chai.assert(realityDataResponse.description === "Description of the reality data");

    chai.assert(realityDataResponse.rootDocument === "samples/sample.3mx");

    chai.assert(realityDataResponse.acquisition != null);
    chai.assert(isInstanceOfDate(realityDataResponse.acquisition?.startDateTime));
    chai.assert(realityDataResponse.acquisition?.startDateTime.getTime() === new Date("2021-05-12T20:03:12Z").getTime());
    chai.assert(isInstanceOfDate(realityDataResponse.acquisition?.endDateTime));
    chai.assert(realityDataResponse.acquisition?.endDateTime.getTime() === new Date("2021-05-15T05:07:18Z").getTime());
    chai.assert(realityDataResponse.acquisition?.acquirer === "Data Acquisition Inc.");
    chai.assert(realityDataResponse.extent != null);
    chai.assert(realityDataResponse.extent?.southWest.latitude === 50.1171);
    chai.assert(realityDataResponse.extent?.southWest.longitude === -122.9543);
    chai.assert(realityDataResponse.extent?.northEast.latitude === 50.1172);
    chai.assert(realityDataResponse.extent?.northEast.longitude === -122.9543);
    chai.assert(realityDataResponse.authoring === false);
    chai.assert(realityDataResponse.dataCenterLocation === "East US");
    chai.assert(realityDataResponse.modifiedDateTime?.getTime() === new Date("2021-12-01T21:17:38Z").getTime());
    chai.assert(realityDataResponse.lastAccessedDateTime?.getTime() === new Date("2021-12-01T21:17:38Z").getTime());
    chai.assert(realityDataResponse.createdDateTime?.getTime() === new Date("2021-12-01T21:17:38Z").getTime());

  });

  it("should be able to create, then modify a reality data (without specific identifier) and delete it", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const realityData = new ITwinRealityData(realityDataAccessClient);
    realityData.displayName = "iTwinjs RealityData Client create and delete test";
    realityData.dataset = "Test Dataset for iTwinjs";
    realityData.group = "Test group";
    realityData.description = "Dummy description for a test reality data";
    realityData.rootDocument = "RootDocumentFile.txt";
    realityData.classification = "Undefined";
    realityData.type = "3MX";
    realityData.acquisition = {
      startDateTime: new Date("2019-05-10T09:46:16Z"),
      endDateTime: new Date("2019-05-10T09:46:16Z"),
      acquirer: "John Doe Surveying using Leico model 123A Point Cloud Scanner",
    };
    realityData.extent = {
      southWest: {
        latitude: 1.0,
        longitude: 2.0,
      },
      northEast: {
        latitude: 1.1,
        longitude: 2.1,
      },
    };

    realityData.authoring = false;

    const realityDataAdded = await realityDataAccessClient.createRealityData(accessToken, iTwinId, realityData);
    chai.assert(realityDataAdded.id);
    chai.assert(realityDataAdded.displayName === realityData.displayName);
    chai.assert(realityDataAdded.group === realityData.group);
    chai.assert(realityDataAdded.dataset === realityData.dataset);
    chai.assert(realityDataAdded.description === realityData.description);
    chai.assert(realityDataAdded.rootDocument === realityData.rootDocument);
    chai.assert(realityDataAdded.classification === realityData.classification);
    chai.assert(realityDataAdded.type?.toLowerCase() === realityData.type.toLowerCase());

    chai.assert(realityDataAdded.acquisition!.acquirer === realityData.acquisition.acquirer);
    chai.assert(realityDataAdded.acquisition!.startDateTime.getTime() === realityData.acquisition.startDateTime.getTime());
    chai.assert(realityDataAdded.acquisition!.endDateTime!.getTime() === realityData.acquisition.endDateTime!.getTime());

    chai.assert(realityDataAdded.extent!.southWest.latitude === 1.0);
    chai.assert(realityDataAdded.extent!.southWest.longitude === 2.0);
    chai.assert(realityDataAdded.extent!.northEast.latitude === 1.1);
    chai.assert(realityDataAdded.extent!.northEast.longitude === 2.1);

    chai.assert(realityDataAdded.authoring === false);
    chai.assert(realityDataAdded.dataCenterLocation === "East US");

    chai.assert(realityDataAdded.modifiedDateTime!.getTime());
    chai.assert(realityDataAdded.lastAccessedDateTime!.getTime());
    chai.assert(realityDataAdded.createdDateTime!.getTime());
    // At creation the last accessed time stamp remains null. ?

    realityDataAdded.displayName = "MODIFIED iTwinjs RealityData Client create and delete test";
    const realityDataModified = await realityDataAccessClient.modifyRealityData(accessToken, iTwinId, realityDataAdded);

    chai.assert(realityDataModified.displayName === realityDataAdded.displayName);

    chai.assert(await realityDataAccessClient.deleteRealityData(accessToken, realityDataAdded.id));
  });

  it("should be able to create RealityData, associate, dissociate, and delete it", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const iTwinId2 = "84856374-51ed-4f13-a386-6721e01f87a3"; // Integration Tests for Reality Data Client 2

    const realityData = new ITwinRealityData(realityDataAccessClient);
    realityData.displayName = "iTwinjs RealityData Client associate and dissociate test";
    realityData.classification = "Undefined";
    realityData.type = "3MX";

    const realityDataAdded = await realityDataAccessClient.createRealityData(accessToken, iTwinId, realityData);

    chai.assert(await realityDataAccessClient.associateRealityData(accessToken, iTwinId2, realityDataAdded.id));

    chai.assert(await realityDataAccessClient.dissociateRealityData(accessToken, iTwinId2, realityDataAdded.id));

    chai.assert(await realityDataAccessClient.deleteRealityData(accessToken, realityDataAdded.id));
  });

  it("should be able to create RealityData, modify, and delete (Without iTwinId)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const realityData = new ITwinRealityData(realityDataAccessClient);
    realityData.displayName = "iTwinjs RealityData Client CRUD test without iTwinId";
    realityData.classification = "Undefined";
    realityData.type = "3MX";

    // current test user belongs to no organization and needs a iTwin to create realityData. However, the modify without iTwinId can be tested.
    const realityDataAdded = await realityDataAccessClient.createRealityData(accessToken, iTwinId, realityData);

    realityDataAdded.displayName = "MODIFIED iTwinjs RealityData Client CRUD test without iTwinId";
    const realityDataModified = await realityDataAccessClient.modifyRealityData(accessToken, undefined, realityDataAdded);

    chai.assert(realityDataModified.displayName === realityDataAdded.displayName);

    chai.assert(await realityDataAccessClient.deleteRealityData(accessToken, realityDataAdded.id));
  });
});

describe("RealityServicesClient Errors (#integration)", () => {

  let iTwinId: GuidString;

  const nonexistentTilesId: string = "f2065aea-5dcd-49e2-9077-000000000000";

  let accessToken: AccessToken;

  before(async () => {
    accessToken = await TestConfig.getAccessToken();
    iTwinId = TestConfig.integrationTestsItwinId;
    chai.assert.isDefined(iTwinId);
  });

  it("should throw a 422 error when Reality Data ID is not a valid Guid", async () => {
    const rdId = "f2065aea-5dcd-49e2-9077-xxxxxxxxxxxx";
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    try {
      await realityDataAccessClient.getRealityData(accessToken, iTwinId, rdId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 422, `Error code should be 422. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "getRealityData should throw an error.");
  });

  it("should throw a 404 error when Reality Data ID does not exist.", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    try {
      await realityDataAccessClient.getRealityData(accessToken, iTwinId, nonexistentTilesId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "getRealityData should throw an error.");
  });

  it("should throw a 422 error when the iTwinId is invalid (getting all reality data in a iTwin)", async () => {
    const invalidITwinId = "xxxxxxxx-cc9f-4de9-af87-f834002ca19e";
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    try {
      await realityDataAccessClient.getRealityDatas(accessToken, invalidITwinId, undefined);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 422, `Error message should be 422. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "getRealityDatas should throw an error.");
  });

  it("should throw a 422 error when the top parameter is > 500 (getting all reality data in a iTwin)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      top: 501,
    };

    try {
      await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 422, `Error code should be 422. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "getRealityDatas should throw an error when top parameter is > 500.");
  });

  it("should throw a 422 error when required properties are missing (creating a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    // displayName is missing
    const realityData = new ITwinRealityData(realityDataAccessClient);
    realityData.dataset = "Test Dataset for iTwinjs";
    realityData.description = "Dummy description for a test reality data";
    realityData.type = "3MX";
    realityData.classification = "Undefined";
    try {
      await realityDataAccessClient.createRealityData(accessToken, iTwinId, realityData);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 422, `Error code should be 422. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "createRealityData should throw an error.");
  });

  it("should throw a 404 error when reality data id does not exist (modifying a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityData = new ITwinRealityData(realityDataAccessClient);
    realityData.id = nonexistentTilesId;
    realityData.displayName = "MODIFIED iTwinjs RealityData";
    realityData.dataset = "Test Dataset for iTwinjs";
    realityData.description = "Dummy description for a test reality data";
    realityData.type = "3MX";
    realityData.classification = "Undefined";
    try {
      await realityDataAccessClient.modifyRealityData(accessToken, iTwinId, realityData);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "createRealityData should throw an error.");
  });

  it("should throw a 404 error when reality data id does not exist (deleting a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    try {
      await realityDataAccessClient.deleteRealityData(accessToken, nonexistentTilesId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "deleteRealityData should throw an error.");
  });

  it("should throw a 404 error when reality data id does not exist (associate a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    try {
      await realityDataAccessClient.associateRealityData(accessToken, iTwinId, nonexistentTilesId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "associateRealityData should throw an error.");
  });

  it("should throw a 404 error when reality data id does not exist (dissociate a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    try {
      await realityDataAccessClient.dissociateRealityData(accessToken, iTwinId, nonexistentTilesId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "dissociateRealityData should throw an error.");
  });
});

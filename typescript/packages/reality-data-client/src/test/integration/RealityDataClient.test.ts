/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-inferrable-types */
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
/* eslint-disable @typescript-eslint/no-shadow */

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const iTwinId: GuidString = TestConfig.integrationTestsITwinId;
  const iTwinId2: GuidString = TestConfig.integrationTestsITwinIdProjects;

  const realityDataAccessClient = new RealityDataAccessClient();

  let realityDataId: string;
  let realityDataIdProjects: string;

  // test RealityData for listing tests.
  const realityDataList: ITwinRealityData[] = [];

  let accessToken: AccessToken;

  before(async () => {

    // get token
    accessToken = await TestConfig.getAccessToken();

    chai.assert.isDefined(iTwinId);
    chai.assert.isDefined(iTwinId2);

    /* eslint-disable no-console */
    console.log("Creating test reality data...");

    // create a test reality data
    let rdTest = new ITwinRealityData(realityDataAccessClient,
      {
        displayName: "iTwinjs reality-data-client test, can be deleted",
        type: "3MX",
      },
      iTwinId);
    rdTest = await realityDataAccessClient.createRealityData(accessToken, iTwinId, rdTest);
    chai.assert(rdTest, "Failed to create test reality data");
    realityDataId = rdTest.id;

    // create a test reality data associated to both iTwins
    let rdTestProjects = new ITwinRealityData(realityDataAccessClient,
      {
        displayName: "iTwinjs reality-data-client projects, can be deleted",
        type: "3MX",
      },
      iTwinId);
    rdTestProjects = await realityDataAccessClient.createRealityData(accessToken, iTwinId, rdTestProjects);
    await realityDataAccessClient.associateRealityData(accessToken, iTwinId2, rdTestProjects.id);
    chai.assert(rdTestProjects, "Failed to create test reality data");

    // create 10 reality data for listing tests
    for (let i = 0; i < 10; i++) {
      let rd = new ITwinRealityData(realityDataAccessClient,
        {
          displayName: `iTwinjs reality-data-client listing test ${i}, can be deleted`,
          type: "3MX",
        },
        iTwinId);
      rd = await realityDataAccessClient.createRealityData(accessToken, iTwinId, rd);
      chai.assert(rd, `Failed to create test reality data ${i}`);
      realityDataList.push(rd);
    }

    realityDataIdProjects = rdTestProjects.id;

    /* eslint-disable no-console */
    console.log("Creating test reality data...done");
  });

  after(async () => {
    // delete the test reality data
    /* eslint-disable no-console */
    console.log("Cleaning test reality data...");

    const deleteResult = await realityDataAccessClient.deleteRealityData(accessToken, realityDataId);
    chai.assert(deleteResult, "Failed to delete test reality data");

    const dissociateResult = await realityDataAccessClient.dissociateRealityData(accessToken, iTwinId2, realityDataIdProjects);
    chai.assert(dissociateResult, "Failed to dissociate test reality data");
    const deleteResult2 = await realityDataAccessClient.deleteRealityData(accessToken, realityDataIdProjects);
    chai.assert(deleteResult2, "Failed to delete test reality data");

    // delete the test reality data for listing tests
    for (let i = 0; i < 10; i++) {
      const deleteResult = await realityDataAccessClient.deleteRealityData(accessToken, realityDataList[i].id);
      chai.assert(deleteResult, `Failed to delete test reality data ${i}`);
    }

    /* eslint-disable no-console */
    console.log("Cleaning test reality data...done");
  });

  it("should properly redirect configured URL to proper Reality Management API URL", async () => {

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

      // test with iTwinId
      let realityDataUrl = await realityDataAccessClient.getRealityDataUrl(iTwinId, realityDataId);
      const expectedUrl = `${realityDataClientConfig.baseUrl}/${realityDataId}?iTwinId=${iTwinId}`;
      chai.assert(realityDataUrl === expectedUrl);

      // test without iTwinId
      realityDataUrl = await realityDataAccessClient.getRealityDataUrl(undefined, realityDataId);
      chai.assert(realityDataUrl === `${realityDataClientConfig.baseUrl}/${realityDataId}`);

    } catch (errorResponse: any) {
      throw Error(`Test error: ${errorResponse}`);
    }
  });

  it("should return a RealityData from a given ID", async () => {
    try {
      const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
      let realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, realityDataId);
      chai.assert(realityData);
      chai.assert(realityData.id === realityDataId);

      // test without iTwinId
      await delay(1000);
      realityData = await realityDataAccessClient.getRealityData(accessToken, undefined, realityDataId);
      chai.assert(realityData);
      chai.assert(realityData.id === realityDataId);

    } catch (errorResponse: any) {
      throw Error(`Test error: ${errorResponse}`);
    }
  });

  it("should return a RealityData from a given ID and respect RealityDataAccessProps interfaces", async () => {
    try {
      const realityDataAccessClient: RealityDataAccess = new RealityDataAccessClient(realityDataClientConfig);
      const realityData: RealityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, realityDataId);
      chai.assert(realityData);
      chai.assert(realityData.id === realityDataId);
    } catch (errorResponse: any) {
      throw Error(`Test error: ${errorResponse}`);
    }
  });

  // TODO remove once getRealityDataProjects method is removed in next major release
  it("should be able to get project information from a RealityData", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    // displayName: iTwinjs RealityData Client get projects test, id: d344d5ec-5068-4752-9432-ff1c8f087111
    const realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, realityDataIdProjects);

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
    const realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, realityDataIdProjects);

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
    const realityData = await realityDataAccessClient.getRealityData(accessToken, iTwinId, realityDataId);
    const url: URL = await realityData.getBlobUrl(accessToken, "test");
    chai.assert(url);
    chai.assert(url.toString().includes("test"));

    // cache test, wait 1 second and make the same call again, url should be the same.
    await delay(1000);
    const fakeAccessToken = "fake"; // this ensures that we are not executing a request to the API for a new SAS url, otherwise it would fail
    const url2: URL = await realityData.getBlobUrl(fakeAccessToken, "test");
    chai.assert(url.href === url2.href);

    // cache test, wait 1 second and request the same reality data with WRITE access, url should be different.
    await delay(1000);
    const url2_write: URL = await realityData.getBlobUrl(accessToken, "test", true);
    chai.assert(url2.href !== url2_write.href);

    // test without iTwinId
    await delay(1000);

    const realityData2 = await realityDataAccessClient.getRealityData(accessToken, undefined, realityDataId);
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

  it("should query reality data using the $orderby parameter", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      getFullRepresentation: true,
      top: 10,
      orderBy: "createdDateTime desc",
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas);

    let lastCreatedTime = Date.now();

    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
      chai.assert(value.createdDateTime!.getTime() <= lastCreatedTime);
      lastCreatedTime = value.createdDateTime!.getTime()!;
    });
  });

  it("should query reality data using the $search parameter with the search term: This is a fairly simple description.", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      getFullRepresentation: true,
      top: 10,
      search: "This is a fairly simple description.",
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas && realityDatas.length > 0, "No reality data found. Please verify test reality data exists with description 'This is a fairly simple description.'.");

    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
      chai.assert(value.description!.includes("This is a fairly simple description."));
    });
  });

  it("should query reality data using the types parameter", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const types = ["3MX", "3SM"];
    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      top: 10,
      types,
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas && realityDatas.length > 0, "No reality data found. Please verify test reality data exists with types 3MX and 3SM.");

    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
      chai.assert(value.type === "3MX" || value.type === "3SM");
    });
  });

  it("should query reality data using the acquisitionDateTime parameter", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      getFullRepresentation: true,
      top: 10,
      acquisitionDates: {
        startDateTime: new Date(2017,5,12),
        endDateTime: new Date(2023,5,12),
      },
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas && realityDatas.length > 0, "No reality data found. Please verify test reality data exists with acquisition dates between 2017-05-12 and 2023-05-12.");

    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
      chai.assert(value.acquisition);
      chai.assert(value.acquisition?.startDateTime);
      chai.assert(value.acquisition?.startDateTime.getTime() >= new Date(2017,5,12).getTime());
      chai.assert(value.acquisition?.startDateTime.getTime() <= new Date(2022,5,12).getTime());
    });
  });

  it("should query reality data using the createdDateTime parameter", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      getFullRepresentation: true,
      top: 10,
      createdDateTime: {
        startDateTime: new Date(2021,5,12),
        endDateTime: new Date(2022,5,12),
      },
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas && realityDatas.length > 0, "No reality data found. Please verify test reality data exists with creation dates between 2021-05-12 and 2022-05-12.");

    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
      chai.assert(value.createdDateTime);
      chai.assert(value.createdDateTime.getTime() >= new Date(2021,5,12).getTime());
      chai.assert(value.createdDateTime.getTime() <= new Date(2022,5,12).getTime());
    });
  });

  it("should query reality data using the tag parameter", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    const realityDataQueryCriteria: RealityDataQueryCriteria = {
      getFullRepresentation: true,
      top: 10,
      tag: "tag1",
    };

    const realityDataResponse = await realityDataAccessClient.getRealityDatas(accessToken, iTwinId, realityDataQueryCriteria);

    const realityDatas = realityDataResponse.realityDatas;
    chai.assert(realityDatas && realityDatas.length > 0, "No reality data found. Please verify test reality data exists with tag 'tag1'.");

    realityDatas.forEach((value) => {
      chai.assert(value.iTwinId === iTwinId);
      chai.assert(value.type);
      chai.assert(value.id);
      chai.assert(value.tags);
      chai.assert(value.tags.includes("tag1"));
    });
  });

  it("should be able to retrieve reality data properties for every reality data associated with iTwin within an extent", async () => {

    // arrange
    let rdWithExtent = new ITwinRealityData(realityDataAccessClient,
      {
        displayName: "iTwinjs reality-data-client test with extent, can be deleted",
        type: "3SM",
        extent: {
          southWest: { latitude: 40.6706, longitude: -80.3455 },
          northEast: { latitude: 40.6716, longitude: -80.3359 },
        },
      },
      iTwinId);
    rdWithExtent = await realityDataAccessClient.createRealityData(accessToken, iTwinId, rdWithExtent);
    chai.assert(rdWithExtent, "Failed to create test reality data");
    const rdWithExtentId = rdWithExtent.id;

    // act
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

    // assert
    chai.assert(realityDataResponse);
    chai.assert(realityDataResponse.realityDatas.length > 0, "No reality data found. Please verify test reality data exists within the given extent.");
    chai.assert(realityDataResponse.realityDatas.filter((rd) => rd.id === rdWithExtentId).length > 0);

    // delete the test reality data
    const deleteResult = await realityDataAccessClient.deleteRealityData(accessToken, rdWithExtentId);
    chai.assert(deleteResult, "Failed to delete test reality data");

  });

  it("should be able to create, modify, then delete a Reality Data", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);

    // this test also serves as a property test.
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
    realityData.tags = ["tag1", "tag2"];
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

    chai.assert(realityDataAdded.tags!.includes("tag1"));
    chai.assert(realityDataAdded.tags!.includes("tag2"));
    chai.assert(realityDataAdded.authoring === false);
    chai.assert(realityDataAdded.dataCenterLocation === "East US");

    chai.assert(realityDataAdded.modifiedDateTime!.getTime());
    chai.assert(realityDataAdded.lastAccessedDateTime!.getTime());
    chai.assert(realityDataAdded.createdDateTime!.getTime());

    realityDataAdded.displayName = "MODIFIED iTwinjs RealityData Client create and delete test";
    realityDataAdded.group = "MODIFIED Test group";
    realityDataAdded.dataset = "MODIFIED Test Dataset for iTwinjs";
    realityDataAdded.description = "MODIFIED Dummy description for a test reality data";
    realityDataAdded.rootDocument = "MODIFIED RootDocumentFile.txt";
    realityDataAdded.classification = "Model";
    realityDataAdded.type = "3SM";
    realityDataAdded.acquisition = {
      startDateTime:  new Date("2021-05-10T09:46:16Z"),
      endDateTime: new Date("2021-05-10T10:46:16Z"),
      acquirer:  "MODIFIED John Doe Surveying using Leico model 123A Point Cloud Scanner",
    };
    realityDataAdded.extent = { southWest: { latitude: 1.1, longitude: 2.0 }, northEast: { latitude: 1.2, longitude: 2.1 } };
    realityDataAdded.tags = ["tag1", "tag2", "tag3"];

    const realityDataModified = await realityDataAccessClient.modifyRealityData(accessToken, iTwinId, realityDataAdded);

    chai.assert(realityDataModified.displayName === realityDataAdded.displayName);
    chai.assert(realityDataModified.group === realityDataAdded.group);
    chai.assert(realityDataModified.dataset === realityDataAdded.dataset);
    chai.assert(realityDataModified.description === realityDataAdded.description);
    chai.assert(realityDataModified.rootDocument === realityDataAdded.rootDocument);
    chai.assert(realityDataModified.classification === realityDataAdded.classification);
    chai.assert(realityDataModified.type?.toLowerCase() === realityDataAdded.type.toLowerCase());
    chai.assert(realityDataModified.acquisition!.acquirer === realityDataAdded.acquisition.acquirer);
    chai.assert(realityDataModified.acquisition!.startDateTime.getTime() === realityDataAdded.acquisition.startDateTime.getTime());
    chai.assert(realityDataModified.acquisition!.endDateTime!.getTime() === realityDataAdded.acquisition.endDateTime!.getTime());
    chai.assert(realityDataModified.extent!.southWest.latitude === 1.1);
    chai.assert(realityDataModified.extent!.southWest.longitude === 2.0);
    chai.assert(realityDataModified.extent!.northEast.latitude === 1.2);
    chai.assert(realityDataModified.extent!.northEast.longitude === 2.1);
    chai.assert(realityDataModified.tags!.includes("tag1"));
    chai.assert(realityDataModified.tags!.includes("tag2"));
    chai.assert(realityDataModified.tags!.includes("tag3"));

    chai.assert(await realityDataAccessClient.deleteRealityData(accessToken, realityDataAdded.id));
  });

  it("should be able to create, associate, dissociate, and delete RealityData", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    const realityData = new ITwinRealityData(realityDataAccessClient);
    realityData.displayName = "iTwinjs RealityData Client associate and dissociate test";
    realityData.classification = "Undefined";
    realityData.type = "3MX";

    const realityDataAdded = await realityDataAccessClient.createRealityData(accessToken, iTwinId, realityData);

    chai.assert(await realityDataAccessClient.associateRealityData(accessToken, iTwinId2, realityDataAdded.id));

    chai.assert(await realityDataAccessClient.dissociateRealityData(accessToken, iTwinId2, realityDataAdded.id));

    chai.assert(await realityDataAccessClient.deleteRealityData(accessToken, realityDataAdded.id));
  });

  it("should be able to create modify, and delete  Reality Data, (Without iTwinId)", async () => {
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

  const nonExistentRealityDataId: string = "f2065aea-5dcd-49e2-9077-000000000000";

  let accessToken: AccessToken;

  before(async () => {
    accessToken = await TestConfig.getAccessToken();
    iTwinId = TestConfig.integrationTestsITwinId;
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
      await realityDataAccessClient.getRealityData(accessToken, iTwinId, nonExistentRealityDataId);
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
    realityData.id = nonExistentRealityDataId;
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
      await realityDataAccessClient.deleteRealityData(accessToken, nonExistentRealityDataId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "deleteRealityData should throw an error.");
  });

  it("should throw a 404 error when reality data id does not exist (associate a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    try {
      await realityDataAccessClient.associateRealityData(accessToken, iTwinId, nonExistentRealityDataId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "associateRealityData should throw an error.");
  });

  it("should throw a 404 error when reality data id does not exist (dissociate a reality data)", async () => {
    const realityDataAccessClient = new RealityDataAccessClient(realityDataClientConfig);
    try {
      await realityDataAccessClient.dissociateRealityData(accessToken, iTwinId, nonExistentRealityDataId);
    } catch (errorResponse: any) {
      chai.assert(errorResponse.errorNumber === 404, `Error code should be 404. It is ${errorResponse.errorNumber}.`);
      return;
    }
    chai.assert(false, "dissociateRealityData should throw an error.");
  });
});

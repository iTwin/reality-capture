/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import * as fs from "fs";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RealityCaptureService, RealityDataCreate, RealityDataHandler, Type } from "@itwin/reality-capture";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runUploadExample() {
  /**
   * This example shows how to upload and download data from/to an iTwin
   */

  // Inputs to provide. Please, adapt values
  const imagesPath = "D:/Datasets/Helico/Images";
  const outputPath = "D:/Downloads/Helico/Images";

  const imagesName = "Reality Capture SDK context scene example";

  // Script
  dotenv.config();

  const iTwinId = process.env.IMJS_ITWIN_ID ?? "";
  const clientId = process.env.IMJS_CLIENT_ID ?? "";
  const secret = process.env.IMJS_CLIENT_SECRET ?? "";
  const issuerUrl = "https://ims.bentley.com";

  const authorizationClient = new ServiceAuthorizationClient({
    clientId: clientId,
    scope: "itwin-platform",
    clientSecret: secret,
    authority: issuerUrl,
  });

  const realityDataHandler = new RealityDataHandler(authorizationClient);
  console.log("Reality Data handler initialized");

  const realityCaptureService = new RealityCaptureService(authorizationClient);
  console.log("Reality Capture service initialized");

  try {
    if(!fs.existsSync(imagesPath)) {
      throw new Error(imagesPath + " does not exist");
    }

    console.log("Upload images in ", iTwinId);
    const realityDataCreate: RealityDataCreate = { iTwinId: iTwinId, displayName: imagesName, type: Type.CC_IMAGE_COLLECTION };
    const createdRealityDataResponse = await realityCaptureService.createRealityData(realityDataCreate);
    if (createdRealityDataResponse.isError()) {
      throw new Error("Failed to create reality data : " + createdRealityDataResponse.error!.error.message);
    }
    const createdRealityData = createdRealityDataResponse.value!;
    const response = await realityDataHandler.uploadData(createdRealityData.id, imagesPath, "", iTwinId);
    if (response.isError()) {
      throw new Error("Failed to upload reality data : " + response.error!.error.message);
    }
    console.log("Successfully uploaded images")

    console.log("Downloading images in ", outputPath);
    const responseDownload = await realityDataHandler.downloadData(createdRealityData.id, outputPath, "", iTwinId);
    if (responseDownload.isError()) {
      throw new Error("Failed to download reality data : " + responseDownload.error!.error.message);
    }
    console.log("Successfully downloaded images");
  }
  catch (error: any) {
    console.log(error);
  }
}

runUploadExample();
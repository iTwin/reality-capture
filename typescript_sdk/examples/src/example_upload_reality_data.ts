/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RealityDataHandler } from "reality-capture";
import { RealityDataClientOptions, RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";

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

    const realityDataClientOptions: RealityDataClientOptions = {
      authorizationClient: authorizationClient,
      baseUrl: "https://api.bentley.com/reality-management/reality-data",
    };
    const realityDataClient = new RealityDataAccessClient(realityDataClientOptions);
    console.log("Reality Data Client initialized");

    try {
        console.log("Upload images in ", iTwinId);
        const realityData = new ITwinRealityData(realityDataClient, undefined, iTwinId);
        realityData.displayName = imagesName;
        realityData.type = "CCImageCollection";
        const createdRealityData = await realityDataClient.createRealityData("", iTwinId, realityData);
        const response = await realityDataHandler.uploadData(createdRealityData.id, imagesPath, "", iTwinId);
        if(response.isError()) {
            console.log("Failed to upload reality data : " + response.error!.error.message);
            return;
        }
        console.log("Successfully uploaded images")

        console.log("Downloading images in ", outputPath);
        const responseDownload = await realityDataHandler.downloadData(createdRealityData.id, outputPath, "", iTwinId);
        if(responseDownload.isError()) {
            console.log("Failed to download reality data : " + response.error!.error.message);
            return;
        }
        console.log("Successfully downloaded images");
    }
    catch(error: any) {
        console.log(error);
    }
}

runUploadExample();
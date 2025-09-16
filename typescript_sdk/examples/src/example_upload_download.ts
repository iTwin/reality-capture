/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RealityCaptureService, RealityDataHandler, Type } from "reality-capture";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runUploadExample() {
    /**
     * This example shows how to upload and download data from/to an iTwin
     */
    const imagesPath = "D:/Datasets/Helico/Images";
    const outputPath = "D:/output/download/Helico/Images";

    dotenv.config();

    const imagesName = "Reality Modeling SDK sample context scene"

    const iTwindId = process.env.IMJS_ITWIN_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_CLIENT_SECRET ?? "";
    const issuerUrl = "https://ims.bentley.com";

    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        scope: "itwin-platform",
        clientSecret: secret,
        authority: issuerUrl,
    });

    const tokenFactory = {
        get_token: async () => {
            return await authorizationClient.getAccessToken()
        }
    };
    const realityDataHandler = new RealityDataHandler(tokenFactory);
    console.log("Reality Data handler initialized");
    const realityCaptureService = new RealityCaptureService(tokenFactory);
    console.log("Reality Capture service initialized");

    try {
        console.log("Upload images in ", iTwindId);
        const realityDataId = await realityCaptureService.createRealityData({ iTwinId: iTwindId, displayName: imagesName, type: Type.CC_IMAGE_COLLECTION});
        if(realityDataId.isError()) {
            console.log("Failed to create reality data : " + realityDataId.error!.error.message);
            return;
        }
        const response = await realityDataHandler.uploadData(realityDataId.value!.id, imagesPath, "", iTwindId);
        if(response.isError()) {
            console.log("Failed to upload reality data : " + response.error!.error.message);
            return;
        }
        console.log("Successfully uploaded images")

        console.log("Downloading images in ", outputPath);
        realityDataHandler.downloadData(realityDataId.value!.id, outputPath, "", iTwindId);
        console.log("Successfully downloaded images");
    }
    catch(error: any) {
        console.log(error);
    }
}

runUploadExample();
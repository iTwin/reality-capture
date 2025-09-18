/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { BucketDataHandler } from "reality-capture";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runUploadExample() {
    /**
     * This example shows how to upload and download data from/to an iTwin bucket
     */

    // Inputs to provide. Please, adapt values
    const roiPath = "D:/Datasets/ROI";
    const outputPath = "D:/Downloads/ROI";

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

    const bucketDataHandler = new BucketDataHandler(authorizationClient);
    console.log("Bucket Data handler initialized");

    try {
        console.log("Upload ROI in ", iTwinId, " bucket");
        const response = await bucketDataHandler.uploadData(iTwinId, roiPath, "RealityCaptureExample/ROI");
        if(response.isError()) {
            console.log("Failed to upload reality data : " + response.error!.error.message);
            return;
        }
        console.log("Successfully uploaded ROI in iTwin bucket")

        console.log("Downloading ROI in ", outputPath);
        const responseDownload = await bucketDataHandler.downloadData(iTwinId, outputPath, "RealityCaptureExample/ROI");
        if(responseDownload.isError()) {
            console.log("Failed to download reality data : " + response.error!.error.message);
            return;
        }
        console.log("Successfully downloaded ROI from iTwin bucket");
    }
    catch(error: any) {
        console.log(error);
    }
}

runUploadExample();
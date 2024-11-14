/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { RealityDataTransferNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";

async function runRealityDataExample() {
    /**
     * This example uploads an images folder in the cloud, and downloads it
     */
    const images = "path to the images you want to upload";
    const outputPath = "path to the folder where you want to save downloads";
    const imagesName = "Test Upload Moto Photos";

    dotenv.config();

    const iTwinId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_REDIRECT_URL ?? "";
    const env = process.env.IMJS_ENV ?? "";
    const issuerUrl = env === "prod" ? "https://ims.bentley.com" : "https://qa-ims.bentley.com";

    console.log("Reality Data Transfer example");
    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" "),
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();
    
    let realityDataService: RealityDataTransferNode;
    if(env === "prod")
        realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    else
        realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient), "qa-");
    
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    console.log("Service initialized");

    // Upload images
    console.log("Uploading images to cloud");
    const id = await realityDataService.uploadRealityData(images, imagesName, RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
    console.log("Images uploaded successfully");

    // Download images
    console.log("Downloading images");
    await realityDataService.downloadRealityData(id, outputPath, iTwinId);
    console.log("Images downloaded successfully");
}

runRealityDataExample();
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
     * This example shows how to upload an images folder in the cloud, and how to download it
     * Requires a native iTwin application and a environment file to define IMJS_SAMPLE_PROJECT_ID, IMJS_SAMPLE_CLIENT_ID and IMJS_SAMPLE_CLIENT_REDIRECT_URL
     */

    // Inputs to provide

    // Required : path to the image folder to upload
    const imagesPath = "";
    // Required : path to the folder where the cloud images will be downloaded
    const outputPath = "";
    // Name of the images in the cloud
    const imagesName = "Sample_Upload_Images";

    // Script
    dotenv.config();

    const iTwinId = process.env.IMJS_SAMPLE_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_SAMPLE_CLIENT_ID ?? "";
    const redirectUrl = process.env.IMJS_SAMPLE_CLIENT_REDIRECT_URL ?? "";
    const issuerUrl = "https://ims.bentley.com";
    if(!iTwinId || !clientId || !redirectUrl) {
        console.log(".env file is not configured properly");
    }

    console.log("Reality Data Transfer example");
    const authorizationClient = new NodeCliAuthorizationClient({
        clientId: clientId,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" "),
        issuerUrl: issuerUrl,
        redirectUri: redirectUrl,
    });
    await authorizationClient.signIn();
    
    const realityDataService = new RealityDataTransferNode(authorizationClient.getAccessToken.bind(authorizationClient));
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    console.log("Service initialized");

    // Upload images
    console.log("Uploading images to cloud");
    const id = await realityDataService.uploadRealityData(imagesPath, imagesName, RealityDataType.CC_IMAGE_COLLECTION, iTwinId);
    console.log("Images uploaded successfully");

    // Download images
    console.log("Downloading images");
    await realityDataService.downloadRealityData(id, outputPath, iTwinId);
    console.log("Images downloaded successfully");
}

runRealityDataExample();
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { RealityDataTransferNode, defaultProgressHook } from "@itwin/reality-data-transfer";
import { RealityDataType } from "@itwin/reality-capture-common";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";


async function runRealityDataExample() {
    const imageCollection = "path to the folder yu want to upload";
    const outputPath = "path to the folder where you want to save downloads";
    const imageCollectionName = "Test Moto Photos";

    dotenv.config();

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
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
        realityDataService = new RealityDataTransferNode(authorizationClient);
    else
        realityDataService = new RealityDataTransferNode(authorizationClient, "qa-");
    
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    console.log("Service initialized");

    // Upload CCImageCollection
    console.log("Uploading CCImagesCollection to cloud");
    const id = await realityDataService.uploadRealityData(imageCollection, imageCollectionName, 
        RealityDataType.CC_IMAGE_COLLECTION, projectId);
    console.log("CCImagesCollection uploaded successfully");

    // Download CCImageCollection
    console.log("Downloading CCImagesCollection");
    await realityDataService.downloadRealityData(id, outputPath, projectId);
    console.log("CCImagesCollection downloaded successfully");
}

runRealityDataExample();
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CommonData, defaultProgressHook } from "reality-capture";
import { RealityDataTransferNode } from "reality-capture-node";
import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";


async function runRealityDataExample() {
    const imageCollection = "path to the folder yu want to upload";
    const outputPath = "path to the folder where you want to save downloads";
    const imageCollectionName = "Test Moto Photos";

    dotenv.config();

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const authority = process.env.IMJS_ISSUER_URL ?? "";

    console.log("Reality Data Transfer example");
    const authorizationClient = new ServiceAuthorizationClient({
        clientId: clientId,
        clientSecret: secret,
        scope: Array.from(RealityDataTransferNode.getScopes()).join(" "),
        authority: authority,
    });
    
    const realityDataService = new RealityDataTransferNode(authorizationClient);
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    console.log("Service initialized");

    // Upload CCImageCollection
    console.log("Uploading CCImagesCollection to cloud");
    const id = await realityDataService.uploadRealityData(imageCollection, imageCollectionName, 
        CommonData.RealityDataType.CC_IMAGE_COLLECTION, projectId);
    console.log("CCImagesCollection uploaded successfully");

    // Download CCImageCollection
    console.log("Downloading CCImagesCollection");
    await realityDataService.downloadRealityData(id, outputPath, projectId);
    console.log("CCImagesCollection downloaded successfully");
}

runRealityDataExample();
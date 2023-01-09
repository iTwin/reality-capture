/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CommonData, defaultProgressHook, RealityDataTransfer, ServiceTokenFactory } from "reality-capture";
import * as dotenv from "dotenv";


async function runRealityDataExample() {
    const ccImageCollection = "path to the folder yu want to upload";
    const outputPath = "path to the folder where you want to save downloads";
    const ccImageCollectionName = "Test Moto Photos";

    dotenv.config();

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";

    console.log("Reality Data Analysis sample job detecting 2D objects");
    const clientInfo: CommonData.ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataTransfer.getScopes()]), 
        secret: secret, env: "qa-"};
    const tokenFactory = new ServiceTokenFactory(clientInfo);
    await tokenFactory.getToken();
    if(!tokenFactory.isOk())
        console.log("Can't get the access token");
    
    const realityDataService = new RealityDataTransfer(tokenFactory);
    realityDataService.setUploadHook(defaultProgressHook);
    realityDataService.setDownloadHook(defaultProgressHook);
    console.log("Service initialized");

    // Upload CCImageCollection
    console.log("Uploading CCImagesCollection to cloud");
    const id = await realityDataService.uploadRealityData(ccImageCollection, ccImageCollectionName, 
        CommonData.RealityDataType.CC_IMAGE_COLLECTION, projectId);
    console.log("CCImagesCollection uploaded successfully");

    // Download CCImageCollection
    console.log("Downloading CCImagesCollection");
    await realityDataService.downloadRealityData(id, outputPath, projectId);
    console.log("CCImagesCollection downloaded successfully");
}

runRealityDataExample();
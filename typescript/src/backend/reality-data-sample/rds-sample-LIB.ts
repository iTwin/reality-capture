/*
 * Copyright © Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 */

"use strict";

// import module from Reality Data Client
import { Headers } from "node-fetch";
import * as dotenv from "dotenv";
import { AccessToken } from "@itwin/core-bentley";

// Load the .env file if it exists
dotenv.config();

const projectId = process.env.IMJS_PROJECT_ID as string;
const projectId2 = process.env.IMJS_PROJECT_ID2 as string;

// const realityData: RealityData = 
// {
//     "displayName": "RealityData Sample App",
//     "classification": "Model",
//     "type": "3mx",
//     "rootDocument":"samples/sample.3mx",
//     "description": "Description of the reality data",
//     "dataset": "Dataset",
//     "group": "GroupId",
//     "acquisition": {
//         "startDateTime": "2021-05-12T20:03:12Z",
//         "endDateTime": "2021-05-15T05:07:18Z",
//         "acquirer": "Data Acquisition Inc."
//     },
// 	"extent":
// 	{
// 		"southWest":
// 		{
// 			"latitude":50.1171,
// 			"longitude":-122.9543
// 		},
// 		"northEast":
// 		{
// 			"latitude":50.1172,
//             "longitude":-122.9543
// 		}
//     },
//     "authoring": false
// }

// const realityDataPayload: RealityDataPayload = {
//     projectId: projectId,
//     realityData: realityData
// }

// class RealityDataSample_base
// {
// 	private headers: Headers;

//     constructor(accessToken : AccessToken) 
// 	{
//         //set headers for all RealityData API HTTP requests
// 		const headers = 
//         {
//             'Content-Type': 'application/json',
//             'Accept': 'application/vnd.bentley.v1+json',
//             "Authorization": accessToken.toTokenString(IncludePrefix.Yes)
// 		};
// 		this.headers = new Headers(headers);
// 	}
// }

export class RealityDataSampleLIB
{
    protected headers : Headers;

    constructor(accessToken : AccessToken) 
    {
        //set headers for all RealityData API HTTP requests
        const h = 
        {
            "Content-Type": "application/json",
            "Accept": "application/vnd.bentley.v1+json",
            "Authorization": accessToken
        };
        this.headers = new Headers(h);
    }

    /** From EP:
     * main method showcasing the RealityDataClient library.
     *  Performs the following actions: 
     *  -creates a RealityData
     *  -gets the created RealityData
     *  -modifies the created RealityData
     *  -gets the RealityData's container (Azure blob SAS URL)
     *  -uploads content to the RealityData's container
     *  -downloads and displays uploaded content from the RealityData's container
     *  -associates the RealityData to an additional project
     *  -dissociates the RealityData from the additional project
     *  -dissociates the RealityData from the original project prior to deletion
     *  -deletes the RealityData
     */
    public async run() 
    {
        console.log("Getting all RealityData. May not return any results, depending on if your project contains any RealityData. This is mostly to show an example.");

        console.log("Creating a RealityData");
        
        console.log("Getting created RealityData");
        console.log("Modifying created RealityData");
        console.log("Get RealityData Container");
        //const realityDataContainer = await this.get_realityData_Container(createdRealityDataId, projectId, "Write") as any;
        //console.log(realityDataContainer);
        console.log("Uploading samples/sample.3mx to RealityData");
        //await this.uploadBlob_realityData(azureBlobUrl);
        console.log("Downloading samples/sample.3mx from RealityData");
        //await this.downloadBlob_realityData(azureBlobUrl);
        console.log("Uploading a Cesium3DTiles model to RealityData");
        //await this.uploadCesium3DTiles_to_realityData();

        console.log("Associating to project #2");
        console.log("Dissociating from project #2");
        console.log("Dissociating from project #1");
        console.log("Deleting RealityData");

        console.log("RealityDataLIB sample completed!");
    }
}

// taken from Microsoft's Azure sdk samples.
// https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/samples/typescript/src/basic.ts
// A helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> 
{
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        readableStream.on("data", (data: Buffer | string) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

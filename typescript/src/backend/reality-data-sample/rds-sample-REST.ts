/*
 * Copyright © Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 */

"use strict";

import { Headers} from "node-fetch";
import fetch from "node-fetch";
import { ContainerClient } from "@azure/storage-blob";
import * as dotenv from "dotenv";
import { AccessToken } from "@itwin/core-bentley";

// Load the .env file if it exists
dotenv.config();

export type RealityDataPayload = 
{
    projectId? : string;
    realityData: RealityData;
}

export type RealityData =
{
    id?: string;
    projectId?: string;
    displayName: string;
    dataset?: string;
    group?: string;
    dataLocation?: string;
    description?: string;
    rootDocument?: string;
    acquisition?: Acquisition;
    size?: number;
    authoring?: boolean;
    classification: string;
    type: string;
    extent?: Extent;
    modifiedDateTime?: string;
    lastAccessedDateTime?: string;
    createdDateTime?: string;
}

export type Extent = 
{
    southWest: Point;
    northEast: Point;
}

export type Point = 
{
    latitude: number;
    longitude: number;
}

export type Acquisition = 
{
    startDateTime: string;
    endDateTime?: string;
    acquirer?: string;
}

const projectId = process.env.IMJS_PROJECT_ID as string;
const projectId2 = process.env.IMJS_PROJECT_ID2 as string;

const realityData: RealityData = 
{
    "displayName": "RealityData Sample App",
    "classification": "Model",
    "type": "3mx",
    "rootDocument":"samples/sample.3mx",
    "description": "Description of the reality data",
    "dataset": "Dataset",
    "group": "GroupId",
    "acquisition": {
        "startDateTime": "2021-05-12T20:03:12Z",
        "endDateTime": "2021-05-15T05:07:18Z",
        "acquirer": "Data Acquisition Inc."
    },
    "extent":
    {
        "southWest":
        {
            "latitude":50.1171,
            "longitude":-122.9543
        },
        "northEast":
        {
            "latitude":50.1172,
            "longitude":-122.9543
        }
    },
    "authoring": false
};

const realityDataPayload: RealityDataPayload = {
    projectId: projectId,
    realityData: realityData
};

export class RealityDataSampleREST
{

    private headers : Headers;
    private urlBasePrefix : string;

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

        // Load the .env file if it exists
        dotenv.config();
        if(!process.env.REST_URL)
            throw new Error("Missing configuration value for REST_URL. Please verify your configuration in your .env file.");
        this.urlBasePrefix = process.env.REST_URL;
    }

    private getRDSBase() : string
    {
        return "https://" + this.urlBasePrefix + "/realitydata/";
    }

    private async get_all_realityData(projectId: string) 
    {
        let fetchUrl = this.getRDSBase() + "?projectId=" + projectId;

        //top parameter example
        fetchUrl += "&$top=5";

        //extent parameter example
        fetchUrl += "&extent=-75.637679,40.032871,-75.633647,40.032771";

        //continuation token also available!
        const response = await fetch(fetchUrl,
            {
                headers: this.headers, //you may want to add {"prefer":"return=representation"} header if you wish to see full representation of RealityData
                method: "GET"
            });

        if(response.status == 200)
            return await response.json();

        console.log(response);
        throw new Error("An error occurred while attempting to get RealityData");
    }

    private async get_realityData(realityDataId: string, projectId: string) 
    {
        const response = await fetch(this.getRDSBase() + realityDataId + "?projectId=" + projectId,
            {
                headers: this.headers,
                method: "GET"
            });

        console.log(response);

        if(response.status == 200)
            return await response.json();

        console.log(response);
        throw new Error("An error occurred while attempting to get RealityData");
    }

    private async post_realityData(realityData: RealityDataPayload) 
    {
        const response = await fetch(this.getRDSBase(),
            {
                headers: this.headers,
                method: "POST",
                body: JSON.stringify(realityData)
            });

        if(response.status == 201)
            return await response.json();

        console.log(response);
        throw new Error("An error occurred while attempting to create RealityData");
    }

    private async modify_realityData(realityData: RealityDataPayload)
    {
        const response = await fetch(this.getRDSBase() + realityData.realityData.id,
            {
                headers: this.headers,
                method: "PATCH",
                body: JSON.stringify(realityData)
            });

        if(response.status == 200)
            return await response.json();

        console.log(response);
        throw new Error("An error occurred while attempting to modify RealityData");
    }

    private async delete_realityData(realityDataId: string) 
    {
        const response = await fetch(this.getRDSBase() + realityDataId,
            {
                headers: this.headers,
                method: "DELETE"
            });

        if(response.status == 204)
            return await response.json();
		
        throw new Error("An error occurred while attempting to delete RealityData");
    }

    private async associate_realityData(realityDataId: string, projectId: string)
    {
        const response = await fetch(this.getRDSBase() + realityDataId + "/projects/" + projectId,
            {
                headers: this.headers,
                method: "PUT"
            });
        if(response.status == 201)
            return await response.json();

        throw new Error("An error occurred while attempting to associate RealityData");
    }

    private async dissociate_realityData(realityDataId: string, projectId: string)
    {
        const response = await fetch(this.getRDSBase() + realityDataId + "/projects/" + projectId,
            {
                headers: this.headers,
                method: "DELETE"
            });

        if (response.status == 204)
            return await response;
		
        throw new Error("An error occurred while attempting to dissociate RealityData");
    }

    private async uploadBlob_realityData(realityDataContainerUrl: string)
    {
        const blobContent = "This is a sample .3mx file";
        const blobName = "samples/sample.3mx";
        const blockBlobClient =  new ContainerClient(realityDataContainerUrl).getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(blobContent, Buffer.byteLength(blobContent));

        console.log(`Uploaded ${blobName} successfully`, uploadBlobResponse.requestId);
    }

    // This function shows how to upload a Cesium 3DTiles model to a reality data blob
    private async uploadCesium3DTiles_to_realityData()
    {
        // Important :  the type of the reality data must be "Cesium3DTiles" and the rootDocument must point to the root of the model,
        //              in this case "tileset.json". Thus, a client interpreting the reality data can find out which file format it handles,
        //              and what is the index (or root) of the data (tileset.json).
        const cesiumRealityData: RealityData = 
        {
            "displayName": "RealityData Cesium 3DTiles model",
            "classification": "Model",
            "type": "Cesium3DTiles",
            "rootDocument":"tileset.json"
        };
        
        const cesiumRealityDataPayload: RealityDataPayload = {
            projectId: projectId,
            realityData: cesiumRealityData
        };

        // Create the reality data and get the SAS URL
        const createResult = await this.post_realityData(cesiumRealityDataPayload) as any;
        const realityDataId = createResult.realityData.id;
        const realityDataContainer = await this.get_realityData_Container(realityDataId, projectId, "Write") as any;
        const azureBlobUrl = realityDataContainer.container._links.containerUrl.href;

        // Use Azure SDK's ContainerClient class to upload data to the Azure blob
        const containerClient =  new ContainerClient(azureBlobUrl);

        const filePath = "./data/cesium3DTiles/";
     
        // The sample 3DTiles model is composed of a root document (tileset.json) and three b3dm files.
        // Upload each file to its own blob
        let blobName = "tileset.json";
        let blockBlobClient =  containerClient.getBlockBlobClient(blobName);
        let uploadBlobResponse = await blockBlobClient.uploadFile(filePath + "tileset.json");
        console.log(`Uploaded ${blobName} successfully`, uploadBlobResponse.requestId);

        blobName = "dragon_high.b3dm";
        blockBlobClient =  containerClient.getBlockBlobClient(blobName);
        uploadBlobResponse = await blockBlobClient.uploadFile(filePath + "dragon_high.b3dm");
        console.log(`Uploaded ${blobName} successfully`, uploadBlobResponse.requestId);

        blobName = "dragon_low.b3dm";
        blockBlobClient =  containerClient.getBlockBlobClient(blobName);
        uploadBlobResponse = await blockBlobClient.uploadFile(filePath + "dragon_low.b3dm");
        console.log(`Uploaded ${blobName} successfully`, uploadBlobResponse.requestId);
    
        blobName = "dragon_medium.b3dm";
        blockBlobClient =  containerClient.getBlockBlobClient(blobName);
        uploadBlobResponse = await blockBlobClient.uploadFile(filePath + "dragon_medium.b3dm");
        console.log(`Uploaded ${blobName} successfully`, uploadBlobResponse.requestId);
    
        // This shows how to create a sub-folder in your container, if you ever need to.
        blobName = "readme/README.md";
        blockBlobClient =  containerClient.getBlockBlobClient(blobName);
        uploadBlobResponse = await blockBlobClient.uploadFile(filePath + "readme/README.md");
        console.log(`Uploaded ${blobName} successfully`, uploadBlobResponse.requestId);

        // Delete the reality data.
        await this.delete_realityData(realityDataId);
    }

    private async downloadBlob_realityData(realityDataContainerUrl: string)
    {
        const blobName = "samples/sample.3mx";

        const containerClient = new ContainerClient(realityDataContainerUrl);
        let i = 1;
        const iter = await containerClient.listBlobsFlat();
        for await (const blob of iter) 
        {
            console.log(`Blob ${i++}: ${blob.name}`);
        }
        
        const blob = await containerClient.getBlockBlobClient(blobName).download(0);

        console.log( "Downloaded blob content: ",(await streamToBuffer(blob.readableStreamBody!)).toString());
    }

    private async get_realityData_Container(realityDataId: string, projectId: string, access: string)
    {
        const response = await fetch(this.getRDSBase() + realityDataId + "/container?projectId=" + projectId + "&access=" + access,
            {
                headers: this.headers,
                method: "GET"
            });

        if(response.status == 200)
            return await response.json();
		
        // Handle errors
        console.log(response);
        throw new Error("An error occurred while attempting to get RealityData Container");
    }

    /**
     * main method showcasing the RealityData API. Performs the following actions: 
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
        const getAllResult = await this.get_all_realityData(projectId);
        console.log(getAllResult);

        console.log("Creating a RealityData");
        const createResult = await this.post_realityData(realityDataPayload) as any;
        console.log(createResult);

        const createdRealityDataId = createResult.realityData.id;

        console.log("Getting created RealityData");
        const getResult = await this.get_realityData(createdRealityDataId, projectId);
        console.log(getResult);

        console.log("Modifying created RealityData");
        const modifiedRealityData =
        {
            projectId: projectId,
            "realityData":
            {
                "id": createdRealityDataId,
                "displayName": "Modified RealityData Sample App",
                "classification": "Model",
                "type": "3mx"
            }		
        };
       
        const modifiedResult = await this.modify_realityData(modifiedRealityData);
        console.log(modifiedResult);

        console.log("Get RealityData Container");
        const realityDataContainer = await this.get_realityData_Container(createdRealityDataId, projectId, "Write") as any;
        console.log(realityDataContainer);

        const azureBlobUrl = realityDataContainer.container._links.containerUrl.href;

        console.log("Uploading samples/sample.3mx to RealityData");
        await this.uploadBlob_realityData(azureBlobUrl);

        console.log("Downloading samples/sample.3mx from RealityData");
        await this.downloadBlob_realityData(azureBlobUrl);

        console.log("Uploading a Cesium3DTiles model to RealityData");
        await this.uploadCesium3DTiles_to_realityData();

        if (projectId != projectId2)
        {
            console.log("Associating to project #2");
            const associateResult = await this.associate_realityData(createdRealityDataId, projectId2);
            console.log(associateResult);

            console.log("Dissociating from project #2");
            const dissociateResult1 = await this.dissociate_realityData(createdRealityDataId, projectId2);
            console.log(dissociateResult1);
        }
        console.log("Dissociating from project #1");
        const dissociateResult2 = await this.dissociate_realityData(createdRealityDataId, projectId);
        console.log(dissociateResult2);

        console.log("Deleting RealityData");
        const deletedResult = await this.delete_realityData(createdRealityDataId);
        console.log(deletedResult);

        console.log("RealityData sample REST completed!");
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

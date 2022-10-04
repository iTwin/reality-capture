/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import { AccessToken } from "@itwin/core-bentley";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import { BaseAppAccess } from "./BaseAppAccess";

// taken from Microsoft's Azure sdk samples.
// https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/samples/typescript/src/basic.ts
// A helper method used to read a Node.js readable stream into a Buffer
export async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> 
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

export class RealityDataClientBase extends BaseAppAccess
{
    constructor(accessToken : AccessToken) 
    {
        super(accessToken);
    }

    public getRDSBase() : string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata/"; }

    /**
     * Get the reality data from its id.
     * @param realityDataId request reality data.
     * @returns reality data.
     */
    public async getRealityData(realityDataId: string): Promise<ITwinRealityData> {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        const iTwinRealityData: ITwinRealityData = await rdaClient.getRealityData(this.accessToken, process.env.IMJS_PROJECT_ID, realityDataId);
        return iTwinRealityData;
    }

    /**
     * Get the reality data url from its id.
     * @param realityDataId id of requested reality data.
     * @param subFilePath reality data sub file path.
     * @param access reality data write access (default : read)
     * @returns the url of request reality data.
     */
    public async getRealityDataUrl(realityDataId: string, subFilePath?: string, writeAccess = false): Promise<string> {
        const realityData = await this.getRealityData(realityDataId);

        let blobPath = "";
        if(subFilePath !== undefined)
            blobPath = subFilePath;
        else if(realityData.rootDocument)
            blobPath = realityData.rootDocument;
        
        const url = await realityData.getBlobUrl(this.accessToken, blobPath, writeAccess);
        return await url.toString();
    }
    
    /**
     * Create an item on RDS.
     * @param displayName item display name.
     * @param dataType item data type, see https://dev.azure.com/bentleycs/Reality%20Modeling/_wiki/wikis/Reality-Modeling.wiki/23512/RDS-RealityData-types
     * @param dataDescr item description.
     * @param rootDocument root document. Need to be provided for Cesium3dTiles.
     * @returns created reality data.
     */
    public async createItemRDS(displayName: string, dataType: string, dataDescr : string, rootDocument?: string): Promise<ITwinRealityData>
    {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);

        const realityData = new ITwinRealityData(rdaClient, undefined, process.env.IMJS_PROJECT_ID);
        realityData.displayName = displayName;
        realityData.classification = "Undefined";
        realityData.type = dataType;
        realityData.description = dataDescr;
        realityData.rootDocument = rootDocument ?? "";
        const iTwinRealityData = await rdaClient.createRealityData(this.accessToken, process.env.IMJS_PROJECT_ID, realityData);
        realityData.id = iTwinRealityData.id;
        return realityData;
    }
}


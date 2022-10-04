/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AccessToken } from "@itwin/core-bentley";
import { Headers } from "node-fetch";


// Gather access information that will be used for iTwin api's consumption
export class BaseAppAccess {
	
    protected headers: Headers;
    protected projectId: string;
    protected _accessToken: string;

    constructor(accessToken : AccessToken) 
    {
        this._accessToken = accessToken;

        //set headers for all RealityData API HTTP requests
        const headers = 
        {
            "Content-Type": "application/json",
            "Accept": "application/vnd.bentley.v1+json",
            "Authorization": this._accessToken
        };
        this.headers = new Headers(headers);

        const projectId = process.env.IMJS_PROJECT_ID as string;
        if (!projectId)
            throw new Error("Missing configuration value for IMJS_PROJECT_ID. Please check your configuration in your .env file.");

        this.projectId = projectId as string;
    }

    set accessToken(accessToken: string) {
        this._accessToken = accessToken;
        const headers = 
        {
            "Content-Type": "application/json",
            "Accept": "application/vnd.bentley.v1+json",
            "Authorization": this._accessToken
        };
        this.headers = new Headers(headers);
    }

    get accessToken(): string {
        return this._accessToken;
    }
}
/*
 * Copyright © Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 */

"use strict";

import * as dotenv from "dotenv";
import fetch, { Headers } from "node-fetch";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { AccessToken } from "@itwin/core-bentley";
import { IModelHost } from "@itwin/core-backend";

/*
* Performs login using itwin client
*/
async function signIn(
    issuerUrl: string,
    clientId: string,
    scope: string,
    secret: string
): Promise<AccessToken>
{
    const authConfig: ServiceAuthorizationClient = new ServiceAuthorizationClient ({
        clientId,
        clientSecret : secret,
        scope,
        authority: issuerUrl,
    });
    return await authConfig.getAccessToken();
}

export async function getTokenFromEnv() : Promise<AccessToken>
{
    await IModelHost.startup();

    dotenv.config();

    //validate .env file
    const errPrefix = "Missing configuration value for ";
    const errSuffix = ". Please check your configuration in your .env file.";

    if(!process.env.IMJS_PROJECT_ID)
        throw new Error(errPrefix + "IMJS_PROJECT_ID" + errSuffix);

    const authIssuerURL = process.env.IMJS_AUTHORIZATION_ISSUER_URL;
    const authClientId = process.env.IMJS_SERVICE_AUTHORIZATION_CLIENT_ID;
    const authScopes = process.env.IMJS_SERVICE_AUTHORIZATION_SCOPES;
    const authSecret = process.env.IMJS_SERVICE_SECRET;

    if(!authIssuerURL)
        throw new Error(errPrefix + "IMJS_AUTHORIZATION_ISSUER_URL" + errSuffix);
    if(!authClientId)
        throw new Error(errPrefix + "IMJS_SERVICE_AUTHORIZATION_CLIENT_ID" + errSuffix);
    if(!authScopes)
        throw new Error(errPrefix + "IMJS_SERVICE_AUTHORIZATION_SCOPES" + errSuffix);
    if(!authSecret)
        throw new Error(errPrefix + "IMJS_SERVICE_SECRET" + errSuffix);

    const accessToken = await signIn(authIssuerURL, authClientId, authScopes, authSecret);
    return accessToken;
}

// Gather access information that will be used for iTwin api's consumption
export class AppAccess {
	
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

// Utility class
export class AppUtil { 

    // Submit a request with expectated success return value(s), log some messages on start and end
    static async SubmitRequest(stepName: string|undefined, headers: Headers, url: string, method: string, okRet: number[], payload: unknown|undefined = undefined)
    {
        const verbose : boolean = (typeof stepName !== "undefined");
        if (verbose)
            console.log("<<<<<< Starting step: ", stepName);

        const reqBase = {
            headers,
            method 
        };
        const request =  ["POST", "PATCH"].includes(method) ? { ...reqBase, body: JSON.stringify(payload) } : reqBase;

        const response = await fetch(url, request);

        if(!okRet.includes(response.status))
        {
            console.log(response);
            throw new Error("###### Error in step: " + stepName);
        }
        const res = await response.json();

        if (verbose)
            console.log(">>>>>> Ending step: ", stepName);

        return res;
    }

    static Sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

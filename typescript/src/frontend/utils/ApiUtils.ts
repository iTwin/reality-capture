/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";

/**
 * 
 * @param stepName step name (optional)
 * @param accessToken access token to allow the app to access the API.
 * @param url API url.
 * @param method HTTP method.
 * @param okRet HTTP expected code.
 * @param payload request body.
 * @returns request response.
 */
export async function submitRequest(stepName: string|undefined, accessToken: string, url: string, method: string, okRet: number[], 
    payload: unknown|undefined = undefined): Promise<any>
{
    const verbose : boolean = (typeof stepName !== "undefined");
    if (verbose)
        console.log("<<<<<< Starting step: ", stepName);

    const headers = 
    {
        "Content-Type": "application/json",
        "Accept": "application/vnd.bentley.v1+json",
        "Authorization": accessToken
    };
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

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

/**
 * Get reality data from its id.
 * @param id reality data id.
 * @param accessToken access token to allow the app to access the API.
 * @returns the reality data associated to @see {@link id}
 */
export async function getRealityData(id: string, accessToken: string): Promise<ITwinRealityData> {
    const realityDataClientOptions: RealityDataClientOptions = {
        baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
    };
    const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    const realityData = await rdaClient.getRealityData(accessToken, process.env.IMJS_PROJECT_ID, id);
    return realityData;
}
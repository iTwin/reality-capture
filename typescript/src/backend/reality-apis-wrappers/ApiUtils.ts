/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import fetch, { Headers } from "node-fetch";


// Utility class
export class ApiUtils { 

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

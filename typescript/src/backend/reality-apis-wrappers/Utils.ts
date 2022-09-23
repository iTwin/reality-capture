/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import * as dotenv from "dotenv";
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

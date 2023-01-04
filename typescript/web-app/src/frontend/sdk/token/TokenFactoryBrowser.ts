
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { ClientInfo } from "../CommonData";
import { TokenFactory } from "./TokenFactory";

/**
 * iTwin Token factory for Single Page Application.
 */
export class SPATokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: BrowserAuthorizationClient;

    constructor(clientInfo: ClientInfo) {
        this.clientInfo = clientInfo;
    }

    public async getToken(): Promise<string> {
        if(this.authorizationClient)
            return await this.authorizationClient.getAccessToken();
        
        if (!this.clientInfo.redirectUrl)
            return Promise.reject(Error("Redirect url is undefined"));

        let env = "";
        if(this.clientInfo.env)
            env = "qa-";
            
        const authority = "https://" + env + "ims.bentley.com";
        this.authorizationClient = new BrowserAuthorizationClient({
            clientId: this.clientInfo.clientId,
            scope: Array.from(this.clientInfo.scopes).join(" "),
            authority: authority,
            responseType: "code",
            redirectUri: this.clientInfo.redirectUrl,
        });
        await this.authorizationClient.signInRedirect();
        return await this.authorizationClient.getAccessToken();
    }

    public isOk(): boolean {
        return this.authorizationClient !== undefined && this.authorizationClient.hasSignedIn 
            && this.authorizationClient.isAuthorized && !this.authorizationClient.hasExpired; 
    }

    public getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/";
    }
}

/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelHost } from "@itwin/core-backend";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { ElectronMainAuthorization } from "@itwin/electron-authorization/lib/cjs/ElectronMain";
import { CommonData, TokenFactory } from "reality-capture";

/**
 * iTwin Token factory for Service Application.
 */
export class ServiceTokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: CommonData.ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: ServiceAuthorizationClient;

    constructor(clientInfo: CommonData.ClientInfo) {
        this.clientInfo = clientInfo;
    }

    public async getToken(): Promise<string> {
        if(this.authorizationClient)
            return await this.authorizationClient.getAccessToken();
        
        if (!this.clientInfo.secret)
            return Promise.reject(Error("Secret is undefined"));

        let env = "";
        if(this.clientInfo.env)
            env = "qa-";
        
        const authority = "https://" + env + "ims.bentley.com";
        await IModelHost.startup();
        this.authorizationClient = new ServiceAuthorizationClient({
            clientId: this.clientInfo.clientId,
            clientSecret: this.clientInfo.secret,
            scope: Array.from(this.clientInfo.scopes).join(" "),
            authority: authority,
        });
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

/**
 * iTwin Token factory for Desktop/Mobile applications.
 */
export class DesktopTokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: CommonData.ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: NodeCliAuthorizationClient;

    constructor(clientInfo: CommonData.ClientInfo) {
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
        this.authorizationClient = new NodeCliAuthorizationClient({
            clientId: this.clientInfo.clientId,
            scope: Array.from(this.clientInfo.scopes).join(" "),
            redirectUri: this.clientInfo.redirectUrl,
            issuerUrl: authority,
        });
        await this.authorizationClient.signIn();
        return await this.authorizationClient.getAccessToken();
    }

    public isOk(): boolean {
        return this.authorizationClient !== undefined; 
    }

    public getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/";
    }
}

/**
 * iTwin Token factory for electron applications (Desktop/Mobile).
 */
export class ElectronTokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: CommonData.ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: ElectronMainAuthorization;

    constructor(clientInfo: CommonData.ClientInfo) {
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
        this.authorizationClient = new ElectronMainAuthorization({
            clientId: this.clientInfo.clientId,
            scope: Array.from(this.clientInfo.scopes).join(" "),
            redirectUri: this.clientInfo.redirectUrl,
            issuerUrl: authority,
        });
        await this.authorizationClient.signIn();
        return await this.authorizationClient.getAccessToken();
    }

    public isOk(): boolean {
        return this.authorizationClient !== undefined; 
    }

    public getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/";
    }
}
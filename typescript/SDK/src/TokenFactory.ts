
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { IModelHost } from "@itwin/core-backend";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { ElectronMainAuthorization } from "@itwin/electron-authorization/lib/cjs/ElectronMain";
import { ClientInfo } from "./CommonData";

/**
 * Token factory interface. Implement this interface to create your own token factory.
 */
export interface TokenFactory {
    /** Returns a valid access token to make authenticated requests to an API. */
    getToken: () => Promise<string>;
    /** Returns true if the access token is valid. */
    isOk: () => boolean;
    /** Returns service url. */
    getServiceUrl: () => string;
}

/**
 * iTwin Token factory for Service Application.
 */
export class ServiceTokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: ServiceAuthorizationClient;

    constructor(clientInfo: ClientInfo) {
        this.clientInfo = clientInfo;
    }

    async getToken(): Promise<string> {
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

    isOk(): boolean {
        return this.authorizationClient !== undefined && this.authorizationClient.hasSignedIn 
            && this.authorizationClient.isAuthorized && !this.authorizationClient.hasExpired; 
    }

    getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/"
    }
}

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

    async getToken(): Promise<string> {
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

    isOk(): boolean {
        return this.authorizationClient !== undefined && this.authorizationClient.hasSignedIn 
            && this.authorizationClient.isAuthorized && !this.authorizationClient.hasExpired; 
    }

    getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/"
    }
}

/**
 * iTwin Token factory for Desktop/Mobile applications.
 */
export class DesktopTokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: NodeCliAuthorizationClient;

    constructor(clientInfo: ClientInfo) {
        this.clientInfo = clientInfo;
    }

    async getToken(): Promise<string> {
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

    isOk(): boolean {
        return this.authorizationClient !== undefined; 
    }

    getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/"
    }
}

/**
 * iTwin Token factory for electron applications (Desktop/Mobile).
 */
export class ElectronTokenFactory implements TokenFactory {
    /** Info to initialize the authorization client. */
    private clientInfo: ClientInfo;

    /** Utility to generate tokens. */
    private authorizationClient?: ElectronMainAuthorization;

    constructor(clientInfo: ClientInfo) {
        this.clientInfo = clientInfo;
    }

    async getToken(): Promise<string> {
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

    isOk(): boolean {
        return this.authorizationClient !== undefined; 
    }

    getServiceUrl(): string {
        return "https://" + this.clientInfo.env + "api.bentley.com/"
    }
}
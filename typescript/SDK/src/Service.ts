import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { IModelHost } from "@itwin/core-backend";
import { BentleyError, BentleyStatus } from "@itwin/core-bentley";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { ClientInfo } from "./CommonData";
import fetch from 'node-fetch';

/** Abstract class for services. */
export abstract class Service {
    /** Url of the RealityData Analysis Service. */
    private _url: string;

    /** Client information to get access to the service. */
    private _clientInfo: ClientInfo;

    /** Authorization client to generate the access token, automatically refreshed if necessary.*/
    private _authorizationClient?: ServiceAuthorizationClient | BrowserAuthorizationClient | NodeCliAuthorizationClient;

    /**
     * Create a new RealityDataTransferService from provided iTwin application infos.
     * @param {ClientInfo} clientInfo iTwin application infos.
     * @param {string} url (optional) Url of the RealityData Analysis Service. Default : "https://qa-api.bentley.com/realitydata/" .
     */
    constructor(clientInfo: ClientInfo, url: string) {
        this._url = url;
        this._clientInfo = clientInfo;
    }

    protected abstract getScopes(): string;

    // Remove this getter? Could be possible, but RealityDataTransfer is a bit different from CCS and RDAS
    protected get url(): string {
        return this._url;
    }

    // Remove this getter? Could be possible, but RealityDataTransfer is a bit different from CCS and RDAS
    protected get authorizationClient(): ServiceAuthorizationClient | BrowserAuthorizationClient | NodeCliAuthorizationClient | undefined {
        return this._authorizationClient;
    }

    /**
     * @protected
     * @param {string} apiOperationUrl API operation url.
     * @param {string} method HTTP method.
     * @param {number[]} okRet HTTP expected code.
     * @param {unknown} payload request body.
     * @returns {any} request response.
     */
    protected async submitRequest(apiOperationUrl: string, method: string, okRet: number[], payload?: unknown): Promise<any> {
        try {
            await this.connect();

            const headers =
            {
                "Content-Type": "application/json",
                "Accept": "application/vnd.bentley.v1+json",
                "Authorization": await this._authorizationClient!.getAccessToken(),
            };
            const reqBase = {
                headers,
                method
            };
            const request = ["POST", "PATCH"].includes(method) ? { ...reqBase, body: JSON.stringify(payload) } : reqBase;
            const response = await fetch(this._url + apiOperationUrl, request);

            if (!okRet.includes(response.status))
                return Promise.reject(new BentleyError(BentleyStatus.ERROR,
                    "Error in request: " + response.url + ", return code : " + response.status + " " + response.statusText));

            return await response.json();
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Connects to the Reality data analysis service.
     */
    public async connect(): Promise<void> {
        try {
            if(this._authorizationClient)
                return; // Already connected.
            
            let env = "";
            if (this._url.includes("dev-"))
                env = "dev-";
            else if (this._url.includes("qa-"))
                env = "qa-";

            const authority = "https://" + env + "ims.bentley.com";

            if (this._clientInfo.clientId.startsWith("service")) {
                if (!this._clientInfo.secret)
                    return Promise.reject(Error("Secret is undefined"));

                await IModelHost.startup();
                this._authorizationClient = new ServiceAuthorizationClient({
                    clientId: this._clientInfo.clientId,
                    clientSecret: this._clientInfo.secret,
                    scope: this.getScopes(),
                    authority: authority,
                });
            }
            else if (this._clientInfo.clientId.startsWith("spa")) {
                if (!this._clientInfo.redirectUrl)
                    return Promise.reject(Error("Redirect url is undefined"));

                this._authorizationClient = new BrowserAuthorizationClient({
                    clientId: this._clientInfo.clientId,
                    scope: this.getScopes(),
                    authority: authority,
                    responseType: "code",
                    redirectUri: this._clientInfo.redirectUrl,
                });
                await this._authorizationClient.signInRedirect();
            }
            else if (this._clientInfo.clientId.startsWith("native")) {
                if (!this._clientInfo.redirectUrl)
                    return Promise.reject(Error("Redirect url is undefined"));

                this._authorizationClient = new NodeCliAuthorizationClient({
                    clientId: this._clientInfo.clientId,
                    scope: this.getScopes(),
                    redirectUri: this._clientInfo.redirectUrl,
                    issuerUrl: authority,
                });
                await this._authorizationClient.signIn();
            }
            // TODO : traditional Web apps
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }
}
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { JobProgress, JobState } from "@itwin/reality-capture-common";
import axios from "axios";
import { RCJobCostParameters, RCJobProperties, RCJobSettings, RCJobType } from "./Utils";

/**
 * Service handling communication with Reality Conversion Service.
 */
export class RealityConversionService {
    /** Callback to get an access token */
    private getAccessToken: () => Promise<string>;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/realityconversion";

    /**
     * Create a new RealityConversionService.
     * @param {() => Promise<string>} getAccessToken Callback to get the access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(getAccessToken: () => Promise<string>, env?: string) {
        this.getAccessToken = getAccessToken;
        if(env)
            this.serviceUrl = "https://" + env + "api.bentley.com/realityconversion";
    }

    /**
     * @private
     * @param {string} apiOperationUrl API operation url.
     * @param {string} method HTTP method.
     * @param {unknown} payload (optional) Request body.
     * @returns {any} Request response.
     */
    private async submitRequest(apiOperationUrl: string, method: string, okRet: number[], payload?: unknown): Promise<any> {
        try {
            let response;
            const url = this.serviceUrl + "/" + apiOperationUrl;
            const headers =
            {
                "content-type": "application/json",
                "accept": "application/vnd.bentley.itwin-platform.v1+json",
                "authorization": await this.getAccessToken(),
            };

            if(method === "GET")
                response = await axios.get(url, {headers, url, method});
            else if(method === "DELETE")
                response = await axios.delete(url, {headers, url, method});
            else if(method === "POST")
                response = await axios.post(url, payload, {headers, url, method});
            else if(method === "PATCH")
                response = await axios.patch(url, payload, {headers, url, method});
            else 
                return Promise.reject(new Error("Wrong request method"));

            if (!okRet.includes(response.status)) {
                return Promise.reject(new Error( response.statusText ?? "Wrong request response code, expected : " + okRet));
            }

            return response.data;

        }
        catch (error: any) {
            let message = "Unknown error. Please ensure that the request is valid.";

            if (axios.isAxiosError(error)) {
                if(!error.response)
                    return Promise.reject(new Error(error.message ?? message));
                
                const axiosResponse = error.response!;
                if(axiosResponse.data.error?.details)
                    message = "Error " + axiosResponse.status + " " + axiosResponse.data?.error?.message + ". Details : " + JSON.stringify(axiosResponse.data.error?.details);
                else
                    message = "Error " + axiosResponse.status + " " + axiosResponse.data?.error?.message;
            } 
            else {
                message = error.message;
            }
            return Promise.reject(new Error(message));
        }
    }

    /**
     * Get scopes required for this service.
     * @returns {Set<string>} Set of required minimal scopes.
     */
    public static getScopes(): Set<string> {
        return new Set(["itwin-platform"]);
    }

    /**
     * Create a job corresponding to the given settings.
     * @param {RCJobSettings} settings Settings for the job.
     * @param {string} name Name for the job.
     * @param {string} iTwinId iTwin associated to this job.
     * @param {RCJobType} type job type.
     * @returns {string} Created job id.
     */
    public async createJob(settings: RCJobSettings, name: string, iTwinId: string, type: RCJobType = RCJobType.Conversion): Promise<string> {
        const settingsJson = settings.toJson();
        const body = {
            "type": type,
            "name": name,
            "iTwinId": iTwinId,
            "inputs": settingsJson.inputs,
            "outputs": settingsJson.outputs,
            "options": settingsJson.options,
        };
        const response = await this.submitRequest("jobs", "POST", [201], body);
        return response["job"]["id"];
    }

    /**
     * Submit a job.
     * @param {string} id The ID of the relevant job.
     */
    public async submitJob(id: string): Promise<void> {
        const body = { "state": "active" };
        return await this.submitRequest("jobs/" + id, "PATCH", [200], body);
    }

    /**
     * Cancel a job.
     * @param {string} id The ID of the relevant job.
     */
    public async cancelJob(id: string): Promise<void> {
        const body = {
            "state": "cancelled",
        };
        return await this.submitRequest("jobs/" + id, "PATCH", [200], body);
    }

    /**
     * Delete a job.
     * @param {string} id The ID of the relevant job.
     */
    public async deleteJob(id: string): Promise<void> {
        return await this.submitRequest("jobs/" + id, "DELETE", [204]);
    }

    /**
     * Get progress for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobProgress} The progress for the job.
     */
    public async getJobProgress(id: string): Promise<JobProgress> {
        const response = await this.submitRequest(`jobs/${id}/progress`, "GET", [200]);
        const progress = response["progress"];
        const state = (progress["state"] as string).toLowerCase();
        return { state: state as JobState, progress: JSON.parse(progress["percentage"]), step: progress["step"] };
    }

    /**
     * Get all properties for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {RCJobProperties} The job properties.
     */
    public async getJobProperties(id: string): Promise<RCJobProperties> {
        const response = await this.submitRequest("jobs/" + id, "GET", [200]);
        const job = response["job"];
        const jobProperties: RCJobProperties = {
            name: job["name"],
            type: job["type"],
            iTwinId: job["iTwinId"],
            settings: new RCJobSettings(),
            id: job["id"],
            email: job["email"],
            state: job["state"],
            dataCenter: job["dataCenter"],
        };

        jobProperties.settings = await RCJobSettings.fromJson(job);

        if(job["costEstimation"]) {
            jobProperties.costEstimationParameters = {
                gigaPixels: job["costEstimation"]["gigaPixels"],
                megaPoints: job["costEstimation"]["megaPoints"],
                estimatedCost: job["costEstimation"]["estimatedCost"],
            };
        }

        return jobProperties;
    }

    /**
     * Get the estimated cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @param {RCJobCostParameters} costParameters Job cost parameters.
     * @returns {number} The job cost estimation.
     */
    public async getJobEstimatedCost(id: string, costParameters: RCJobCostParameters): Promise<number> {
        const body = {
            costEstimationParameters: {
                gigaPixels: costParameters.gigaPixels,
                megaPoints: costParameters.megaPoints,
            }
        };
        const response = await this.submitRequest("jobs/" + id, "PATCH", [200], body);
        return response.estimatedCost;
    }
}
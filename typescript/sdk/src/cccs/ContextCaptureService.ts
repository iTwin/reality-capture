/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { JobProgress, JobState } from "../CommonData";
import { CCCostParameters, CCJobProperties, CCJobSettings, CCJobType, CCWorkspaceProperties } from "./Utils";
import { BentleyError, BentleyStatus } from "@itwin/core-bentley";
import { AuthorizationClient } from "@itwin/core-common";
import axios from "axios";

/**
 * Service handling communication with Context Capture Service
 */
export class ContextCaptureService {
    /** Authorization client to generate access token. */
    private authorizationClient: AuthorizationClient;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/contextcapture";

    /**
     * Create a new ContextCaptureService.
     * @param {AuthorizationClient} authorizationClient Authorization client to generate access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(authorizationClient: AuthorizationClient, env?: string) {
        this.authorizationClient = authorizationClient;
        if(env)
            this.serviceUrl = "https://" + env + "api.bentley.com/contextcapture";
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
                "accept": "application/vnd.bentley.v1+json",
                "authorization": await this.authorizationClient.getAccessToken(),
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
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, "Wrong request method"));

            if (!okRet.includes(response.status)) {
                return new BentleyError(response.status, response.statusText);
            }

            return response.data;

        }
        catch (error: any) {
            let status = 422;
            let message = "Unknown error. Please ensure that the request is valid.";

            if (axios.isAxiosError(error)) {
                const axiosResponse = error.response!;
                status = axiosResponse.status;
                message = axiosResponse.data?.error?.message;
            } 
            else {
                const bentleyError = error as BentleyError;
                if (bentleyError !== undefined) {
                    status = bentleyError.errorNumber;
                    message = bentleyError.message;
                }
            }
            return Promise.reject(new BentleyError(status, message));
        }
    }

    /**
     * Get scopes required for this service.
     * @returns {Set<string>} Set of required minimal scopes.
     */
    public static getScopes(): Set<string> {
        return new Set(["contextcapture:read", "contextcapture:modify"]);
    }

    /**
     * Create a workspace corresponding to the given parameters.
     * @param {string} name Workspace name.
     * @param {string} iTwinId iTwinId associated to the workspace.
     * @param {string} contextCaptureVersion (optional) Version of ContextCapture to be used for this workspace.
     * @returns {string} created workspace id.
     */
    public async createWorkspace(name: string, iTwinId: string, contextCaptureVersion?: string): Promise<string> {
        let body: any = {
            "name": name,
            "iTwinId": iTwinId           
        };
        if(contextCaptureVersion)
            body["contextCaptureVersion"] = contextCaptureVersion;
        
        try {
            const response = await this.submitRequest("workspaces", "POST", [201], body);
            return response["workspace"]["id"];
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Delete a workspace.
     * @param {string} workspaceId The ID of the relevant workspace.
     */
    public async deleteWorkspace(workspaceId: string): Promise<void> {
        return await this.submitRequest("workspaces/" + workspaceId, "DELETE", [204]);
    }

    /**
     * Get a workspace.
     * @param {string} workspaceId The ID of the relevant workspace.
     * @returns {CCWorkspaceProperties} Workspace properties.
     */
    public async getWorkspace(workspaceId: string): Promise<CCWorkspaceProperties> {
        const response = await this.submitRequest("workspaces/" + workspaceId, "GET", [200]);
        return {
            id: response["workspace"]["id"],
            createdDateTime: response["workspace"]["createdDateTime"],
            name: response["workspace"]["name"],
            iTwinId: response["workspace"]["iTwinId"],
            contextCaptureVersion: response["workspace"]["contextCaptureVersion"],
        };
    }

    /**
     * Create a job corresponding to the given settings.
     * @param {CCJobType} type Job type.
     * @param {CCJobSettings} settings Settings for the job.
     * @param {string} name Name for the job.
     * @param {string} workspaceId Workspace associated to this job.
     * @returns {string} Created job id.
     */
    public async createJob(type: CCJobType, settings: CCJobSettings, name: string, workspaceId: string): Promise<string> {
        const settingsJson = settings.toJson();
        const body = {
            "type": type,
            "name": name,
            "inputs": settingsJson.inputs,
            "settings": settingsJson.settings,
            "workspaceId": workspaceId,
        };

        const response = await this.submitRequest("jobs/", "POST", [201], body);
        return response["job"]["id"];
    }

    /**
     * Submit a job.
     * @param {string} jobId The ID of the relevant job.
     */
    public async submitJob(jobId: string): Promise<void> {
        const body = { "state": "active" };
        return await this.submitRequest("jobs/" + jobId, "PATCH", [200], body);
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
        const response = await this.submitRequest("jobs/" + id + "/progress", "GET", [200]);
        const progress = response["jobProgress"];
        const state = (progress["state"] as string).toLowerCase();
        return { state: state as JobState, progress: JSON.parse(progress["percentage"]), step: progress["step"] };
    }

    /**
     * Get all properties for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {RDAJobProperties} The job properties.
     */
    public async getJobProperties(id: string): Promise<CCJobProperties> {
        const response = await this.submitRequest("jobs/" + id, "GET", [200]);
        const job = response["job"];
        const jobProperties: CCJobProperties = {
            name: job["name"],
            type: job["type"],
            iTwinId: job["iTwinId"],
            settings: new CCJobSettings(),
            workspaceId: job["workspaceId"],
            id: job["id"],
            email: job["email"],
            state: job["state"],
            location: job["dataCenter"],
            estimatedCost: job["estimatedCost"],
        };

        const settings = await CCJobSettings.fromJson(job);
        jobProperties.settings = settings;

        if (job["executionInformation"]) {
            jobProperties.dates = {
                createdDateTime: job["createdDateTime"],
                submissionDateTime: job["executionInformation"]["submittedDateTime"],
                startedDateTime: job["executionInformation"]["startedDateTime"],
                endedDateTime: job["executionInformation"]["endedDateTime"],
            };
            jobProperties.executionCost = job["executionInformation"]["estimatedUnits"];
        }
        else {
            jobProperties.dates = {
                createdDateTime: job["createdDateTime"]
            };
        }

        if (job["costEstimationParameters"]) {
            jobProperties.costEstimationParameters = {
                gigaPixels: job["costEstimationParameters"]["gigaPixels"],
                megaPoints: job["costEstimationParameters"]["megaPoints"],
                meshQuality: job["costEstimationParameters"]["meshQuality"],
            };
        }

        return jobProperties;
    }

    /**
     * Get the estimated cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number} The job cost estimation.
     */
    public async getJobEstimatedCost(id: string, costParameters: CCCostParameters): Promise<number> {
        const body = {
            costEstimationParameters: {
                gigaPixels: costParameters.gigaPixels,
                megaPoints: costParameters.megaPoints,
                meshQuality: costParameters.meshQuality,
            }
        };
        const response = await this.submitRequest("jobs/" + id, "PATCH", [200], body);
        return response.estimatedCost;
    }
}
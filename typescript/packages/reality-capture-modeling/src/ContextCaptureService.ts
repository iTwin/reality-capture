/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { JobProgress, JobState } from "@itwin/reality-capture-common";
import { CCCostParameters, CCJobProperties, CCJobSettings, CCJobType, CCWorkspaceProperties } from "./Utils";
import axios from "axios";

/**
 * Service handling communication with Reality Modeling Service
 */
export class ContextCaptureService {
    /** Callback to get an access token */
    private getAccessToken: () => Promise<string>;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/contextcapture";

    /**
     * Create a new ContextCaptureService.
     * @param {() => Promise<string>} getAccessToken Callback to get an access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(getAccessToken: () => Promise<string>, env?: string) {
        this.getAccessToken = getAccessToken;
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
                return Promise.reject(new Error(response.statusText ?? "Wrong request response code, expected : " + okRet));
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
     * Create a workspace corresponding to the given parameters.
     * @param {string} name Workspace name.
     * @param {string} iTwinId iTwinId associated to the workspace.
     * @param {string} contextCaptureVersion (optional) Version of Reality Modeling to be used for this workspace.
     * @returns {string} created workspace id.
     */
    public async createWorkspace(name: string, iTwinId: string, contextCaptureVersion?: string): Promise<string> {
        const body: any = {
            "name": name,
            "iTwinId": iTwinId           
        };
        if(contextCaptureVersion)
            body["contextCaptureVersion"] = contextCaptureVersion;
        
        const response = await this.submitRequest("workspaces", "POST", [201], body);
        return response["workspace"]["id"];
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

        const response = await this.submitRequest("jobs", "POST", [201], body);
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
            errors: [],
            warnings: [],
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
            if(job["executionInformation"]["errors"]) {
                for (const error of job["executionInformation"]["errors"]) {
                    const params = [];
                    for (const param of error["params"]) {
                        params.push(param);
                    }
                    jobProperties.errors.push({
                        code: error["code"],
                        title: error["title"],
                        message: error["message"],
                        params,
                    });
                }
            }
            if(job["executionInformation"]["warnings"]) {
                for (const warning of job["executionInformation"]["warnings"]) {
                    const params = [];
                    for (const param of warning["params"]) {
                        params.push(param);
                    }
                    jobProperties.errors.push({
                        code: warning["code"],
                        title: warning["title"],
                        message: warning["message"],
                        params,
                    });
                }
            }
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
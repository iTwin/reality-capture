/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { JobDates, JobProgress, JobState } from "../CommonData";
import { CCCostParameters, CCJobProperties, CCJobSettings, CCJobType, CCWorkspaceProperties } from "./Utils";
import { TokenFactory } from "../TokenFactory";
import { BentleyError, BentleyStatus } from "@itwin/core-bentley";
import fetch from 'node-fetch';

/**
 * Service handling communication with Context Capture Service
 */
export class ContextCaptureService {
    /** Token factory to make authenticated request to the API. */
    private tokenFactory: TokenFactory;

    /**
     * Create a new RealityDataTransferService.
     * @param {TokenFactory} tokenFactory Token factory to make authenticated request to the API.
     */
    constructor(tokenFactory: TokenFactory) {
        this.tokenFactory = tokenFactory;
    }

    /**
     * @private
     * @param {string} apiOperationUrl API operation url.
     * @param {string} method HTTP method.
     * @param {number[]} okRet HTTP expected code.
     * @param {unknown} payload (optional) Request body.
     * @returns {any} Request response.
     */
    private async submitRequest(apiOperationUrl: string, method: string, okRet: number[], payload?: unknown): Promise<any> {
        try {
            const headers =
            {
                "Content-Type": "application/json",
                "Accept": "application/vnd.bentley.v1+json",
                "Authorization": await this.tokenFactory.getToken(),
            };
            const reqBase = {
                headers,
                method
            };
            const request = ["POST", "PATCH"].includes(method) ? { ...reqBase, body: JSON.stringify(payload) } : reqBase;
            const response = await fetch(this.tokenFactory.getServiceUrl() + "contextcapture/" + apiOperationUrl, request);
            if (!okRet.includes(response.status))
                return Promise.reject(new BentleyError(response.status,
                    "Error in request: " + response.url + ", return code : " + response.status + " " + response.statusText));

            if(okRet.includes(204))
                return {};
            
            return await response.json();
        }
        catch (error: any) {
            return Promise.reject(error);
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
        const body = {
            "name": name,
            "iTwinId": iTwinId,
            "contextCaptureVersion": contextCaptureVersion
        };
        try {
            const response = await this.submitRequest("workspaces", "POST", [201], body);
            return response["workspace"]["id"];
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Delete a workspace.
     * @param {string} workspaceId The ID of the relevant workspace.
     */
    public async deleteWorkspace(workspaceId: string): Promise<void> {
        try {
            return await this.submitRequest("workspaces/" + workspaceId, "DELETE", [204]);
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get a workspace.
     * @param {string} workspaceId The ID of the relevant workspace.
     * @returns {CCWorkspaceProperties} Workspace properties.
     */
    public async getWorkspace(workspaceId: string): Promise<CCWorkspaceProperties> {
        try {
            const response = await this.submitRequest("workspaces/" + workspaceId, "GET", [200]);
            return {
                id: response["workspace"]["id"],
                createdDateTime: response["workspace"]["createdDatTime"],
                name: response["workspace"]["name"],
                iTwinId: response["workspace"]["iTwinId"],
                contextCaptureVersion: response["workspace"]["contextCaptureVersion"],
            };
        }
        catch(error: any) {
            return Promise.reject(error);
        }
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
        try {
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
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Submit a job.
     * @param {string} jobId The ID of the relevant job.
     */
    public async submitJob(jobId: string): Promise<void> {
        const body = {"state": "active"};
        try {
            return await this.submitRequest("jobs/" + jobId, "PATCH", [200], body);
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Cancel a job.
     * @param {string} id The ID of the relevant job.
     */
    public async cancelJob(id: string): Promise<void> {       
        const body = {
            "state": "cancelled",
        };
        try {
            return await this.submitRequest("jobs/" + id, "PATCH", [200], body);
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Delete a job.
     * @param {string} id The ID of the relevant job.
     */
    public async deleteJob(id: string): Promise<void> {
        try {
            return await this.submitRequest("jobs/" + id, "DELETE", [204]);
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get progress for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobProgress} The progress for the job.
     */
    public async getJobProgress(id: string): Promise<JobProgress> {
        try {
            const response = await this.submitRequest(`jobs/${id}/progress`, "GET", [200]);
            const progress = response["jobProgress"];
            const state = (progress["state"] as string).toLowerCase();
            return {state: state as JobState, progress: JSON.parse(progress["percentage"]), step: progress["step"]};
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get all properties for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {RDAJobProperties} The job properties.
     */
    public async getJobProperties(id: string): Promise<CCJobProperties> {
        try {
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

            let settings = await CCJobSettings.fromJson(job["inputs"], job["jobSettings"]);       
            jobProperties.settings = settings;

            if(job["executionInformation"]) {
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
                    createdDateTime: job["executionInformation"]
                };  
            }

            if(job["costEstimationParameters"]) {
                jobProperties.costEstimationParameters = {
                    gigaPixels: job["costEstimationParameters"]["gigaPixels"],
                    megaPoints: job["costEstimationParameters"]["megaPoints"],
                    meshQuality: job["costEstimationParameters"]["quality"],
                };
            }

            return jobProperties;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get the estimated cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number | undefined} The job cost estimation.
     */
    public async getJobEstimatedCost(id: string, costParameters: CCCostParameters): Promise<number | undefined> {
        const body = {
            costEstimationParameters: {
                gigaPixels: costParameters.gigaPixels,
                megaPoints: costParameters.megaPoints,
                meshQuality: costParameters.meshQuality,
            }
        }
        try {
            const response = await this.submitRequest("jobs/" + id, "PATCH", [200], body);   
            return response.costEstimation?.estimateCost;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }
}
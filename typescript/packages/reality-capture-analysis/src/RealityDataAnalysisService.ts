/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ChangeDetectionJobSettings, ExtractGroundJobSettings, JobSettings, SOrthoJobSettings, O2DJobSettings, RDAJobType, S2DJobSettings, S3DJobSettings } from "./Settings";
import { RDACostParameters, RDAJobProperties } from "./Utils";
import { JobProgress, JobState } from "@itwin/reality-capture-common";
import axios from "axios";

/**
 * Service handling communication with Reality Analysis Service.
 */
export class RealityDataAnalysisService {
    /** Callback to get an access token */
    private getAccessToken: () => Promise<string>;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/realitydataanalysis";

    /**
     * Create a new RealityDataAnalysisService.
     * @param {() => Promise<string>} getAccessToken Callback to get the access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(getAccessToken: () => Promise<string>, env?: string) {
        this.getAccessToken = getAccessToken;
        if(env)
            this.serviceUrl = "https://" + env + "api.bentley.com/realitydataanalysis";
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
                "accept": "application/vnd.bentley.ras-v2-test+json",
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
        return new Set(["realitydataanalysis:modify", "realitydataanalysis:read"]);
    }

    /**
     * Create a job corresponding to the given settings.
     * @param {JobSettings} settings Settings for the job.
     * @param {string} name Name for the job.
     * @param {string} iTwinId iTwin associated to this job.
     * @returns {string} Created job id.
     */
    public async createJob(settings: JobSettings, name: string, iTwinId: string): Promise<string> {
        const settingsJson = settings.toJson();
        const body = {
            "type": settings.type,
            "name": name,
            "iTwinId": iTwinId,
            "inputs": settingsJson.inputs,
            "outputs": settingsJson.outputs,
            "options": settingsJson.options
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
     * @returns {RDAJobProperties} The job properties.
     */
    public async getJobProperties(id: string): Promise<RDAJobProperties> {
        const response = await this.submitRequest("jobs/" + id, "GET", [200]);
        const job = response["job"];
        const jobProperties: RDAJobProperties = {
            name: job["name"],
            type: job["type"],
            iTwinId: job["iTwinId"],
            settings: new O2DJobSettings(), // dummy settings
            id: job["id"],
            email: job["email"],
            state: job["state"],
            dataCenter: job["dataCenter"],
            errors: [],
            warnings: [],
        };

        let settings: JobSettings;
        if (job["type"] === RDAJobType.O2D) {
            settings = await O2DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.S2D) {
            settings = await S2DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.SOrtho) {
            settings = await SOrthoJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.S3D) {
            settings = await S3DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.ChangeDetection) {
            settings = await ChangeDetectionJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.ExtractGround) {
            settings = await ExtractGroundJobSettings.fromJson(job["settings"]);
        }
        else
            return Promise.reject(new Error("Can't get job properties of unknown type : " + job["type"]));

        jobProperties.settings = settings;

        if (job["executionInformation"]) {
            jobProperties.dates = {
                createdDateTime: job["createdDateTime"],
                submissionDateTime: job["executionInformation"]["submissionDateTime"],
                startedDateTime: job["executionInformation"]["startedDateTime"],
                endedDateTime: job["executionInformation"]["endedDateTime"],
            };
            jobProperties.executionCost = job["executionInformation"]["estimatedUnits"];
            jobProperties.exitCode = job["executionInformation"]["exitCode"];
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

        if (job["costEstimation"]) {
            jobProperties.costEstimation = {
                gigaPixels: job["costEstimation"]["gigaPixels"],
                numberOfPhotos: job["costEstimation"]["numberOfPhotos"],
                sceneWidth: job["costEstimation"]["sceneWidth"],
                sceneHeight: job["costEstimation"]["sceneHeight"],
                sceneLength: job["costEstimation"]["sceneLength"],
                detectorScale: job["costEstimation"]["detectorScale"],
                detectorCost: job["costEstimation"]["detectorCost"],
                estimatedCost: job["costEstimation"]["estimatedCost"],
            };
        }

        return jobProperties;
    }

    /**
     * Get the estimated cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number} The job cost estimation.
     */
    public async getJobEstimatedCost(id: string, costParameters: RDACostParameters): Promise<number> {
        const body = {
            costEstimationParameters: {
                gigaPixels: costParameters.gigaPixels,
                numberOfPhotos: costParameters.numberOfPhotos,
                sceneWidth: costParameters.sceneWidth,
                sceneHeight: costParameters.sceneHeight,
                sceneLength: costParameters.sceneLength,
                detectorScale: costParameters.detectorScale,
                detectorCost: costParameters.detectorCost,
            }
        };
        const response = await this.submitRequest("jobs/" + id, "PATCH", [200], body);
        return response.job.costEstimation.estimatedCost;
    }
}
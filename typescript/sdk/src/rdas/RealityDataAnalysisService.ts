/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ChangeDetectionJobSettings, ExtractGroundJobSettings, JobSettings, L3DJobSettings, O2DJobSettings, O3DJobSettings, RDAJobType, S2DJobSettings, S3DJobSettings } from "./Settings";
import { RDACostParameters, RDAJobProperties } from "./Utils";
import { JobProgress, JobState } from "../CommonData";
import { BentleyError, BentleyStatus } from "@itwin/core-bentley";
import { AuthorizationClient } from "@itwin/core-common";
import axios from "axios";

/**
 * Service handling communication with RealityData Analysis Service.
 */
export class RealityDataAnalysisService {
    /** Authorization client to generate access token. */
    private authorizationClient: AuthorizationClient;

    /** Target service url. */
    private serviceUrl = "https://api.bentley.com/realitydataanalysis";

    /**
     * Create a new RealityDataAnalysisService.
     * @param {AuthorizationClient} authorizationClient Authorization client to generate access token.
     * @param {string} env (optional) Target environment.
     */
    constructor(authorizationClient: AuthorizationClient, env?: string) {
        this.authorizationClient = authorizationClient;
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
                "accept": "application/vnd.bentley.itwin-platform.v1+json",
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
        const body = {
            "type": settings.type,
            "name": name,
            "iTwinId": iTwinId,
            "settings": settings.toJson()
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
        };

        let settings: JobSettings;
        if (job["type"] === RDAJobType.O2D) {
            settings = await O2DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.S2D) {
            settings = await S2DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.O3D) {
            settings = await O3DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.S3D) {
            settings = await S3DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.L3D) {
            settings = await L3DJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.ChangeDetection) {
            settings = await ChangeDetectionJobSettings.fromJson(job["settings"]);
        }
        else if (job["type"] === RDAJobType.ExtractGround) {
            settings = await ExtractGroundJobSettings.fromJson(job["settings"]);
        }
        else
            return Promise.reject(new BentleyError(BentleyStatus.ERROR,
                "Can't get job properties of unknown type : " + job["type"]));

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
import { ChangeDetectionJobSettings, JobSettings, L3DJobSettings, O2DJobSettings, O3DJobSettings, RDAJobType, S2DJobSettings, S3DJobSettings } from "./Settings";
import { RDACostParameters, RDAJobProperties } from "./Utils";
import { JobDates, JobProgress, JobState } from "../CommonData";
import { BentleyError, BentleyStatus } from "@itwin/core-bentley";
import { TokenFactory } from "../TokenFactory";
import fetch from 'node-fetch';

/**
 * Service handling communication with RealityData Analysis Service
 */
export class RealityDataAnalysisService {
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
            const response = await fetch(this.tokenFactory.getServiceUrl() + "realitydataanalysis/" + apiOperationUrl, request);

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
        try {
            const response = await this.submitRequest("jobs", "POST", [201], body);
            return response["job"]["id"];
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Submit a job.
     * @param {string} id The ID of the relevant job.
     */
    public async submitJob(id: string): Promise<void> {
        const body = {"state": "active"};
        try {
            return await this.submitRequest("jobs/" + id, "PATCH", [200], body);
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
            const progress = response["progress"];
            const state = (progress["state"] as string).toLowerCase();
            return {state: state as JobState, progress: JSON.parse(progress["percentage"]), step: progress["step"]};
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get settings for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobSettings} The settings for the job.
     */
    public async getJobSettings(id: string): Promise<JobSettings> {
        try {
            const properties = await this.getJobProperties(id);
            return properties.settings;
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
    public async getJobProperties(id: string): Promise<RDAJobProperties> {
        try {
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
            if(job["type"] === RDAJobType.O2D) {
                settings = await O2DJobSettings.fromJson(job["settings"]);
            }
            else if(job["type"] === RDAJobType.S2D) {
                settings = await S2DJobSettings.fromJson(job["settings"]);
            }
            else if(job["type"] === RDAJobType.O3D) {
                settings = await O3DJobSettings.fromJson(job["settings"]);
            }
            else if(job["type"] === RDAJobType.S3D) {
                settings = await S3DJobSettings.fromJson(job["settings"]);
            }
            else if(job["type"] === RDAJobType.L3D) {
                settings = await L3DJobSettings.fromJson(job["settings"]);
            }
            else if(job["type"] === RDAJobType.ChangeDetection) {
                settings = await ChangeDetectionJobSettings.fromJson(job["settings"]);
            }
            else
                return Promise.reject(new BentleyError(BentleyStatus.ERROR, 
                    "Can't get job properties of unknown type : " + job["type"]));
            
            jobProperties.settings = settings;

            if(job["executionInformation"]) {
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
                    createdDateTime: job["executionInformation"]
                };  
            }

            if(job["costEstimation"]) {
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
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get type of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {RDAJobType} The type for the job.
     */
    public async getJobType(id: string): Promise<RDAJobType> {
        try {
            const properties = await this.getJobProperties(id);  
            return properties.type;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get iTwinId of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {string} The job iTwinId.
     */
    public async getJobiTwinId(id: string): Promise<string> {
        try {
            const properties = await this.getJobProperties(id);         
            return properties.iTwinId;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get name of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {string} The job name.
     */
    public async getJobName(id: string): Promise<string> {
        try {
            const properties = await this.getJobProperties(id);         
            return properties.name;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get state of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobState | undefined} The job state.
     */
    public async getJobState(id: string): Promise<JobState | undefined> {   
        try {
            const properties = await this.getJobProperties(id);         
            return properties.state;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get the execution cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number | undefined} The job execution cost.
     */
    public async getJobExecutionCost(id: string): Promise<number | undefined> {
        try {
            const properties = await this.getJobProperties(id);         
            return properties.executionCost;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get the exit code of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {string | undefined} The job exit code.
     */
    public async getJobExitCode(id: string): Promise<string | undefined> {
        try {
            const properties = await this.getJobProperties(id);     
            return properties.exitCode;
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
    public async getJobEstimatedCost(id: string, costParameters: RDACostParameters): Promise<number | undefined> {
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
        }
        try {
            const response = await this.submitRequest("jobs/" + id, "PATCH", [200], body);     
            return response.costEstimation?.estimateCost;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }

    /**
     * Get the creation, start, submission and end dates of the given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobDates | undefined} The job dates.
     */
    public async getJobDates(id: string): Promise<JobDates | undefined> {
        try {
            const properties = await this.getJobProperties(id);             
            return properties.dates;
        }
        catch(error: any) {
            return Promise.reject(error);
        }
    }
}
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { ChangeDetectionJobSettings, JobSettings, L3DJobSettings, O2DJobSettings, O3DJobSettings, S2DJobSettings, S3DJobSettings } from "./Settings";
import { RDACostParameters, RDAJobProperties, RDAJobType } from "./Utils";
import fetch from "node-fetch";
import { IModelHost } from "@itwin/core-backend";
import { JobProgress } from "../CommonData";

/**
 * Service handling communication with RealityData Analysis Service
 */
export class RealityDataAnalysisService {
    /** Url of the RealityData Analysis Service. */
    private url: string;

    /** A client id with realitydata and realitydataanalysis scopes. */
    private clientId: string;

    /** Service application secret. */
    private secret: string;

    /** Authorization client to generate the access token, automatically refreshed if necessary.*/
    private authorizationClient?: ServiceAuthorizationClient;

    /**
     * Create a new RealityDataAnalysisService from provided iModel application.
     * @param {string} url Url of the RealityData Analysis Service.
     * @param {string} clientId A client id with realitydata and realitydataanalysis scopes.
     * @param {string} secret Service application secret.
     */
    constructor(url: string, clientId: string, secret?: string) {        
        this.url = url;
        this.clientId = clientId;
        this.secret = secret ?? "";
    }

    /**
     * Connects to the Reality data analysis service.
     * @returns A potential error message.
     */
    public async connect(): Promise<void | Error> {
        try {
            if(!this.secret)
                return new Error("Secret is undefined");
            
            await IModelHost.startup();
            this.authorizationClient = new ServiceAuthorizationClient ({
                clientId: this.clientId,
                clientSecret : this.secret,
                scope: "realitydata:modify realitydata:read realitydataanalysis:read realitydataanalysis:modify",
                authority: "https://qa-ims.bentley.com",
            });
        }
        catch(error: any) {
            return error;
        }
    }

    /**
     * @private
     * @param {string} url API url.
     * @param {string} method HTTP method.
     * @param {number[]} okRet HTTP expected code.
     * @param {unknown|undefined} payload request body.
     * @returns {any} request response.
     */
    private async submitRequest(url: string, method: string, okRet: number[], payload: unknown|undefined = undefined): Promise<any>
    {
        if(!this.authorizationClient) {
            const err = await this.connect();
            if(err)
                return err;
        }

        const headers = 
        {
            "Content-Type": "application/json",
            "Accept": "application/vnd.bentley.v1+json",
            "Authorization": await this.authorizationClient!.getAccessToken(),
        };
        const reqBase = {
            headers,
            method 
        };
        const request =  ["POST", "PATCH"].includes(method) ? { ...reqBase, body: JSON.stringify(payload) } : reqBase;
        const response = await fetch(url, request);

        if(!okRet.includes(response.status))
            return new Error("Error in request: " + response.url + ", return code : " + response.status + " " + response.statusText);

        const res = await response.json();
        return res;
    }

    /**
     * Create a job corresponding to the given settings.
     * @param {JobSettings} settings Settings for the job.
     * @param {string} jobName Name for the job.
     * @param {string} iTwinId iTwin associated to this job.
     * @returns {string | Error} Created job id, or a potential error message.
     */
    public async createJob(settings: JobSettings, jobName: string, iTwinId: string): Promise<string | Error> {
        const body = {
            "type": settings.type,
            "name": jobName,
            "iTwinId": iTwinId,
            "settings": settings.toJson()
        };
        const response = await this.submitRequest(this.url + "jobs", "POST", [201], body);
        if("message" in response)
            return response as Error;

        return response["job"]["id"];
    }

    /**
     * Submit a job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {void | Error} A potential error message.
     */
    public async submitJob(jobId: string): Promise<void | Error> {
        const body = {"state": "active"};
        const response = await this.submitRequest(this.url + "jobs/" + jobId, "PATCH", [200], body);
        if("message" in response)
            return response as Error;
    }
    
    /**
     * Cancel a job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {void | Error} A potential error message.
     */
    public async cancelJob(jobId: string): Promise<void | Error> {       
        const body = {
            "state": "cancelled",
        };
        const response = await this.submitRequest(this.url + "jobs/" + jobId, "PATCH", [200], body);
        if("message" in response)
            return response as Error;
    }

    /**
     * Delete a job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {void | Error} A potential error message.
     */
    public async deleteJob(jobId: string): Promise<void | Error> {
        const response = await this.submitRequest(this.url + "jobs/" + jobId, "DELETE", [204]);
        if("message" in response)
            return response as Error;
    }

    /**
     * Get progress for a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {JobProgress | Error} The progress for the job, or a potential error message.
     */
    public async getJobProgress(jobId: string): Promise<JobProgress | Error> {
        const response = await this.submitRequest(this.url + `jobs/${jobId}/progress`, "GET", [200]);
        const progress = response["progress"];
        if("message" in response)
            return response as Error;
        
        return {status: progress["state"], progress: JSON.parse(progress["percentage"]), step: progress["step"]};
    }

    /**
     * Get settings for a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {JobSettings | Error} The settings for the job, or a potential error message.
     */
    public async getJobSettings(jobId: string): Promise<JobSettings | Error> {
        const response = await this.submitRequest(this.url + "jobs/" + jobId, "GET", [200]);
        if("message" in response)
            return response as Error;

        if(response["job"]["type"] === RDAJobType.O2D)
            return O2DJobSettings.fromJson(response["job"]["settings"]);

        if(response["job"]["type"] === RDAJobType.S2D)
            return S2DJobSettings.fromJson(response["job"]["settings"]);

        if(response["job"]["type"] === RDAJobType.O3D)
            return O3DJobSettings.fromJson(response["job"]["settings"]);

        if(response["job"]["type"] === RDAJobType.S3D)
            return S3DJobSettings.fromJson(response["job"]["settings"]);

        if(response["job"]["type"] === RDAJobType.L3D)
            return L3DJobSettings.fromJson(response["job"]["settings"]);

        if(response["job"]["type"] === RDAJobType.ChangeDetection)
            return ChangeDetectionJobSettings.fromJson(response["job"]["settings"]);
        
        return Error("Can't get job settings of unknown type : " + response["job"]["type"]);
    }

    /**
     * Get all properties for a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {RDAJobProperties | Error} The job properties, or a potential error message.
     */
    public async getJobProperties(jobId: string): Promise<RDAJobProperties | Error> {
        const response = await this.submitRequest(this.url + "jobs/" + jobId, "GET", [200]);
        if("message" in response)
            return response as Error;
        
        const job = response["job"];
        const jobProperties: RDAJobProperties = {
            name: job["name"],
            type: job["type"],
            iTwinId: job["iTwinId"],
            settings: new O2DJobSettings(), // dummy settings
            id: job["id"],
            email: job["email"],
            state: job["state"],
            exitCode: job["executionInformation"]["exitCode"],
            executionCost: job["executionInformation"]["estimatedUnits"],
            dataCenter: job["dataCenter"],
        };

        let settings: JobSettings | Error;
        if(job["type"] === RDAJobType.O2D) {
            settings = O2DJobSettings.fromJson(job["settings"]);
        }
        else if(job["type"] === RDAJobType.S2D) {
            settings = S2DJobSettings.fromJson(job["settings"]);
        }
        else if(job["type"] === RDAJobType.O3D) {
            settings = O3DJobSettings.fromJson(job["settings"]);
        }
        else if(job["type"] === RDAJobType.S3D) {
            settings = S3DJobSettings.fromJson(job["settings"]);
        }
        else if(job["type"] === RDAJobType.L3D) {
            settings = L3DJobSettings.fromJson(job["settings"]);
        }
        else if(job["type"] === RDAJobType.ChangeDetection) {
            settings = ChangeDetectionJobSettings.fromJson(job["settings"]);
        }
        else
            return Error("Can't get job properties of unknown type : " + job["type"]);

        if(settings instanceof Error)
            return settings;
        
        jobProperties.settings = settings;

        if(job["executionInformation"]) {
            jobProperties.dates = {
                createdDateTime: job["createdDateTime"],
                submissionDateTime: job["executionInformation"]["submissionDateTime"],
                startedDateTime: job["executionInformation"]["startedDateTime"],
                endedDateTime: job["executionInformation"]["endedDateTime"],             
            };         
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

    /**
     * Get type of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {RDAJobType | Error} The type for the job, or a potential error message.
     */
    public async getJobType(jobId: string): Promise<RDAJobType | Error> {
        const properties = await this.getJobProperties(jobId);
        if("message" in properties)
            return properties as Error;
            
        return properties.type;
    }

    /**
     * Get iTwinId of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {string | Error} The job iTwinId, or a potential error message.
     */
    public async getJobiTwinId(jobId: string): Promise<string | Error> {
        const properties = await this.getJobProperties(jobId);
        if("message" in properties)
            return properties as Error;
            
        return properties.iTwinId;
    }

    /**
     * Get name of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {string | Error} The job name, or a potential error message.
     */
    public async getJobName(jobId: string): Promise<string | Error> {   
        const properties = await this.getJobProperties(jobId);
        if("message" in properties)
            return properties as Error;
            
        return properties.name;
    }

    /**
     * Get state of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {string | undefined | Error} The job state, or a potential error message.
     */
    public async getJobState(jobId: string): Promise<string | undefined | Error> {   
        const properties = await this.getJobProperties(jobId);
        if("message" in properties)
            return properties as Error;
                
        return properties.state;
    }

    /**
     * Get the execution cost of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {number | undefined | Error} The job execution cost, or a potential error message.
     */
    public async getJobExecutionCost(jobId: string): Promise<string | undefined | Error> {   
        const properties = await this.getJobProperties(jobId);
        if("message" in properties)
            return properties as Error;
                
        return properties.executionCost;
    }

    /**
     * Get the exit code of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {number | undefined | Error} The job exit code, or a potential error message.
     */
    public async getJobExitCode(jobId: string): Promise<string | undefined | Error> {   
        const properties = await this.getJobProperties(jobId);
        if("message" in properties)
            return properties as Error;
                
        return properties.executionCost;
    }

    /**
     * Get the estimated cost of a given job.
     * @param {string} jobId The ID of the relevant job.
     * @returns {number | undefined | Error} The job cost estimation, or a potential error message.
     */
    public async getJobEstimatedCost(jobId: string, costParameters: RDACostParameters): Promise<number | undefined | Error> {
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
        const response = await this.submitRequest(this.url + "jobs/" + jobId, "PATCH", [200], body);
        if("message" in response)
            return response as Error;
        
        return response.costEstimation?.estimateCost;
    }

}
import { IModelHost } from "@itwin/core-backend";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { JobDates, JobProgress } from "../CommonData";
import { CCJobSettings } from "./Settings";
import fetch from "node-fetch";
import { CCCostParameters, CCJobProperties, CCJobType, CCWorkspaceProperties } from "./Utils";

export class ContextCaptureService {
    /** Url of the Context Capture Service. */
    private url: string;

    /** A client id with realitydata and contextcapture scopes. */
    private clientId: string;

    /** Service application secret. */
    private secret: string;

    /** Authorization client to generate the access token, automatically refreshed if necessary.*/
    private authorizationClient?: ServiceAuthorizationClient;

    /**
     * Create a new ContextCaptureService from provided iModel application.
     * @param {string} url Url of the Context Capture Service.
     * @param {string} clientId A client id with realitydata and contextcapture scopes.
     * @param {string} secret Service application secret.
     */
    constructor(url: string, clientId: string, secret?: string) {        
        this.url = url;
        this.clientId = clientId;
        this.secret = secret ?? "";
    }

    /**
     * Connects to Context Capture service.
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
                scope: "realitydata:modify realitydata:read contextcapture:read contextcapture:modify",
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
     * Create a workspace corresponding to the given parameters.
     * @param name Workspace name.
     * @param iTwinId iTwinId associated to the workspace.
     * @param contextCaptureVersion Version of ContextCapture to be used for this workspace.
     * @returns created workspace id, or a potential error message.
     */
    public async createWorkspace(name: string, iTwinId: string, contextCaptureVersion?: string): Promise<string | Error> {

        const body = {
            "name": name,
            "iTwinId": iTwinId,
            "contextCaptureVersion": contextCaptureVersion
        };
        const response = await this.submitRequest(this.url + "workspaces", "POST", [201], body);
        if("message" in response)
            return response as Error;

        return response["workspace"]["id"];
    }

    /**
     * Delete a workspace.
     * @param {string} workspaceId The ID of the relevant workspace.
     * @returns {void | Error} A potential error message.
     */
    public async deleteWorkspace(workspaceId: string): Promise<void | Error> {
        const response = await this.submitRequest(this.url + "workspaces/" + workspaceId, "DELETE", [204]);
        if("message" in response)
            return response as Error;
    }

    /**
     * Get a workspace.
     * @param {string} workspaceId The ID of the relevant workspace.
     * @returns {CCWorkspaceProperties | Error} Workspace properties, or a potential error message.
     */
    public async getWorkspace(workspaceId: string): Promise<CCWorkspaceProperties | Error> {
        const response = await this.submitRequest(this.url + "workspaces/" + workspaceId, "GET", [200]);
        if("message" in response)
            return response as Error;

        return {
            id: response["workspace"]["id"],
            createdDateTime: response["workspace"]["createdDatTime"],
            name: response["workspace"]["name"],
            iTwinId: response["workspace"]["iTwinId"],
            contextCaptureVersion: response["workspace"]["contextCaptureVersion"],
        };
    }

    /**
     * Create a job corresponding to the given settings.
     * @param type Job type.
     * @param settings Settings for the job.
     * @param name Name for the job.
     * @param workspaceId Workspace associated to this job.
     * @param iTwinId iTwin associated to this job.
     * @returns Created job id, or a potential error message.
     */
    public async createJob(type: CCJobType, settings: CCJobSettings, name: string, workspaceId: string, 
        iTwinId: string): Promise<string | Error> {
        const settingsJson = settings.toJson();
        const body = {
            "type": type,
            "name": name,
            "iTwinId": iTwinId,
            "inputs": settingsJson.inputs, // todo
            "settings": settingsJson.settings, // todo
            "workspaceId": workspaceId,
        };
        
        const response = await this.submitRequest(this.url + "jobs/", "POST", [201], body);
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
     * @param {string} id The ID of the relevant job.
     * @returns {void | Error} A potential error message.
     */
    public async cancelJob(id: string): Promise<void | Error> {       
        const body = {
            "state": "cancelled",
        };
        const response = await this.submitRequest(this.url + "jobs/" + id, "PATCH", [200], body);
        if("message" in response)
            return response as Error;
    }

    /**
     * Delete a job.
     * @param {string} id The ID of the relevant job.
     * @returns {void | Error} A potential error message.
     */
    public async deleteJob(id: string): Promise<void | Error> {
        const response = await this.submitRequest(this.url + "jobs/" + id, "DELETE", [204]);
        if("message" in response)
            return response as Error;
    }

    /**
     * Get progress for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobProgress | Error} The progress for the job, or a potential error message.
     */
    public async getJobProgress(id: string): Promise<JobProgress | Error> {
        const response = await this.submitRequest(this.url + `jobs/${id}/progress`, "GET", [200]);
        const progress = response["progress"];
        if("message" in response)
            return response as Error;
        
        return {status: progress["state"], progress: JSON.parse(progress["percentage"]), step: progress["step"]};
    }

    /**
     * Get all properties for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {RDAJobProperties | Error} The job properties, or a potential error message.
     */
    public async getJobProperties(id: string): Promise<CCJobProperties | Error> {
        const response = await this.submitRequest(this.url + "jobs/" + id, "GET", [200]);
        if("message" in response)
            return response as Error;
        
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

        let settings = CCJobSettings.fromJson(job["inputs"], job["jobSettings"]);
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
                meshQuality: job["costEstimationParameters"]["meshQuality"],
            };
        }

        return jobProperties;
    }

    /**
     * Get settings for a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {JobSettings | Error} The settings for the job, or a potential error message.
     */
    public async getJobSettings(id: string): Promise<CCJobSettings | Error> {
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;

        return properties.settings;
    }

    /**
     * Get type of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {CCJobType | Error} The type for the job, or a potential error message.
     */
    public async getJobType(id: string): Promise<CCJobType | Error> {
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;
            
        return properties.type;
    }

    /**
     * Get iTwinId of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {string | Error} The job iTwinId, or a potential error message.
     */
    public async getJobiTwinId(id: string): Promise<string | Error> {
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;
            
        return properties.iTwinId;
    }

    /**
     * Get name of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {string | Error} The job name, or a potential error message.
     */
    public async getName(id: string): Promise<string | Error> {   
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;
            
        return properties.name;
    }

    /**
     * Get state of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {string | undefined | Error} The job state, or a potential error message.
     */
    public async getJobState(id: string): Promise<string | undefined | Error> {   
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;
                
        return properties.state;
    }

    /**
     * Get the execution cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number | undefined | Error} The job execution cost, or a potential error message.
     */
    public async getJobExecutionCost(id: string): Promise<string | undefined | Error> {   
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;
                
        return properties.executionCost;
    }

    /**
     * Get the creation, start, submission and end dates of the given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number | undefined | Error} The job dates, or a potential error message.
     */
    public async getJobDates(id: string): Promise<JobDates | undefined | Error> {   
        const properties = await this.getJobProperties(id);
        if("message" in properties)
            return properties as Error;
                
        return properties.dates;
    }

    /**
     * Get the estimated cost of a given job.
     * @param {string} id The ID of the relevant job.
     * @returns {number | undefined | Error} The job cost estimation, or a potential error message.
     */
    public async getJobEstimatedCost(id: string, costParameters: CCCostParameters): Promise<number | undefined | Error> {
        const body = {
            costEstimationParameters: {
                gigaPixels: costParameters.gigaPixels,
                megaPoints: costParameters.megaPoints,
                meshQuality: costParameters.meshQuality,
            }
        }
        const response = await this.submitRequest(this.url + "jobs/" + id, "PATCH", [200], body);
        if("message" in response)
            return response as Error;
        
        return response.costEstimation?.estimateCost;
    }
}
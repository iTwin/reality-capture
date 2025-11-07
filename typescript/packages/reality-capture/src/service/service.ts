import axios, { AxiosInstance, AxiosResponse } from "axios";
import type { AuthorizationClient } from "@itwin/core-common";
import { BucketResponse } from "./bucket";
import { CostEstimationCreate, CostEstimation } from "./estimation";
import { Files } from "./files";
import { Response } from "./response";
import { JobCreate, Job, Progress, Messages, Service, getAppropriateService } from "./job";
import { DetailedErrorResponse, DetailedError } from "./error";

export class RealityCaptureService {
    private _authorizationClient: AuthorizationClient;
    private _axios: AxiosInstance;
    private _serviceUrl: string;

    constructor(authorizationClient: AuthorizationClient, kwargs?: { env?: string }) {
        this._authorizationClient = authorizationClient;
        this._axios = axios.create();
        const env = kwargs?.env;
        if (env === "qa") {
            this._serviceUrl = "https://qa-api.bentley.com/";
        } else if (env === "dev") {
            this._serviceUrl = "https://dev-api.bentley.com/";
        } else {
            this._serviceUrl = "https://api.bentley.com/";
        }
    }

    private async _getHeader(version: "v1" | "v2") {
        return {
            Authorization: await this._authorizationClient.getAccessToken(),
            "User-Agent": "Reality Capture TypeScript SDK",
            "Content-type": "application/json",
            Accept: `application/vnd.bentley.itwin-platform.${version}+json`,
        };
    }

    private _getModelingUrl() {
        return this._serviceUrl + "reality-modeling/";
    }



    private _getCorrectUrl(service: Service): string {
        switch (service) {
        case Service.MODELING:
            return this._getModelingUrl();
        default:
            throw new Error("Other services not yet implemented");
        }
    }

    private _getIllFormedMessage(response: any, exception: any): string {
        return `Service response is ill-formed: ${JSON.stringify(response.data)}. Exception: ${exception}`;
    }

    async submitJob(job: JobCreate): Promise<Response<Job>> {
        const url = this._getCorrectUrl(getAppropriateService(job.type));
        try {
            const resp = await this._axios.post(url + "/jobs", job, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data.job as Job);
        } catch (error: any) {
            return this._handleError<Job>(error);
        }
    }

    async getJob(jobId: string, service: Service): Promise<Response<Job>> {
        const url = this._getCorrectUrl(service);
        try {
            const resp = await this._axios.get(url + "/jobs/" + jobId, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data.job as Job);
        } catch (error: any) {
            return this._handleError<Job>(error);
        }
    }

    async getJobMessages(jobId: string, service: Service): Promise<Response<Messages>> {
        const url = this._getCorrectUrl(service);
        try {
            const resp = await this._axios.get(url + `/jobs/${jobId}/messages`, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data.messages as Messages);
        } catch (error: any) {
            return this._handleError<Messages>(error);
        }
    }

    async getJobProgress(jobId: string, service: Service): Promise<Response<Progress>> {
        const url = this._getCorrectUrl(service);
        try {
            const resp = await this._axios.get(url + `/jobs/${jobId}/progress`, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data.progress as Progress);
        } catch (error: any) {
            return this._handleError<Progress>(error);
        }
    }

    async cancelJob(jobId: string, service: Service): Promise<Response<Job>> {
        const url = this._getCorrectUrl(service);
        try {
            const resp = await this._axios.delete(url + `/jobs/${jobId}`, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data.job as Job);
        } catch (error: any) {
            return this._handleError<Job>(error);
        }
    }

    async estimateCost(estimationCreate: CostEstimationCreate): Promise<Response<CostEstimation>> {
        const url = this._getCorrectUrl(getAppropriateService(estimationCreate.type));
        try {
            const resp = await this._axios.post(url + "/costs", estimationCreate, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data.costEstimation as CostEstimation);
        } catch (error: any) {
            return this._handleError<CostEstimation>(error);
        }
    }

    async getBucket(itwinId: string): Promise<Response<BucketResponse>> {
        const url = this._getModelingUrl() + `itwins/${itwinId}/bucket`;
        try {
            const resp = await this._axios.get(url, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data as BucketResponse);
        } catch (error: any) {
            return this._handleError<BucketResponse>(error);
        }
    }

    async getServiceFiles(): Promise<Response<Files>> {
        const url = this._getModelingUrl() + "files";
        try {
            const resp = await this._axios.get(url, { headers: await this._getHeader("v2") });
            return new Response(resp.status, null, resp.data as Files);
        } catch (error: any) {
            return this._handleError<Files>(error);
        }
    }

    private _handleError<T>(error: any): Response<T> {
        if (error.response) {
            const data = error.response.data;
            if (!data || typeof data !== "object" || !("error" in data)) {
                const detError = {
                    code: "UnknownError",
                    message: this._getIllFormedMessage(error.response, "Malformed error data"),
                } as DetailedError;
                return new Response<T>(error.response.status, { error: detError }, null);
            }
            return new Response<T>(error.response.status, data as DetailedErrorResponse, null);
        } else {
            const detError = {
                code: "UnknownError",
                message: error.message,
            } as DetailedError;
            return new Response<T>(500, { error: detError }, null);
        }
    }
}
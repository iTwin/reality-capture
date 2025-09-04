import axios, { AxiosInstance, AxiosResponse } from "axios";
import { BucketResponse } from "./bucket";
import { DetectorsMinimalResponse, DetectorResponse } from "./detectors";
import { CostEstimationCreate, CostEstimation } from "./estimation";
import { Files } from "./files";
import { Response } from "./response";
import { JobCreate, Job, Progress, Messages, Service, getAppropriateService } from "./job";
import { RealityDataCreate, RealityData, RealityDataUpdate, ContainerDetails, RealityDataFilter, Prefer, RealityDatas, filterAsDictForServiceCall } from "./reality_data";
import { DetailedErrorResponse, DetailedError } from "./error";

export class RealityCaptureService {
  private _tokenFactory: { get_token: () => string };
  private _axios: AxiosInstance;
  private _serviceUrl: string;

  constructor(tokenFactory: { get_token: () => string }, kwargs?: { env?: string }) {
    this._tokenFactory = tokenFactory;
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

  private _getHeader(version: "v1" | "v2") {
    return {
      Authorization: this._tokenFactory.get_token(),
      "User-Agent": "Reality Capture TypeScript SDK",
      "Content-type": "application/json",
      Accept: `application/vnd.bentley.itwin-platform.${version}+json`,
    };
  }

  private _getRealityManagementRdUrl() {
    return this._serviceUrl + "reality-management/reality-data/";
  }

  private _getModelingUrl() {
    return this._serviceUrl + "reality-modeling/";
  }

  private _getAnalysisUrl() {
    return this._serviceUrl + "realitydataanalysis/";
  }

  private _getCorrectUrl(service: Service): string {
    switch (service) {
      case Service.MODELING:
        return this._getModelingUrl();
      case Service.ANALYSIS:
        return this._getAnalysisUrl();
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
      const resp = await this._axios.post(url + "/jobs", job, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.job as Job);
    } catch (error: any) {
      return this._handleError<Job>(error);
    }
  }

  async getJob(jobId: string, service: Service): Promise<Response<Job>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._axios.get(url + "/jobs/" + jobId, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.job as Job);
    } catch (error: any) {
      return this._handleError<Job>(error);
    }
  }

  async getJobMessages(jobId: string, service: Service): Promise<Response<Messages>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._axios.get(url + `/jobs/${jobId}/messages`, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.messages as Messages);
    } catch (error: any) {
      return this._handleError<Messages>(error);
    }
  }

  async getJobProgress(jobId: string, service: Service): Promise<Response<Progress>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._axios.get(url + `/jobs/${jobId}/progress`, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.progress as Progress);
    } catch (error: any) {
      return this._handleError<Progress>(error);
    }
  }

  async cancelJob(jobId: string, service: Service): Promise<Response<Job>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._axios.delete(url + `/jobs/${jobId}`, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.job as Job);
    } catch (error: any) {
      return this._handleError<Job>(error);
    }
  }

  async estimateCost(estimationCreate: CostEstimationCreate): Promise<Response<CostEstimation>> {
    const url = this._getCorrectUrl(getAppropriateService(estimationCreate.type));
    try {
      const resp = await this._axios.post(url + "/costs", estimationCreate, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.costEstimation as CostEstimation);
    } catch (error: any) {
      return this._handleError<CostEstimation>(error);
    }
  }

  async getBucket(itwinId: string): Promise<Response<BucketResponse>> {
    const url = this._getModelingUrl() + `itwins/${itwinId}/bucket`;
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data as BucketResponse);
    } catch (error: any) {
      return this._handleError<BucketResponse>(error);
    }
  }

  async getServiceFiles(): Promise<Response<Files>> {
    const url = this._getModelingUrl() + "files";
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data as Files);
    } catch (error: any) {
      return this._handleError<Files>(error);
    }
  }

  async getDetectors(): Promise<Response<DetectorsMinimalResponse>> {
    const url = this._getAnalysisUrl() + "detectors";
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data as DetectorsMinimalResponse);
    } catch (error: any) {
      return this._handleError<DetectorsMinimalResponse>(error);
    }
  }

  async getDetector(detectorName: string): Promise<Response<DetectorResponse>> {
    const url = this._getAnalysisUrl() + `detectors/${detectorName}`;
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v2") });
      return new Response(resp.status, null, resp.data as DetectorResponse);
    } catch (error: any) {
      return this._handleError<DetectorResponse>(error);
    }
  }

  async createRealityData(realityData: RealityDataCreate): Promise<Response<RealityData>> {
    try {
      const resp = await this._axios.post(this._getRealityManagementRdUrl(), realityData, { headers: this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.realityData as RealityData);
    } catch (error: any) {
      return this._handleError<RealityData>(error);
    }
  }

  async getRealityData(realityDataId: string, itwinId?: string): Promise<Response<RealityData>> {
    let url = this._getRealityManagementRdUrl() + realityDataId;
    if (itwinId) url += `?iTwinId=${itwinId}`;
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.realityData as RealityData);
    } catch (error: any) {
      return this._handleError<RealityData>(error);
    }
  }

  async updateRealityData(realityDataUpdate: RealityDataUpdate, realityDataId: string): Promise<Response<RealityData>> {
    const url = this._getRealityManagementRdUrl() + realityDataId;
    try {
      const resp = await this._axios.patch(url, realityDataUpdate, { headers: this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.realityData as RealityData);
    } catch (error: any) {
      return this._handleError<RealityData>(error);
    }
  }

  async deleteRealityData(realityDataId: string): Promise<Response<null>> {
    const url = this._getRealityManagementRdUrl() + realityDataId;
    try {
      const resp = await this._axios.delete(url, { headers: this._getHeader("v1") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<null>(error);
    }
  }

  async getRealityDataWriteAccess(realityDataId: string, itwinId?: string): Promise<Response<ContainerDetails>> {
    let url = this._getRealityManagementRdUrl() + realityDataId + "/writeaccess";
    if (itwinId) url += `?iTwinId=${itwinId}`;
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v1") });
      return new Response(resp.status, null, resp.data as ContainerDetails);
    } catch (error: any) {
      return this._handleError<ContainerDetails>(error);
    }
  }

  async getRealityDataReadAccess(realityDataId: string, itwinId?: string): Promise<Response<ContainerDetails>> {
    let url = this._getRealityManagementRdUrl() + realityDataId + "/readaccess";
    if (itwinId) url += `?iTwinId=${itwinId}`;
    try {
      const resp = await this._axios.get(url, { headers: this._getHeader("v1") });
      return new Response(resp.status, null, resp.data as ContainerDetails);
    } catch (error: any) {
      return this._handleError<ContainerDetails>(error);
    }
  }

  async listRealityData(realityDataFilter?: RealityDataFilter, prefer?: Prefer): Promise<Response<RealityDatas>> {
    let url = this._getRealityManagementRdUrl();
    if (realityDataFilter) {
      const params = realityDataFilter ? filterAsDictForServiceCall(realityDataFilter) : {};
      const encodedParams = new URLSearchParams(params).toString();
      url = `${url}?${encodedParams}`;
    }
    const headers: any = this._getHeader("v1");
    headers["Prefer"] = prefer === Prefer.REPRESENTATION ? "return=representation" : "return=minimal";
    try {
      const resp = await this._axios.get(url, { headers });
      return new Response(resp.status, null, resp.data as RealityDatas);
    } catch (error: any) {
      return this._handleError<RealityDatas>(error);
    }
  }

  private _handleError<T>(error: any): Response<T> {
    if (error.response) {
      try {
        return new Response<T>(
          error.response.status,
          error.response.data as DetailedErrorResponse,
          null
        );
      } catch (e) {
        const detError = {
          code: "UnknownError",
          message: this._getIllFormedMessage(error.response, e),
        } as DetailedError;
        return new Response<T>(error.response.status, { error: detError }, null);
      }
    } else {
      const detError = {
        code: "UnknownError",
        message: error.message,
      } as DetailedError;
      return new Response<T>(500, { error: detError }, null);
    }
  }
}
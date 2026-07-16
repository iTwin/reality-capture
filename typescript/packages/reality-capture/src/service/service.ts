import type { AuthorizationClient } from "@itwin/core-common";
import { BucketResponse } from "./bucket";
import {
  DetectorBase,
  DetectorResponse,
  DetectorsMinimalResponse,
  DetectorUpdate,
  DetectorVersionCreate,
  DetectorVersionWithLinks,
} from "./detectors";
import { CostEstimationCreate, CostEstimation } from "./estimation";
import { Files } from "./files";
import { Response } from "./response";
import {
  JobCreate,
  Job,
  Progress,
  Messages,
  Service,
  getAppropriateService,
  Jobs,
} from "./job";
import { DetailedErrorResponse, DetailedError } from "./error";
import { ContainerDetails, Prefer, RealityData, RealityDataCreate, RealityDataFilter, realityDataFilterAsParams, RealityDatas, RealityDataUpdate } from "./reality_data";

export class RealityCaptureService {
  private _authorizationClient: AuthorizationClient;
  private _serviceUrl: string;
  private _additionalUserAgent: string;

  constructor(
    authorizationClient: AuthorizationClient,
    kwargs?: { env?: string; user_agent?: string },
  ) {
    this._authorizationClient = authorizationClient;
    const env = kwargs?.env;
    if (env === "qa") {
      this._serviceUrl = "https://qa-api.bentley.com/";
    } else if (env === "dev") {
      this._serviceUrl = "https://dev-api.bentley.com/";
    } else {
      this._serviceUrl = "https://api.bentley.com/";
    }
    if (kwargs?.user_agent) {
      this._additionalUserAgent = " " + kwargs?.user_agent;
    } else {
      this._additionalUserAgent = "";
    }
  }

  private async _getHeader(version: "v1" | "v2") {
    return {
      Authorization: await this._authorizationClient.getAccessToken(),
      "User-Agent":
        "Reality Capture TypeScript SDK/" + this._additionalUserAgent,
      "Content-type": "application/json",
      Accept: `application/vnd.bentley.itwin-platform.${version}+json`,
    };
  }

  private _getModelingUrl() {
    return this._serviceUrl + "reality-modeling/";
  }

  private _getAnalysisUrl() {
    return this._serviceUrl + "reality-analysis/";
  }

  private _getManagementUrl() {
    return this._serviceUrl + "reality-management/";
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

  private _buildUrl(url: string, params?: Record<string, any>): string {
    if (!params) {
      return url;
    }
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (!queryString) {
      return url;
    }
    return url + (url.includes("?") ? "&" : "?") + queryString;
  }

  private async _parseBody(response: globalThis.Response): Promise<any> {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  /**
   * Thin wrapper around the native fetch API used by every service call.
   * Mirrors the shape previously relied upon from HTTP client responses/errors so
   * that `_handleError` can stay unchanged: on success it returns
   * `{ status, data }`; on a non-2xx HTTP response it throws
   * `{ response: { status, data } }`.
   */
  private async _request(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    url: string,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; body?: any },
  ): Promise<{ status: number; data: any }> {
    const finalUrl = this._buildUrl(url, options?.params);
    const init: RequestInit = {
      method,
      headers: options?.headers,
    };
    if (options?.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(finalUrl, init);
    const data = await this._parseBody(response);

    if (!response.ok) {
      throw { response: { status: response.status, data } };
    }

    return { status: response.status, data };
  }

  async getJobs(
    service: Service,
    filters: string,
    top: number = 100,
    continuationToken: string = "",
  ): Promise<Response<Jobs>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._request("GET", url + "jobs", {
        params: { $filter: filters, $top: top, continuationToken },
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data as Jobs);
    } catch (error: any) {
      return this._handleError<Jobs>(error);
    }
  }

  async submitJob(job: JobCreate): Promise<Response<Job>> {
    const url = this._getCorrectUrl(getAppropriateService(job.type));
    try {
      const resp = await this._request("POST", url + "jobs", { body: job, headers: await this._getHeader("v2") });
      return new Response(resp.status, null, resp.data.job as Job);
    } catch (error: any) {
      return this._handleError<Job>(error);
    }
  }

  async getJob(jobId: string, service: Service): Promise<Response<Job>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._request("GET", url + "jobs/" + jobId, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data.job as Job);
    } catch (error: any) {
      return this._handleError<Job>(error);
    }
  }

  async getJobMessages(
    jobId: string,
    service: Service,
  ): Promise<Response<Messages>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._request("GET", url + `jobs/${jobId}/messages`, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data.messages as Messages);
    } catch (error: any) {
      return this._handleError<Messages>(error);
    }
  }

  async getJobProgress(
    jobId: string,
    service: Service,
  ): Promise<Response<Progress>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._request("GET", url + `jobs/${jobId}/progress`, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data.progress as Progress);
    } catch (error: any) {
      return this._handleError<Progress>(error);
    }
  }

  async cancelJob(jobId: string, service: Service): Promise<Response<Job>> {
    const url = this._getCorrectUrl(service);
    try {
      const resp = await this._request("DELETE", url + `jobs/${jobId}`, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data.job as Job);
    } catch (error: any) {
      return this._handleError<Job>(error);
    }
  }

  async estimateCost(
    estimationCreate: CostEstimationCreate,
  ): Promise<Response<CostEstimation>> {
    const url = this._getCorrectUrl(
      getAppropriateService(estimationCreate.type),
    );
    try {
      const resp = await this._request("POST", url + "costs", { body: estimationCreate, headers: await this._getHeader("v2") });
      return new Response(
        resp.status,
        null,
        resp.data.costEstimation as CostEstimation,
      );
    } catch (error: any) {
      return this._handleError<CostEstimation>(error);
    }
  }

  async getBucket(itwinId: string): Promise<Response<BucketResponse>> {
    const url = this._getModelingUrl() + `itwins/${itwinId}/bucket`;
    try {
      const resp = await this._request("GET", url, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data as BucketResponse);
    } catch (error: any) {
      return this._handleError<BucketResponse>(error);
    }
  }

  async getServiceFiles(): Promise<Response<Files>> {
    const url = this._getModelingUrl() + "files";
    try {
      const resp = await this._request("GET", url, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data as Files);
    } catch (error: any) {
      return this._handleError<Files>(error);
    }
  }

  async getDetectors(
    detectorsFilter?: string,
  ): Promise<Response<DetectorsMinimalResponse>> {
    const url = this._getAnalysisUrl() + "detectors";
    try {
      const resp = await this._request("GET", url, {
        params: detectorsFilter ? { $filter: detectorsFilter } : undefined,
        headers: await this._getHeader("v2"),
      });
      return new Response(
        resp.status,
        null,
        resp.data as DetectorsMinimalResponse,
      );
    } catch (error: any) {
      return this._handleError<DetectorsMinimalResponse>(error);
    }
  }

  async getDetector(detectorName: string): Promise<Response<DetectorResponse>> {
    const url =
      this._getAnalysisUrl() + `detectors/${encodeURIComponent(detectorName)}`;
    try {
      const resp = await this._request("GET", url, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, resp.data as DetectorResponse);
    } catch (error: any) {
      return this._handleError<DetectorResponse>(error);
    }
  }

  async createDetector(
    detectorCreate: DetectorBase,
  ): Promise<Response<DetectorResponse>> {
    const url = this._getAnalysisUrl() + "detectors";
    try {
      const resp = await this._request("POST", url, { body: detectorCreate, headers: await this._getHeader("v2") });
      return new Response(resp.status, null, resp.data as DetectorResponse);
    } catch (error: any) {
      return this._handleError<DetectorResponse>(error);
    }
  }

  async updateDetector(
    detectorName: string,
    detectorUpdate: DetectorUpdate,
  ): Promise<Response<DetectorResponse>> {
    const url =
      this._getAnalysisUrl() + `detectors/${encodeURIComponent(detectorName)}`;
    try {
      const resp = await this._request("PATCH", url, { body: detectorUpdate, headers: await this._getHeader("v2") });
      return new Response(resp.status, null, resp.data as DetectorResponse);
    } catch (error: any) {
      return this._handleError<DetectorResponse>(error);
    }
  }

  async deleteDetector(detectorName: string): Promise<Response<void>> {
    const url =
      this._getAnalysisUrl() + `detectors/${encodeURIComponent(detectorName)}`;
    try {
      const resp = await this._request("DELETE", url, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async createDetectorVersion(
    detectorName: string,
    versionCreate: DetectorVersionCreate,
  ): Promise<Response<DetectorVersionWithLinks>> {
    const url =
      this._getAnalysisUrl() +
      `detectors/${encodeURIComponent(detectorName)}/versions`;
    try {
      const resp = await this._request("POST", url, { body: versionCreate, headers: await this._getHeader("v2") });
      return new Response(
        resp.status,
        null,
        resp.data as DetectorVersionWithLinks,
      );
    } catch (error: any) {
      return this._handleError<DetectorVersionWithLinks>(error);
    }
  }

  async deleteDetectorVersion(
    detectorName: string,
    detectorVersion: string,
  ): Promise<Response<void>> {
    const url =
      this._getAnalysisUrl() +
      `detectors/${encodeURIComponent(detectorName)}/versions/${encodeURIComponent(detectorVersion)}`;
    try {
      const resp = await this._request("DELETE", url, {
        headers: await this._getHeader("v2"),
      });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async publishDetectorVersion(
    detectorName: string,
    versionNumber: string,
  ): Promise<Response<void>> {
    const url =
      this._getAnalysisUrl() +
      `detectors/${encodeURIComponent(detectorName)}/versions/${encodeURIComponent(versionNumber)}/publish`;
    try {
      const resp = await this._request("POST", url, { headers: await this._getHeader("v2") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async unpublishDetectorVersion(
    detectorName: string,
    versionNumber: string,
  ): Promise<Response<void>> {
    const url =
      this._getAnalysisUrl() +
      `detectors/${encodeURIComponent(detectorName)}/versions/${encodeURIComponent(versionNumber)}/unpublish`;
    try {
      const resp = await this._request("POST", url, { headers: await this._getHeader("v2") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async completeDetectorVersionUpload(
    detectorName: string,
    versionNumber: string,
  ): Promise<Response<void>> {
    const url =
      this._getAnalysisUrl() +
      `detectors/${encodeURIComponent(detectorName)}/versions/${encodeURIComponent(versionNumber)}/complete`;
    try {
      const resp = await this._request("POST", url, { headers: await this._getHeader("v2") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async dissociateRealityData(iTwinId: string, realityDataId: string): Promise<Response<void>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}/iTwins/${encodeURIComponent(iTwinId)}`;
    try {
      const resp = await this._request("DELETE", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async associateRealityData(iTwinId: string, realityDataId: string): Promise<Response<void>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}/iTwins/${encodeURIComponent(iTwinId)}`;
    try {
      const resp = await this._request("POST", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async getRealityDataITwins(realityDataId: string): Promise<Response<string[]>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}/iTwins`;
    try {
      const resp = await this._request("GET", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.iTwins);
    } catch (error: any) {
      return this._handleError<string[]>(error);
    }
  }

  async getRealityDataReadAccess(realityDataId: string, itwinId?: string): Promise<Response<ContainerDetails>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}/readaccess` + (itwinId ? `?iTwinId=${encodeURIComponent(itwinId)}` : "");
    try {
      const resp = await this._request("GET", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, resp.data);
    } catch (error: any) {
      return this._handleError<ContainerDetails>(error);
    }
  }

  async getRealityDataWriteAccess(realityDataId: string, itwinId?: string): Promise<Response<ContainerDetails>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}/writeaccess` + (itwinId ? `?iTwinId=${encodeURIComponent(itwinId)}` : "");
    try {
      const resp = await this._request("GET", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, resp.data);
    } catch (error: any) {
      return this._handleError<ContainerDetails>(error);
    }
  }

  async createRealityData(realityData: RealityDataCreate): Promise<Response<RealityData>> {
    const url = this._getManagementUrl() + "reality-data";
    try {
      const resp = await this._request("POST", url, { body: realityData, headers: await this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.realityData);
    } catch (error: any) {
      return this._handleError<RealityData>(error);
    }
  }

  async updateRealityData(realityData: RealityDataUpdate, realityDataId: string): Promise<Response<RealityData>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}`;
    try {
      const resp = await this._request("PATCH", url, { body: realityData, headers: await this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.realityData);
    } catch (error: any) {
      return this._handleError<RealityData>(error);
    }
  }
  
  async getRealityDataList(realityDataFilter?: RealityDataFilter, prefer?: Prefer): Promise<Response<RealityDatas>> {
    const url = this._getManagementUrl() + "reality-data";
    const params = realityDataFilter ? realityDataFilterAsParams(realityDataFilter) : undefined;
    const headers = {
      ...await this._getHeader("v1"),
      "Prefer": prefer === Prefer.REPRESENTATION ? "return=representation" : "return=minimal",
    };
    try {
      const resp = await this._request("GET", url, { params, headers });
      return new Response(resp.status, null, resp.data as RealityDatas);
    } catch (error: any) {
      return this._handleError<RealityDatas>(error);
    }
  }

  async getRealityData(realityDataId: string, iTwinId?: string): Promise<Response<RealityData>> {
    let url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}`;
    if(iTwinId) {
      url += `?iTwinId=${encodeURIComponent(iTwinId)}`;
    }
    try {
      const resp = await this._request("GET", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, resp.data.realityData);
    } catch (error: any) {
      return this._handleError<RealityData>(error);
    }
  }

  async moveRealityData(realityDataId: string, iTwinId: string): Promise<Response<void>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}/move`;
    try {
      const resp = await this._request("PATCH", url, { body: { iTwinId: iTwinId }, headers: await this._getHeader("v1") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  async deleteRealityData(realityDataId: string): Promise<Response<void>> {
    const url = this._getManagementUrl() + `reality-data/${encodeURIComponent(realityDataId)}`;
    try {
      const resp = await this._request("DELETE", url, { headers: await this._getHeader("v1") });
      return new Response(resp.status, null, null);
    } catch (error: any) {
      return this._handleError<void>(error);
    }
  }

  private _handleError<T>(error: any): Response<T> {
    if (error.response) {
      const data = error.response.data;
      if (!data || typeof data !== "object" || !("error" in data)) {
        const detError = {
          code: "UnknownError",
          message: this._getIllFormedMessage(
            error.response,
            "Malformed error data",
          ),
        } as DetailedError;
        return new Response<T>(
          error.response.status,
          { error: detError },
          null,
        );
      }
      return new Response<T>(
        error.response.status,
        data as DetailedErrorResponse,
        null,
      );
    } else {
      const detError = {
        code: "UnknownError",
        message: error.message,
      } as DetailedError;
      return new Response<T>(500, { error: detError }, null);
    }
  }
}

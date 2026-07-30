import axios, { AxiosInstance } from "axios";
import type { AuthorizationClient } from "@itwin/core-common";
import { Response } from "./response";
import { DetailedError, DetailedErrorResponse } from "./error";

/**
 * Query parameters for listing reality data.
 */
export interface RealityDataQueryParams {
  iTwinId?: string;
  continuationToken?: string;
  top?: number;
  extent?: string;
  orderBy?: string;
  search?: string;
  types?: string;
  acquisitionDateTime?: string;
  createdDateTime?: string;
  modifiedDateTime?: string;
  lastAccessedDateTime?: string;
  ownerId?: string;
  dataCenter?: string;
  tag?: string;
  returnFullRepresentation?: boolean;
}

/**
 * Payload for creating or modifying a reality data.
 */
export interface RealityDataPayload {
  displayName?: string;
  classification?: string;
  type?: string;
  iTwinId?: string;
  dataset?: string;
  group?: string;
  description?: string;
  rootDocument?: string;
  tags?: string[];
  acquisition?: any;
  authoring?: boolean;
  extent?: any;
  crs?: any;
  attribution?: string;
  termsOfUse?: string;
}

/**
 * Response from the reality data list endpoint.
 */
export interface RealityDatasResponse {
  realityData: any[];
  _links?: {
    next?: {
      href?: string;
    };
  };
}

/**
 * Service class for interacting with the Reality Management API (reality data CRUD, associations, blob access).
 * This is the single source of truth for all HTTP calls to the Reality Management API concerning reality data.
 */
export class RealityDataService {
  private _authorizationClient: AuthorizationClient;
  private _axios: AxiosInstance;
  private _baseUrl: string;

  constructor(
    authorizationClient: AuthorizationClient,
    kwargs?: { env?: string },
  ) {
    this._authorizationClient = authorizationClient;
    this._axios = axios.create();
    const env = kwargs?.env;
    if (env === "dev") {
      this._baseUrl =
        "https://dev-api.bentley.com/reality-management/reality-data";
    } else if (env === "qa") {
      this._baseUrl =
        "https://qa-api.bentley.com/reality-management/reality-data";
    } else {
      this._baseUrl =
        "https://api.bentley.com/reality-management/reality-data";
    }
  }

  /**
   * Returns the base URL used by this service.
   */
  get baseUrl(): string {
    return this._baseUrl;
  }

  private async _getHeader(returnFullRepresentation = false) {
    return {
      Authorization: await this._authorizationClient.getAccessToken(),
      "Content-type": "application/json",
      Accept: "application/vnd.bentley.itwin-platform.v1+json",
      Prefer: returnFullRepresentation
        ? "return=representation"
        : "return=minimal",
    };
  }

  /**
   * Get a single reality data by ID.
   * @param realityDataId The reality data identifier.
   * @param iTwinId Optional iTwin identifier for context.
   * @returns Response containing the reality data JSON object.
   */
  async getRealityData(
    realityDataId: string,
    iTwinId?: string,
  ): Promise<Response<any>> {
    const url = new URL(`${this._baseUrl}/${realityDataId}`);
    if (iTwinId) url.searchParams.append("iTwinId", iTwinId);
    try {
      const resp = await this._axios.get(url.href, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.data.realityData);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * List reality data with optional query parameters.
   * @param params Query parameters for filtering, pagination, etc.
   * @returns Response containing the list of reality data and continuation info.
   */
  async getRealityDatas(
    params?: RealityDataQueryParams,
  ): Promise<Response<RealityDatasResponse>> {
    const url = new URL(this._baseUrl);
    if (params) {
      if (params.iTwinId) url.searchParams.append("iTwinId", params.iTwinId);
      if (params.continuationToken)
        url.searchParams.append(
          "continuationToken",
          params.continuationToken,
        );
      if (params.top) url.searchParams.append("$top", params.top.toString());
      if (params.extent) url.searchParams.append("extent", params.extent);
      if (params.orderBy) url.searchParams.append("$orderBy", params.orderBy);
      if (params.search) url.searchParams.append("$search", params.search);
      if (params.types) url.searchParams.append("types", params.types);
      if (params.acquisitionDateTime)
        url.searchParams.append(
          "acquisitionDateTime",
          params.acquisitionDateTime,
        );
      if (params.createdDateTime)
        url.searchParams.append("createdDateTime", params.createdDateTime);
      if (params.modifiedDateTime)
        url.searchParams.append("modifiedDateTime", params.modifiedDateTime);
      if (params.lastAccessedDateTime)
        url.searchParams.append(
          "lastAccessedDateTime",
          params.lastAccessedDateTime,
        );
      if (params.ownerId) url.searchParams.append("ownerId", params.ownerId);
      if (params.dataCenter)
        url.searchParams.append("dataCenter", params.dataCenter);
      if (params.tag) url.searchParams.append("tag", params.tag);
    }
    try {
      const resp = await this._axios.get(url.href, {
        headers: await this._getHeader(params?.returnFullRepresentation),
      });
      return new Response(resp.status, null, resp.data as RealityDatasResponse);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Create a new reality data.
   * @param realityData Payload describing the reality data to create.
   * @returns Response containing the created reality data JSON object.
   */
  async createRealityData(
    realityData: RealityDataPayload,
  ): Promise<Response<any>> {
    try {
      const resp = await this._axios.post(this._baseUrl, realityData, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.data.realityData);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Modify an existing reality data.
   * @param realityDataId The reality data identifier.
   * @param realityData Payload with updated fields.
   * @returns Response containing the modified reality data JSON object.
   */
  async modifyRealityData(
    realityDataId: string,
    realityData: RealityDataPayload,
  ): Promise<Response<any>> {
    const url = `${this._baseUrl}/${realityDataId}`;
    try {
      const resp = await this._axios.patch(url, realityData, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.data.realityData);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Delete a reality data.
   * @param realityDataId The reality data identifier.
   * @returns Response with boolean indicating success (204).
   */
  async deleteRealityData(realityDataId: string): Promise<Response<boolean>> {
    const url = `${this._baseUrl}/${realityDataId}`;
    try {
      const resp = await this._axios.delete(url, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.status === 204);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Associate a reality data to an iTwin.
   * @param realityDataId The reality data identifier.
   * @param iTwinId The iTwin identifier.
   * @returns Response with boolean indicating success (200).
   */
  async associateRealityData(
    realityDataId: string,
    iTwinId: string,
  ): Promise<Response<boolean>> {
    const url = `${this._baseUrl}/${realityDataId}/iTwins/${iTwinId}`;
    try {
      const resp = await this._axios.post(url, undefined, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.status === 200);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Dissociate a reality data from an iTwin.
   * @param realityDataId The reality data identifier.
   * @param iTwinId The iTwin identifier.
   * @returns Response with boolean indicating success (204).
   */
  async dissociateRealityData(
    realityDataId: string,
    iTwinId: string,
  ): Promise<Response<boolean>> {
    const url = `${this._baseUrl}/${realityDataId}/iTwins/${iTwinId}`;
    try {
      const resp = await this._axios.delete(url, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.status === 204);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Move a reality data to a different iTwin.
   * @param realityDataId The reality data identifier.
   * @param iTwinId The target iTwin identifier.
   * @returns Response with boolean indicating success (204).
   */
  async moveRealityData(
    realityDataId: string,
    iTwinId: string,
  ): Promise<Response<boolean>> {
    const url = `${this._baseUrl}/${realityDataId}/move`;
    try {
      const resp = await this._axios.patch(
        url,
        { iTwinId },
        { headers: await this._getHeader() },
      );
      return new Response(resp.status, null, resp.status === 204);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Get the list of iTwins associated with a reality data.
   * @param realityDataId The reality data identifier.
   * @returns Response containing an array of iTwin identifiers.
   */
  async getRealityDataITwins(
    realityDataId: string,
  ): Promise<Response<string[]>> {
    const url = `${this._baseUrl}/${realityDataId}/itwins`;
    try {
      const resp = await this._axios.get(url, {
        headers: await this._getHeader(),
      });
      return new Response(resp.status, null, resp.data.iTwins as string[]);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  /**
   * Get the Azure blob container URL for a reality data (read or write access).
   * @param realityDataId The reality data identifier.
   * @param writeAccess True for write access, false for read-only.
   * @param iTwinId Optional iTwin identifier for context.
   * @returns Response containing the container URL string.
   */
  async getContainerUrl(
    realityDataId: string,
    writeAccess: boolean,
    iTwinId?: string,
  ): Promise<Response<string>> {
    const access = writeAccess ? "writeAccess" : "readAccess";
    const url = new URL(`${this._baseUrl}/${realityDataId}/${access}`);
    if (iTwinId) url.searchParams.append("iTwinId", iTwinId);
    try {
      const resp = await this._axios.get(url.href, {
        headers: await this._getHeader(),
      });
      const containerUrl = resp.data?._links?.containerUrl?.href;
      if (!containerUrl) {
        return new Response<string>(
          422,
          {
            error: {
              code: "InvalidResponse",
              message:
                "API returned an unexpected response: missing containerUrl.",
            },
          },
          null,
        );
      }
      return new Response(200, null, containerUrl as string);
    } catch (error: any) {
      return this._handleError(error);
    }
  }

  private _handleError<T>(error: any): Response<T> {
    if (error.response) {
      const data = error.response.data;
      if (!data || typeof data !== "object" || !("error" in data)) {
        const detError = {
          code: "UnknownError",
          message: `Service response is ill-formed: ${JSON.stringify(data)}.`,
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
        message: error.message || "Unknown error",
      } as DetailedError;
      return new Response<T>(500, { error: detError }, null);
    }
  }
}

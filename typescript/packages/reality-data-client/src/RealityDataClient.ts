/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

/** @packageDocumentation
 * @module RealityDataClient
 */

import { type AccessToken, BentleyError } from "@itwin/core-bentley";
import type {
  AuthorizationClient,
  CartographicRange,
  RealityDataAccess,
} from "@itwin/core-common";
import { RealityDataService, type RealityDataQueryParams } from "@itwin/reality-capture";
import { ITwinRealityData } from "./RealityData";
import { Project } from "./Projects";
import { Angle } from "./helper/Angle";

/** Options for initializing Reality Data Client
 * @beta
 */
export interface RealityDataClientOptions {
  /** The authorization client to use to get access token to Context Share API (authority: https://ims.bentley.com )
   *  When define it will ignore accessToken from API parameters and will get an access token from this client.
   */
  authorizationClient?: AuthorizationClient;
  /** API Version. v1 by default */
  version?: ApiVersion;
  /** API Url. Used to select environment. Defaults to "https://api.bentley.com/reality-management" */
  baseUrl?: string;
}

/** Available Reality Management API Versions */
export enum ApiVersion {
  v1,
}

/** Criteria used to query for reality data associated with an iTwin context.
 * @see getRealityDatas
 * @beta
 */
export interface RealityDataQueryCriteria {
  /** If supplied, only reality data overlapping this range will be included. */
  extent?: CartographicRange;

  /** If true, return all properties for every reality data found in query.
   * If false or undefined, return a minimal representation containing id, displayName and type, along with a url to get full reality data details. */
  getFullRepresentation?: boolean;

  /** If supplied, queries a maximum number of first results Found. Max 500. If not supplied, the query should return the first 100 RealityData found.*/
  top?: number;

  /** Continuation token to get current query's next results.*/
  continuationToken?: string;

  /** Parameter that orders reality data in ascending or descending order. Default is ascending (asc). Can be used on any simple text, date or number property. Example : size desc */
  orderBy?: string;

  /** Searches the given text (case insensitive) in reality data's text properties, such as in Group, DisplayName, Description, RootDocument, Acquirer, Tags. */
  search?: string;

  /** Queries for reality data of specified types.*/
  types?: string[];

  /** Queries for reality data in which the acquisition is in given date range.*/
  acquisitionDates?: DateRange;

  /** Queries for reality data where the creation date is in given date range.*/
  createdDateTime?: DateRange;

  /** Queries for reality data where the modification date is in given date range.*/
  modifiedDateTime?: DateRange;

  /** Queries for reality data where the last accessed date is in given date range.*/
  lastAccessedDateTime?: DateRange;

  /** Queries for reality data owned by a specific user.*/
  ownerId?: string;

  /** Queries for reality data stored in a specific data center.*/
  dataCenter?: string;

  /** Queries for reality data with exact matching tag.*/
  tag?: string;
}

/** Date range*/
export interface DateRange {
  startDateTime: Date;
  endDateTime: Date;
}

/**
 * Response object containing RealityData and continuation token
 */
export interface RealityDataResponse {
  realityDatas: ITwinRealityData[];
  continuationToken?: string;
}

/**
 * Client wrapper to Reality Management API.
 * An instance of this class is used to extract reality data from the Reality Management API.
 * Most important methods enable to obtain a specific reality data, fetch all reality data associated with an iTwin and
 * all reality data of an iTwin within a provided spatial extent.
 * This class also implements extraction of the Azure blob address.
 * @beta
 */
export class RealityDataAccessClient implements RealityDataAccess {
  public readonly baseUrl: string =
    "https://api.bentley.com/reality-management/reality-data";
  public readonly apiVersion: ApiVersion = ApiVersion.v1;
  public readonly authorizationClient: AuthorizationClient | undefined =
    undefined;

  /** @internal The underlying RealityDataService from @itwin/reality-capture */
  private _service: RealityDataService | undefined;

  /**
   * Creates an instance of RealityDataAccessClient.
   */
  public constructor(realityDataClientOptions?: RealityDataClientOptions) {
    // runtime config
    if (realityDataClientOptions) {
      if (realityDataClientOptions.version)
        this.apiVersion = realityDataClientOptions.version;
      if (realityDataClientOptions.baseUrl)
        this.baseUrl = this.setBaseUrl(realityDataClientOptions.baseUrl);
      if (realityDataClientOptions.authorizationClient) {
        this.authorizationClient = realityDataClientOptions.authorizationClient;
        this._service = new RealityDataService(
          realityDataClientOptions.authorizationClient,
          { env: this.resolveEnv() },
        );
      }
    }
  }

  /**
   * Resolves the environment from the base URL.
   */
  private resolveEnv(): string | undefined {
    if (this.baseUrl.includes("dev-api.bentley.com")) return "dev";
    if (this.baseUrl.includes("qa-api.bentley.com")) return "qa";
    return undefined;
  }

  /**
   * Gets or lazily creates the RealityDataService, using a token-based authorization client if needed.
   */
  private getService(accessToken?: string): RealityDataService {
    if (this._service) return this._service;
    // Create a service with a simple token-based auth client
    const tokenAuthClient: AuthorizationClient = {
      getAccessToken: async () => accessToken || "",
    };
    return new RealityDataService(tokenAuthClient, { env: this.resolveEnv() });
  }

  /**
   * Ensures the reality data client points to Reality Management API, as many users hardcode the url to the deprecated Reality Data API.
   * @param baseUrl base url given by users of this client
   * @returns base url to Reality Management API
   */
  private setBaseUrl(baseUrl: string): string {
    const url = new URL(baseUrl);
    switch (url.host) {
      case "dev-api.bentley.com":
        return "https://dev-api.bentley.com/reality-management/reality-data";
      case "qa-api.bentley.com":
        return "https://qa-api.bentley.com/reality-management/reality-data";
      case "api.bentley.com":
        return "https://api.bentley.com/reality-management/reality-data";
      default:
        throw new Error("invalid host");
    }
  }

  /**
   * Try to use authorizationClient in RealityDataClientOptions to get the access token
   * otherwise, will return the input token
   * This is a workaround to support different authorization client for the reality data client and iTwin-core.
   */
  private async resolveAccessToken(accessToken: AccessToken): Promise<string> {
    return this.authorizationClient
      ? this.authorizationClient.getAccessToken()
      : accessToken;
  }

  /**
   * This method returns the URL to obtain the Reality Data details.
   * Technically it should never be required as the RealityData object returned should have all the information to obtain the
   * data.
   * @param iTwinId the iTwin identifier
   * @param realityDataId realityData identifier
   * @returns string containing the URL to reality data for indicated tile.
   * @beta
   */
  public async getRealityDataUrl(
    iTwinId: string | undefined,
    realityDataId: string,
  ): Promise<string> {
    if (iTwinId) {
      return `${this.baseUrl}/${realityDataId}?iTwinId=${iTwinId}`;
    }
    return `${this.baseUrl}/${realityDataId}`;
  }

  /**
   * Gets reality data with all of its properties
   * @param accessToken The client request context.
   * @param iTwinId id of associated iTwin (or project)
   * @param realityDataId realityData identifier
   * @returns The requested reality data.
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the specified reality data is not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async getRealityData(
    accessToken: AccessToken,
    iTwinId: string | undefined,
    realityDataId: string,
  ): Promise<ITwinRealityData> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.getRealityData(realityDataId, iTwinId);
    if (response.isError()) {
      const msg = iTwinId
        ? `Could not fetch reality data: ${realityDataId} with iTwinId ${iTwinId}`
        : `Could not fetch reality data: ${realityDataId}`;
      throw new BentleyError(response.status_code, response.error?.error?.message || msg);
    }
    return new ITwinRealityData(this, response.value, iTwinId);
  }

  /**
   * Gets all reality data associated with the iTwin.
   * @param accessToken The client request context.
   * @param iTwinId id of associated iTwin
   * @param criteria Criteria by which to query.
   * @returns an array of RealityData that are associated to the iTwin.
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async getRealityDatas(
    accessToken: AccessToken,
    iTwinId: string | undefined,
    criteria: RealityDataQueryCriteria | undefined,
  ): Promise<RealityDataResponse> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);

    // Build query params from criteria
    const params: RealityDataQueryParams = {};
    if (iTwinId) params.iTwinId = iTwinId;

    if (criteria) {
      if (criteria.continuationToken)
        params.continuationToken = criteria.continuationToken;

      if (criteria.top) {
        if (criteria.top > 500) {
          throw new BentleyError(
            422,
            "Maximum value for top parameter is 500.",
          );
        }
        params.top = criteria.top;
      }

      if (criteria.extent) {
        const iModelRange = criteria.extent.getLongitudeLatitudeBoundingBox();
        params.extent = `${Angle.radiansToDegrees(iModelRange.low.x)},${Angle.radiansToDegrees(iModelRange.low.y)},${Angle.radiansToDegrees(iModelRange.high.x)},${Angle.radiansToDegrees(iModelRange.high.y)}`;
      }

      if (criteria.orderBy) params.orderBy = criteria.orderBy;
      if (criteria.search) params.search = criteria.search;
      if (criteria.types) params.types = criteria.types.join(",");

      if (criteria.acquisitionDates) {
        params.acquisitionDateTime = `${this.formatIsoString(criteria.acquisitionDates.startDateTime)}/${this.formatIsoString(criteria.acquisitionDates.endDateTime)}`;
      }
      if (criteria.createdDateTime) {
        params.createdDateTime = `${this.formatIsoString(criteria.createdDateTime.startDateTime)}/${this.formatIsoString(criteria.createdDateTime.endDateTime)}`;
      }
      if (criteria.modifiedDateTime) {
        params.modifiedDateTime = `${this.formatIsoString(criteria.modifiedDateTime.startDateTime)}/${this.formatIsoString(criteria.modifiedDateTime.endDateTime)}`;
      }
      if (criteria.lastAccessedDateTime) {
        params.lastAccessedDateTime = `${this.formatIsoString(criteria.lastAccessedDateTime.startDateTime)}/${this.formatIsoString(criteria.lastAccessedDateTime.endDateTime)}`;
      }

      if (criteria.ownerId) params.ownerId = criteria.ownerId;
      if (criteria.dataCenter) params.dataCenter = criteria.dataCenter;
      if (criteria.tag) params.tag = criteria.tag;
      if (criteria.getFullRepresentation) params.returnFullRepresentation = true;
    }

    const response = await service.getRealityDatas(params);
    if (response.isError()) {
      const msg = iTwinId
        ? `Could not fetch reality data with iTwinId ${iTwinId}`
        : "Could not fetch reality data";
      throw new BentleyError(response.status_code, response.error?.error?.message || msg);
    }

    const realityDataResponse: RealityDataResponse = {
      realityDatas: [],
      continuationToken: this.extractContinuationToken(
        response.value?._links?.next?.href,
      ),
    };

    response.value!.realityData.forEach((realityData: any) => {
      realityDataResponse.realityDatas.push(
        new ITwinRealityData(this, realityData, iTwinId),
      );
    });

    return realityDataResponse;
  }

  /**
   * trims milliseconds from date.toISOString() method to conform to for date parameters in the API.
   * See https://developer.bentley.com/apis/reality-management/operations/get-all-reality-data/#request-parameters
   * @param date date to format
   * @returns dateTime string in format YYYY-MM-DDTHH:mm:ssZ e.g. 2021-08-01T00:00:00Z
   */
  private formatIsoString(date: Date): string {
    return `${date.toISOString().slice(0, -5)}Z`;
  }

  private extractContinuationToken(
    url: string | undefined,
  ): string | undefined {
    if (url) {
      // API returns some case sensitive parameters e.g. "ContinuationToken". Therefore first, set parameters to lowercase
      const searchParams = new URLSearchParams(url);
      const newParams = new URLSearchParams();

      for (const [name, value] of searchParams) {
        newParams.append(name.toLowerCase(), value);
      }

      // Then get continuation token value in case insensitive manner.
      const token = newParams.get("continuationtoken");

      return token ? token : undefined;
    }
    return undefined;
  }

  /**
   * Retrieves the list of Projects associated to the specified realityData.
   * @deprecated in 1.0.1, getRealityDataProjects is deprecated and no longer used as Projects API is deprecated. Use getRealityDatasITwins method.
   * @param accessToken The client request context.
   * @param realityDataId realityData identifier
   * @returns an array of Projects that are associated to the realityData.
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @beta
   */
  public async getRealityDataProjects(
    accessToken: AccessToken,
    realityDataId: string,
  ): Promise<Project[]> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.getRealityDataITwins(realityDataId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not fetch reality data projects");
    }

    const projectsResponse: Project[] = [];
    const projectsBaseUrl = this.baseUrl.replace(
      "/reality-management/reality-data",
      "/projects",
    );

    response.value!.forEach((itwinValue: string) => {
      const href = new URL(`${projectsBaseUrl}/${itwinValue}`);
      const self = { href };
      const newProject = new Project({
        id: itwinValue,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _links: { self },
      });
      projectsResponse.push(newProject);
    });

    return projectsResponse;
  }

  /**
   * Retrieves the list of iTwins associated to the specified realityData.
   * @param accessToken The client request context.
   * @param realityDataId realityData identifier
   * @returns an array of iTwin identifiers that are associated to the realityData.
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @beta
   */
  public async getRealityDataITwins(
    accessToken: AccessToken,
    realityDataId: string,
  ): Promise<string[]> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.getRealityDataITwins(realityDataId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not fetch reality data iTwins");
    }
    return response.value!;
  }

  /**
   * Creates a RealityData
   * @param accessToken The client request context.
   * @param iTwinId id of associated iTwin
   * @param iTwinRealityData the realityData to create
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 403 when user does not have required permissions to create a reality data
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async createRealityData(
    accessToken: AccessToken,
    iTwinId: string | undefined,
    iTwinRealityData: ITwinRealityData,
  ): Promise<ITwinRealityData> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);

    const realityDataToCreate = {
      displayName: iTwinRealityData.displayName,
      classification: iTwinRealityData.classification,
      type: iTwinRealityData.type,
      iTwinId,
      dataset: iTwinRealityData.dataset,
      group: iTwinRealityData.group,
      description: iTwinRealityData.description,
      rootDocument: iTwinRealityData.rootDocument,
      tags: iTwinRealityData.tags,
      acquisition: iTwinRealityData.acquisition,
      authoring: iTwinRealityData.authoring,
      extent: iTwinRealityData.extent,
      crs: iTwinRealityData.crs,
      attribution: iTwinRealityData.attribution,
      termsOfUse: iTwinRealityData.termsOfUse,
    };

    const response = await service.createRealityData(realityDataToCreate);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not create reality data");
    }
    return new ITwinRealityData(this, response.value, iTwinId);
  }

  /**
   * Modifies an existing RealityData
   * @param accessToken The client request context.
   * @param iTwinId id of associated iTwin
   * @param iTwinRealityData the realityData to modify
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the specified reality data was not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async modifyRealityData(
    accessToken: AccessToken,
    iTwinId: string | undefined,
    iTwinRealityData: ITwinRealityData,
  ): Promise<ITwinRealityData> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);

    const realityDataToModify = {
      id: iTwinRealityData.id,
      displayName: iTwinRealityData.displayName,
      classification: iTwinRealityData.classification,
      type: iTwinRealityData.type,
      iTwinId,
      dataset: iTwinRealityData.dataset,
      group: iTwinRealityData.group,
      description: iTwinRealityData.description,
      rootDocument: iTwinRealityData.rootDocument,
      tags: iTwinRealityData.tags,
      acquisition: iTwinRealityData.acquisition,
      authoring: iTwinRealityData.authoring,
      extent: iTwinRealityData.extent,
      crs: iTwinRealityData.crs,
      attribution: iTwinRealityData.attribution,
      termsOfUse: iTwinRealityData.termsOfUse,
    };

    const response = await service.modifyRealityData(iTwinRealityData.id, realityDataToModify);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not modify reality data");
    }
    return new ITwinRealityData(this, response.value, iTwinId);
  }

  /**
   * Deletes a RealityData
   * @param accessToken The client request context.
   * @param realityDataId the realityData to delete
   * @returns true if successful (204 response), false if not
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the specified reality data was not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async deleteRealityData(
    accessToken: AccessToken,
    realityDataId: string,
  ): Promise<boolean> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.deleteRealityData(realityDataId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not delete reality data");
    }
    return response.value!;
  }

  /**
   * Associates a RealityData to an iTwin
   * @param accessToken The client request context.
   * @param iTwinId id of iTwin to associate the realityData to.
   * @param realityDataId id of the RealityData.
   * @returns true if successful (200 response) or false if not
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the specified reality data or iTwin was not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async associateRealityData(
    accessToken: AccessToken,
    iTwinId: string,
    realityDataId: string,
  ): Promise<boolean> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.associateRealityData(realityDataId, iTwinId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not associate reality data");
    }
    return response.value!;
  }

  /**
   * Dissociates a RealityData from an iTwin
   * @param accessToken The client request context.
   * @param iTwinId id of iTwin to dissociate the realityData from.
   * @param realityDataId id of the RealityData.
   * @returns true if successful (204 response) or false if not
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the association between the reality data and iTwin was not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async dissociateRealityData(
    accessToken: AccessToken,
    iTwinId: string,
    realityDataId: string,
  ): Promise<boolean> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.dissociateRealityData(realityDataId, iTwinId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not dissociate reality data");
    }
    return response.value!;
  }

  /**
   * Moves a RealityData to a different iTwin
   * @param accessToken The client request context.
   * @param realityDataId The id of the RealityData to move.
   * @param iTwinId The id of the iTwin to move the RealityData to.
   * @returns true if successful (204 response) or false if not
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the specified reality data or iTwin was not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @throws [[BentleyError]] with code 409 when the reality data is already associated with the specified iTwin
   * @beta
   */
  public async moveRealityData(
    accessToken: AccessToken,
    realityDataId: string,
    iTwinId: string,
  ): Promise<boolean> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.moveRealityData(realityDataId, iTwinId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Could not move reality data");
    }
    return response.value!;
  }

  /**
   * Gets the Azure blob container URL for a reality data (read or write access).
   * Used internally by ITwinRealityData.getBlobUrl().
   * @param realityDataId The reality data identifier.
   * @param writeAccess True for write access, false for read-only.
   * @param iTwinId Optional iTwin identifier for context.
   * @returns The container URL string.
   * @throws [[BentleyError]] if the request fails.
   * @beta
   */
  public async getContainerUrl(
    accessToken: AccessToken,
    realityDataId: string,
    writeAccess: boolean,
    iTwinId?: string,
  ): Promise<string> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const service = this.getService(accessTokenResolved);
    const response = await service.getContainerUrl(realityDataId, writeAccess, iTwinId);
    if (response.isError()) {
      throw new BentleyError(response.status_code, response.error?.error?.message || "Invalid container request");
    }
    return response.value!;
  }
}

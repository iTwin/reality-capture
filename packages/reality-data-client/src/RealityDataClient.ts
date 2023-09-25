/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/** @packageDocumentation
 * @module RealityDataClient
 */

import { type AccessToken, BentleyError} from "@itwin/core-bentley";
import type { AuthorizationClient, CartographicRange, RealityDataAccess } from "@itwin/core-common";
import { Angle } from "@itwin/core-geometry";
import type { AxiosResponse } from "axios";
// eslint-disable-next-line no-duplicate-imports
import axios from "axios";

import { ITwinRealityData } from "./RealityData";
import { getRequestConfig } from "./RequestOptions";
import {Project} from "./Projects";

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

/** Available Reality Data API Versions */
export enum ApiVersion {
  v1
}

/** Criteria used to query for reality data associated with an iTwin context.
 * @see getRealityDatas
 * @beta
 */
export interface RealityDataQueryCriteria {
  /** If supplied, only reality data overlapping this range will be included. */
  extent?: CartographicRange;
  /** If true, return all properties for every RealityData found in query.
   * If false or undefined, return a minimal representation containing id, displayName and type, along with a url to get full realityData details. */
  getFullRepresentation?: boolean;
  /** If supplied, queries a maximum number of first results Found. Max 500. If not supplied, the query should return the first 100 RealityData found.
  */
  top?: number;
  /** Continuation token to get current query's next results.*/
  continuationToken?: string;
}

/**
 * Response object containing RealityData and continuation token
 */
export interface RealityDataResponse {
  realityDatas: ITwinRealityData[];
  continuationToken?: string;
}

/**
 * Client wrapper to Reality Data API.
 * An instance of this class is used to extract reality data from the Reality Data API.
 * Most important methods enable to obtain a specific reality data, fetch all reality data associated with an iTwin and
 * all reality data of an iTwin within a provided spatial extent.
 * This class also implements extraction of the Azure blob address.
 * @beta
 */
export class RealityDataAccessClient implements RealityDataAccess {

  public readonly baseUrl: string = "https://api.bentley.com/reality-management/reality-data";
  public readonly apiVersion: ApiVersion = ApiVersion.v1;
  public readonly authorizationClient: AuthorizationClient | undefined = undefined;

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
      if (realityDataClientOptions.authorizationClient)
        this.authorizationClient = realityDataClientOptions.authorizationClient;
    }
  }

  /**
  * Ensures the reality data client points to reality management api, as many users hardcode the url to the deprecated Reality Data API.
  * @param baseUrl base url given by users of this client
  * @returns base url to reality management api
  */
  private setBaseUrl(baseUrl: string): string {
    const url = new URL(baseUrl);
    switch(url.host) {
      case "dev-api.bentley.com" :
        return "https://dev-api.bentley.com/reality-management/reality-data";
      case "qa-api.bentley.com" :
        return "https://qa-api.bentley.com/reality-management/reality-data";
      case "api.bentley.com" :
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
    return this.authorizationClient ? this.authorizationClient.getAccessToken() : accessToken;
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
  public async getRealityDataUrl(iTwinId: string | undefined, realityDataId: string): Promise<string> {

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
  public async getRealityData(accessToken: AccessToken, iTwinId: string | undefined, realityDataId: string): Promise<ITwinRealityData> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const url = `${await this.getRealityDataUrl(iTwinId, realityDataId)}`;
    try {
      const realityDataResponse = await axios.get(url, getRequestConfig(accessTokenResolved, "GET", url, this.apiVersion));

      // Axios throws on 4XX and 5XX; we make sure the response here is 200
      if (realityDataResponse.status !== 200)
        throw new BentleyError(422, iTwinId ? `Could not fetch reality data: ${realityDataId} with iTwinId ${iTwinId}`
          : `Could not fetch reality data: ${realityDataId}`);

      const realityData = new ITwinRealityData(this, realityDataResponse.data.realityData, iTwinId);
      return realityData;
    } catch (error) {
      return this.handleError(error);
    }
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
  public async getRealityDatas(accessToken: AccessToken, iTwinId: string | undefined, criteria: RealityDataQueryCriteria | undefined): Promise<RealityDataResponse> {
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = new URL(this.baseUrl);

      if(iTwinId)
        url.searchParams.append("iTwinId", iTwinId);

      if (criteria) {
        if (criteria.continuationToken) {
          url.searchParams.append("continuationToken", criteria.continuationToken);
        }

        if (criteria.top) {
          const top = criteria.top;
          if (top > 500) {
            throw new BentleyError(422, "Maximum value for top parameter is 500.");
          }
          url.searchParams.append("$top", top.toString());
        }

        if (criteria.extent) {
          const iModelRange = criteria.extent.getLongitudeLatitudeBoundingBox();
          const extent = `${Angle.radiansToDegrees(iModelRange.low.x)},${Angle.radiansToDegrees(iModelRange.low.y)},${Angle.radiansToDegrees(iModelRange.high.x)},${Angle.radiansToDegrees(iModelRange.high.y)}`;
          url.searchParams.append("extent",extent);
        }
      }
      const response = await axios.get(url.href, getRequestConfig(accessTokenResolved, "GET", url.href, this.apiVersion, (criteria?.getFullRepresentation === true ? true : false)));
      // Axios throws on 4XX and 5XX; we make sure the response here is 200
      if (response.status !== 200)
        throw new BentleyError(422, iTwinId ? `Could not fetch reality data with iTwinId ${iTwinId}`
          : `Could not fetch reality data`);

      const realityDatasResponseBody = response.data;

      const realityDataResponse: RealityDataResponse = {
        realityDatas: [],
        continuationToken: this.extractContinuationToken(response.data._links?.next?.href),
      };

      realityDatasResponseBody.realityData.forEach((realityData: any) => {
        realityDataResponse.realityDatas.push(new ITwinRealityData(this, realityData, iTwinId));
      });

      return realityDataResponse;

    } catch (error) {
      return this.handleError(error);
    }
  }

  private extractContinuationToken(url: string | undefined): string | undefined {
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
  public async getRealityDataProjects(accessToken: AccessToken, realityDataId: string): Promise<Project[]> {
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = `${this.baseUrl}/${realityDataId}/itwins`;
      const options = getRequestConfig(accessTokenResolved, "GET", url, this.apiVersion);

      // execute query
      const response = await axios.get(url, options);

      const projectsResponseBody = response.data;

      const projectsResponse: Project[] = [];

      // make up projects details link manually
      const projectsBaseUrl = this.baseUrl.replace("/reality-management/reality-data", "/projects");

      projectsResponseBody.iTwins.forEach((itwinValue: any) => {

        // build Project object with _links.self.href structure
        const href = new URL(`${projectsBaseUrl}/${itwinValue}`);
        const self =
        {
          href,
        };

        const newProject = new Project(
          {
            id: itwinValue,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _links: {
              self,
            },
          });

        projectsResponse.push(newProject);
      });

      return projectsResponse;

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
  * Retrieves the list of iTwins associated to the specified realityData.
  * @param accessToken The client request context.
  * @param realityDataId realityData identifier
  * @returns an array of iTwin identifiers that are associated to the realityData.
  * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
  * @beta
  */
  public async getRealityDataITwins(accessToken: AccessToken, realityDataId: string): Promise<string[]> {
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = `${this.baseUrl}/${realityDataId}/itwins`;
      const options = getRequestConfig(accessTokenResolved, "GET", url, this.apiVersion);

      // execute query
      const response = await axios.get(url, options);

      const iTwinsResponseBody = response.data;

      const itwinsResponse: string[] = [];

      iTwinsResponseBody.iTwins.forEach((itwinValue: any) => {
        itwinsResponse.push(itwinValue);
      });

      return itwinsResponse;

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Creates a RealityData
   * @param accessToken The client request context.
   * @param iTwinId id of associated iTwin
   * @param iTwinRealityDAta the realityData to create
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 403 when user does not have required permissions to create a reality data
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async createRealityData(accessToken: AccessToken, iTwinId: string | undefined, iTwinRealityData: ITwinRealityData): Promise<ITwinRealityData> {
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = this.baseUrl;
      const options = getRequestConfig(accessTokenResolved, "POST", url, this.apiVersion);

      // creation payload

      const realityDataToCreate = {
        displayName: iTwinRealityData.displayName,
        classification: iTwinRealityData.classification,
        type: iTwinRealityData.type,
        iTwinId,
        dataset: iTwinRealityData.dataset,
        group: iTwinRealityData.group,
        description: iTwinRealityData.description,
        rootDocument: iTwinRealityData.rootDocument,
        acquisition: iTwinRealityData.acquisition,
        authoring: iTwinRealityData.authoring,
        extent: iTwinRealityData.extent,
      };

      const response = await axios.post(url, realityDataToCreate, options);
      iTwinRealityData = new ITwinRealityData(this, response.data.realityData, iTwinId);
    } catch (error) {
      return this.handleError(error);
    }

    return iTwinRealityData;
  }

  /**
  * Modifies an existing RealityData
  * @param accessToken The client request context.
  * @param iTwinId id of associated iTwin
  * @param iTwinRealityDAta the realityData to modify
  * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
  * @throws [[BentleyError]] with code 404 when the specified reality data was not found
  * @throws [[BentleyError]] with code 422 when the request is invalid
  * @beta
  */
  public async modifyRealityData(accessToken: AccessToken, iTwinId: string | undefined, iTwinRealityData: ITwinRealityData): Promise<ITwinRealityData> {
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = new URL(`${this.baseUrl}/${iTwinRealityData.id}`);

      const options = getRequestConfig(accessTokenResolved, "PATCH", url.href, this.apiVersion);

      // payload

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
        acquisition: iTwinRealityData.acquisition,
        authoring: iTwinRealityData.authoring,
        extent: iTwinRealityData.extent,
      };

      const response = await axios.patch(url.href, realityDataToModify, options);

      iTwinRealityData = new ITwinRealityData(this, response.data.realityData, iTwinId);
    } catch (error) {
      return this.handleError(error);
    }

    return iTwinRealityData;
  }

  /**
   * Deletes a RealityData
   * @param accessToken The client request context.
   * @param iTwinRealityDAta the realityData to delete
   * @returns true if successful (204 response), false if not
   * @throws [[BentleyError]] with code 401 when the request lacks valid authentication credentials
   * @throws [[BentleyError]] with code 404 when the specified reality data was not found
   * @throws [[BentleyError]] with code 422 when the request is invalid
   * @beta
   */
  public async deleteRealityData(accessToken: AccessToken, realityDataId: string): Promise<boolean> {

    let response: AxiosResponse;
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = `${this.baseUrl}/${realityDataId}`;
      const options = getRequestConfig(accessTokenResolved, "POST", url, this.apiVersion);

      response = await axios.delete(url, options);

    } catch (error) {
      return this.handleError(error);
    }

    if (response.status === 204)
      return true;
    else
      return false;
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
  public async associateRealityData(accessToken: AccessToken, iTwinId: string, realityDataId: string): Promise<boolean> {

    let response: AxiosResponse;
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = `${this.baseUrl}/${realityDataId}/iTwins/${iTwinId}`;
      const options = getRequestConfig(accessTokenResolved, "POST", url, this.apiVersion);

      response = await axios.post(url, undefined, options);

    } catch (error) {
      return this.handleError(error);
    }
    if (response.status === 200)
      return true;
    else
      return false;
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
  public async dissociateRealityData(accessToken: AccessToken, iTwinId: string, realityDataId: string): Promise<boolean> {

    let response: AxiosResponse;
    try {
      const accessTokenResolved = await this.resolveAccessToken(accessToken);
      const url = `${this.baseUrl}/${realityDataId}/iTwins/${iTwinId}`;
      const options = getRequestConfig(accessTokenResolved, "DELETE", url, this.apiVersion);

      response = await axios.delete(url, options);

    } catch (error) {
      return this.handleError(error);
    }
    if (response.status === 204)
      return true;
    else
      return false;
  }

  /**
  * Handle errors thrown.
  * Handled errors can be of AxiosError type or BentleyError.
  * @beta
  */
  private handleError(error: any): any {
    // Default error
    let status = 422;
    let message = "Unknown error. Please ensure that the request is valid.";

    if (axios.isAxiosError(error)) {
      const axiosResponse = error.response!;
      status = axiosResponse.status;
      message = axiosResponse.data?.error?.message;
    } else {
      const bentleyError = error as BentleyError;
      if (bentleyError !== undefined) {
        status = bentleyError.errorNumber;
        message = bentleyError.message;
      }
    }
    return Promise.reject(new BentleyError(status, message));
  }

}

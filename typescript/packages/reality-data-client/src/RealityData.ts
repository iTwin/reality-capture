/* eslint-disable indent */
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import type { RealityData } from "@itwin/core-common";
import { type AccessToken,  BentleyError, type GuidString } from "@itwin/core-bentley";
import type { RealityDataAccessClient } from "./RealityDataClient";

import { getRequestConfig } from "./RequestOptions";
import axios from "axios";

/**
 * Extent of a reality data, delimited by southwest and northeast coordinates.
 */
export interface Extent {
  southWest: Point;
  northEast: Point;
}

/**
 * Point used to define an extent.
 */
export interface Point {
  latitude: number;
  longitude: number;
}

/**
 * Provides information regarding the acquisition, such as dates and acquirer used.
 */
export interface Acquisition {
  startDateTime: Date;
  endDateTime?: Date;
  acquirer?: string;
}

/**
 * Cache parameters for reality data access. Contains the blob url, the timestamp to refresh (every 50 minutes) the url and the root document path.
 * Cache contains one value for the read permission url, and one of the write permission.
 * */
class ContainerCache {

  private _containerRead?: ContainerCacheValue;
  private _containerWrite?: ContainerCacheValue;

  public getCache(access: string): ContainerCacheValue | undefined {
    if (access === "Read")
      return this._containerRead;
    else
      return this._containerWrite;
  }

  public setCache(containerCacheValue: ContainerCacheValue, access: string) {
    if (access === "Read")
      this._containerRead = containerCacheValue;
    else
      this._containerWrite = containerCacheValue;
  }
}

interface ContainerCacheValue {
  url: URL;
  timeStamp: Date;
}

/** RealityData
 * This class implements a Reality Data instance.
 * Data is accessed directly through methods of the reality data instance.
 * Access to the data required a properly entitled token though the access to the blob is controlled through
 * an Azure blob URL, the token may be required to obtain this Azure blob URL or refresh it.
 * The Azure blob URL is considered valid for an hour and is refreshed after 50 minutes.
 * In addition to the reality data properties, and Azure blob URL and internal states, a reality data also contains
 * the identification of the iTwin to be used for access permissions and
 * may contain a RealityDataClient to obtain the specialization to communicate with Reality Management API (to obtain the Azure blob URL).
 * @beta
 */
export class ITwinRealityData implements RealityData {

  public id: GuidString;
  public displayName?: string;
  public dataset?: string;
  public group?: string;
  public dataCenterLocation?: string;
  public description?: string;
  public rootDocument?: string;
  public tags?: string[];
  public acquisition?: Acquisition;
  public size?: number;
  public authoring?: boolean;
  public classification?: string;
  public type?: string;
  public extent?: Extent;
  /** @deprecated in 1.0.1 not used in Reality Management API. Will be removed in next major update.*/
  public accessControl?: string; // TODO remove in next major update
  public modifiedDateTime?: Date;
  public lastAccessedDateTime?: Date;
  public createdDateTime?: Date;

  /** Link to client to fetch the blob url */
  public client: undefined | RealityDataAccessClient;

  /** The GUID identifier of the iTwin used when using the client. */
  public iTwinId: GuidString;

  /** Cache parameters for reality data access. Contains the blob url, the timestamp to refresh (every 50 minutes) the url and the root document path. */
  private _containerCache: ContainerCache;

  /**
   * Creates an instance of RealityData.
   * @beta
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public constructor(client: RealityDataAccessClient, realityData?: any | undefined, iTwinId?: any | undefined) {

    this.client = client!;
    this._containerCache = new ContainerCache();

    if (realityData) {
      this.id = realityData.id;
      this.displayName = realityData.displayName;
      this.dataset = realityData.dataset;
      this.group = realityData.group;
      this.dataCenterLocation = realityData.dataCenterLocation;
      this.description = realityData.description;
      this.rootDocument = realityData.rootDocument;
      this.tags = realityData.tags;
      if (realityData.acquisition) {
        this.acquisition = (realityData.acquisition as Acquisition);
        this.acquisition.startDateTime = new Date(realityData.acquisition.startDateTime);
        this.acquisition.endDateTime = realityData.acquisition.endDateTime ? new Date(realityData.acquisition.endDateTime) : undefined;
        this.acquisition.acquirer = realityData.acquisition.acquirer ? realityData.acquisition.acquirer : undefined;
      }
      this.size = realityData.size;
      this.authoring = realityData.authoring;
      this.classification = realityData.classification;
      this.type = realityData.type;
      this.extent = realityData.extent;
      // eslint-disable-next-line deprecation/deprecation
      this.accessControl = realityData.accessControl;
      this.modifiedDateTime = new Date(realityData.modifiedDateTime);
      this.lastAccessedDateTime = new Date(realityData.lastAccessedDateTime);
      this.createdDateTime = new Date(realityData.createdDateTime);
    }

    if (iTwinId)
      this.iTwinId = iTwinId;
  }

  /**
     * Gets string url to fetch blob data from. Access is read-only.
     * @param accessToken The client request context.
     * @param blobPath name or path of tile
     * @param writeAccess Optional boolean indicating if write access is requested. Default is false for read-only access. The realitydata:modify scope is required to grant the "write" access.
     * @returns string url for blob data
     * @beta
     */
  public async getBlobUrl(accessToken: AccessToken, blobPath: string, writeAccess = false): Promise<URL> {
    const accessTokenResolved = await this.resolveAccessToken(accessToken);
    const url = await this.getContainerUrl(accessTokenResolved, writeAccess);
    if (blobPath === undefined)
      return url;

    const host = `${url.origin + url.pathname}/`;
    const query = url.search;
    return new URL(`${host}${blobPath}${query}`);
  }
  /**
   * Try to use authorizationClient in RealityDataClientOptions to get the access token
   * otherwise, will return the input token
   * This is a workaround to support different authorization client for the reality data client and iTwin-core.
   */
  private async resolveAccessToken(accessToken: AccessToken): Promise<string> {
    return this.client?.authorizationClient ? this.client.authorizationClient.getAccessToken() : accessToken;
  }

  /**
     * Gets a tile access url URL object
     * @param accessToken The client request context.
     * @param writeAccess Optional boolean indicating if write access is requested. Default is false for read-only access.
     * @returns app URL object for blob url
     * @beta
     */
  private async getContainerUrl(accessToken: AccessToken, writeAccess = false): Promise<URL> {

    if (!this.client)
      throw new BentleyError(422, "Invalid container request (RealityDataAccessClient is not set).");

    const access = (writeAccess === true ? "Write" : "Read");
    const accessTokenResolved = await this.resolveAccessToken(accessToken);

    try {

      const containerCache = this._containerCache.getCache(access);
      const blobUrlRequiresRefresh = !containerCache?.timeStamp || (Date.now() - containerCache?.timeStamp.getTime()) > 3000000; // 3 million milliseconds or 50 minutes

      if (undefined === containerCache?.url || blobUrlRequiresRefresh) {

        const url = new URL(`${this.client.baseUrl}/${this.id}/${ writeAccess === true ? "writeAccess" : "readAccess"}`);

        if(this.iTwinId)
          url.searchParams.append("iTwinId", this.iTwinId);

        const requestOptions = getRequestConfig(accessTokenResolved, "GET", url.href, this.client.apiVersion);

        const response = await axios.get(url.href, requestOptions);

        if (!response.data) {
          throw new BentleyError(422, "Invalid container request (API returned an unexpected response).");
        }

        // update cache
        const newContainerCacheValue: ContainerCacheValue = {
          url: new URL(response.data._links.containerUrl.href),
          timeStamp: new Date(Date.now()),
        };

        this._containerCache.setCache(newContainerCacheValue, access);
      }
      return this._containerCache.getCache(access)!.url;
    } catch (errorResponse: any) {
      throw new BentleyError(422, "Invalid container request.");
    }
  }
}

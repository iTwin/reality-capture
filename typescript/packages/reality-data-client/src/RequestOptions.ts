/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { AxiosRequestConfig, Method } from "axios";
import { ApiVersion } from "./RealityDataClient";

/**
 * Build the request methods, headers, and other options
 * @param accessTokenString The client access token string
 */
export function getRequestConfig(accessTokenString: string, method: Method, url: string, apiVersion: ApiVersion, returnFullRepresentation: boolean = false): AxiosRequestConfig {
  return {
    url,
    method,
    headers: {
      "authorization": accessTokenString,
      "content-type": "application/json",
      "accept": getApiVersionHeader(apiVersion),
      "prefer": returnFullRepresentation === true ? "return=representation" : "return=minimal",
    },
  };
}

function getApiVersionHeader(apiVersion: ApiVersion): string {
  switch (apiVersion) {
    case ApiVersion.v1:
    default: return "application/vnd.bentley.itwin-platform.v1+json";
  }
}

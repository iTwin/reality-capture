/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ApiVersion } from "./RealityDataClient";

/**
 * Build the request headers and options for a fetch call.
 * @param accessTokenString The client access token string
 */
export function getRequestConfig(accessTokenString: string, method: string, apiVersion: ApiVersion, returnFullRepresentation = false): RequestInit {
  return {
    method,
    headers: {
      "authorization": accessTokenString,
      "content-type": "application/json",
      "accept": getApiVersionHeader(apiVersion),
      "prefer": returnFullRepresentation ? "return=representation" : "return=minimal",
    },
  };
}

function getApiVersionHeader(apiVersion: ApiVersion): string {
  switch (apiVersion) {
  case ApiVersion.v1:
  default: return "application/vnd.bentley.itwin-platform.v1+json";
  }
}

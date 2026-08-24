/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Response } from "@itwin/reality-capture";

/** Build a successful RC Response */
export function mockRCSuccess<T>(value: T): Response<T> {
  return new Response<T>(200, null, value);
}

/** Build a failed RC Response */
export function mockRCError(statusCode: number, message: string): Response<any> {
  return new Response<any>(statusCode, { error: { code: "Error", message } });
}

/** Builds a minimal fetch Response-like object for use with a stubbed globalThis.fetch */
export function mockFetchResponse(status: number, data?: any): globalThis.Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as globalThis.Response;
}

/** Minimal reality data payload as returned by the Reality Management API */
export const sampleRealityDataPayload = {
  id: "rd-001",
  displayName: "Test Reality Data",
  type: "CCImageCollection",
  classification: "Imagery",
  rootDocument: "root.json",
  description: "A test reality data",
  modifiedDateTime: "2024-01-01T00:00:00.000Z",
  lastAccessedDateTime: "2024-01-02T00:00:00.000Z",
  createdDateTime: "2023-12-01T00:00:00.000Z",
};

/** Container URL returned by the readAccess / writeAccess endpoint */
export const sampleContainerUrl = "https://account.blob.core.windows.net/container?sv=2020-08-04&se=2021-07-22T03%3A50%3A21Z&sr=c&sp=rl&sig=fake";

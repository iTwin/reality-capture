/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/**
 * Builds a minimal fetch `Response`-like object for use with a stubbed global `fetch`
 * in tests, mirroring what `RealityCaptureService`'s `_request` helper relies on
 * (`response.ok`, `response.status`, `response.text()`).
 */
export function mockFetchResponse(status: number, data?: any): globalThis.Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (data === undefined || data === null ? "" : typeof data === "string" ? data : JSON.stringify(data)),
  } as globalThis.Response;
}

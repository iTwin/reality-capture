/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/**
 * Error thrown by the Reality Data Client when an API request fails.
 * The `errorNumber` property carries the HTTP status code.
 * @beta
 */
export class RealityDataClientError extends Error {
  public readonly errorNumber: number;

  constructor(errorNumber: number, message: string) {
    super(message);
    this.name = "RealityDataClientError";
    this.errorNumber = errorNumber;
  }
}

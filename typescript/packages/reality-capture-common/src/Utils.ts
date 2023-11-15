/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/**
 * Describe an iTwin Capture job error.
 */
export interface iTwinCaptureError {
    code: string;
    title: string;
    message: string;
    params: string[];
}

/**
 * Describe iTwin Capture job warning.
 */
// tslint:disable-next-line
export type iTwinCaptureWarning = iTwinCaptureError

/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/**
 * Token factory interface. Implement this interface to create your own token factory.
 */
export interface TokenFactory {
    /** Returns a valid access token to make authenticated requests to an API. */
    getToken: () => Promise<string>;
    /** Returns true if the access token is valid. */
    isOk: () => boolean;
    /** Returns service url. */
    getServiceUrl: () => string;
}
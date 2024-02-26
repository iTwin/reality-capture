/* eslint-disable indent */
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { getAccessTokenFromBackend, type TestUserCredentials, TestUsers } from "@itwin/oidc-signin-tool/lib/cjs/frontend";

/** Basic configuration used by all tests
 */
export class TestConfig {
  // iTwin id used by tests
  public static readonly integrationTestsITwinId: string = "614a3c70-cc9f-4de9-af87-f834002ca19e"; // iTwin name = "Integration tests for reality-data-client"
  public static readonly integrationTestsITwinIdProjects: string = "84856374-51ed-4f13-a386-6721e01f87a3"; // iTwin name = "Integration tests for Reality Data Client 2"
  /** Login the specified user and return the AuthorizationToken */
  public static async getAccessToken(user: TestUserCredentials = TestUsers.regular): Promise<AccessToken> {
    return getAccessTokenFromBackend(user);
  }
}

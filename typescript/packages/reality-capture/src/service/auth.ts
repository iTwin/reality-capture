/** Provides authorization to access APIs. */
export interface AuthorizationClient {
  getAccessToken(): Promise<string>;
}

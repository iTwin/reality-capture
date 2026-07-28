// Pure client-side PKCE helper for Bentley IMS OAuth 2.0 (Client App)

function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0");
}

export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}

export async function generateCodeChallenge(v) {
  const encoder = new TextEncoder();
  const data = encoder.encode(v);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64urlencode(digest);
}

function base64urlencode(a) {
  let str = "";
  const bytes = new Uint8Array(a);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Config variables matching saas/client/.env or fallback to default values
export const AUTH_CONFIG = {
  clientId: import.meta.env.VITE_BENTLEY_CLIENT_ID || "spa-dQsjFKtKCQGHUqLWQweNzvYKW",
  scope: import.meta.env.VITE_BENTLEY_SCOPE || "itwin-platform",
  redirectUri: import.meta.env.VITE_BENTLEY_REDIRECT_URI || "https://localhost:8099",
  authority: import.meta.env.VITE_BENTLEY_AUTHORITY || "https://ims.bentley.com",
  apiBase: import.meta.env.VITE_BENTLEY_API_BASE || "https://api.bentley.com"
};

/**
 * Generates the complete Bentley IMS PKCE authorization URL.
 */
export async function getLiveLoginUrl() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = Math.random().toString(36).substring(2, 15);

  sessionStorage.setItem("pkce_verifier", verifier);
  sessionStorage.setItem("pkce_state", state);

  const authUrl = new URL(`${AUTH_CONFIG.authority}/connect/authorize`);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", AUTH_CONFIG.clientId);
  authUrl.searchParams.append("redirect_uri", AUTH_CONFIG.redirectUri);
  
  authUrl.searchParams.append("scope", AUTH_CONFIG.scope);
  
  authUrl.searchParams.append("code_challenge", challenge);
  authUrl.searchParams.append("code_challenge_method", "S256");
  authUrl.searchParams.append("state", state);

  return authUrl.toString();
}

/**
 * Initiates the PKCE flow by redirecting the user to Bentley IMS.
 */
export async function initiateLiveLogin() {
  const url = await getLiveLoginUrl();
  window.location.href = url;
}

/**
 * Handles the redirect callback after Bentley IMS authenticates the user.
 * Exchanges the authorization code for an Access Token.
 */
export async function handleLiveCallback(code, state) {
  const savedVerifier = sessionStorage.getItem("pkce_verifier");
  const savedState = sessionStorage.getItem("pkce_state");

  if (!savedVerifier || state !== savedState) {
    throw new Error("Invalid state or missing code verifier. Session may have expired.");
  }

  // Clear session storage to avoid reuse
  sessionStorage.removeItem("pkce_verifier");
  sessionStorage.removeItem("pkce_state");

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("client_id", AUTH_CONFIG.clientId);
  body.append("code", code);
  body.append("redirect_uri", AUTH_CONFIG.redirectUri);
  body.append("code_verifier", savedVerifier);

  const response = await fetch(`${AUTH_CONFIG.authority}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to exchange code: ${errText}`);
  }

  const tokenData = await response.json();
  return {
    accessToken: tokenData.access_token,
    expiresIn: tokenData.expires_in,
    idToken: tokenData.id_token,
    refreshToken: tokenData.refresh_token,
    acquiredAt: Date.now()
  };
}

/**
 * Refreshes the access token using a refresh token against Bentley IMS.
 */
export async function refreshLiveToken(refreshToken) {
  if (!refreshToken) {
    throw new Error("No refresh token available for renewal.");
  }

  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("client_id", AUTH_CONFIG.clientId);
  body.append("refresh_token", refreshToken);

  const response = await fetch(`${AUTH_CONFIG.authority}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to refresh token: ${errText}`);
  }

  const tokenData = await response.json();
  return {
    accessToken: tokenData.access_token,
    expiresIn: tokenData.expires_in,
    idToken: tokenData.id_token,
    refreshToken: tokenData.refresh_token || refreshToken,
    acquiredAt: Date.now()
  };
}

/**
 * Quick extraction of user info from access token.
 */
export function getUserProfile(accessToken) {
  try {
    const payload = accessToken.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      email: decoded.email || decoded.upn || "user@bentley.com",
      name: decoded.name || decoded.given_name || "Field Scanner",
      role: "Field Scanner"
    };
  } catch (e) {
    return {
      email: "scanner@bentley.com",
      name: "Bentley Scanner User",
      role: "Field Scanner"
    };
  }
}

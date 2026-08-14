import { useState, useEffect, useCallback } from "react";
import {
  initiateLiveLogin,
  handleLiveCallback,
  refreshLiveToken,
  getUserProfile,
  getLiveLoginUrl,
  AUTH_CONFIG
} from "./auth";

let liveCallbackHandled = false;

export const REALITY_DATA_ACCESS = {
  NO_PERMISSION: "NO_PERMISSION",
  REALITYDATA_USE_ONLY: "REALITYDATA_USE_ONLY",
  REALITYDATA_CREATE: "REALITYDATA_CREATE",
};

/**
 * Classifies raw permission strings into user access context.
 */
export function evaluateUserITwinContext(iTwin, myAccountId, permissions = []) {
  // External vs Internal check using iTwinAccountId / accountId / parentId
  const iTwinAccId = iTwin?.iTwinAccountId || iTwin?.accountId || iTwin?.parentId;
  const isExternal = Boolean(
    myAccountId && iTwinAccId && iTwinAccId !== myAccountId
  );

  // Reality Data RBAC permissions check
  const hasCreate =
    permissions.includes("realitydata_create");
  const hasUse =
    permissions.includes("realitydata_use");

  let realityDataLevel = REALITY_DATA_ACCESS.NO_PERMISSION;
  if (hasCreate) {
    realityDataLevel = REALITY_DATA_ACCESS.REALITYDATA_CREATE;
  } else if (hasUse) {
    realityDataLevel = REALITY_DATA_ACCESS.REALITYDATA_USE_ONLY;
  }

  return {
    isExternal,
    realityDataLevel,
    permissions,
  };
}

export default function useBentleyClient() {
  // --- AUTHENTICATION STATE ---
  const [token, setToken] = useState(() => localStorage.getItem("client_access_token"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("client_refresh_token"));
  const [tokenExpiry, setTokenExpiry] = useState(() => {
    const saved = localStorage.getItem("client_token_expiry");
    return saved ? Number(saved) : null;
  });
  const [isRenewing, setIsRenewing] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState("Loading...");
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // --- ACCOUNT & PERMISSION STATE ---
  const [myAccountId, setMyAccountId] = useState(null);
  const [itwinPermissionsMap, setItwinPermissionsMap] = useState({});
  const [selectedITwinContext, setSelectedITwinContext] = useState({
    isExternal: false,
    realityDataLevel: REALITY_DATA_ACCESS.NO_PERMISSION,
    permissions: [],
  });

  // --- API DATA STATE ---
  const [filterRealityOnly, setFilterRealityOnly] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [realityDataList, setRealityDataList] = useState([]);
  const [selectedRealityDataId, setSelectedRealityDataId] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // --- UPLOAD STATE ---
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [uploadLogs, setUploadLogs] = useState([]); // Real-time logging of upload steps

  // --- PROJECT CREATION STATE ---
  const [projectCreateLoading, setProjectCreateLoading] = useState(false);
  const [projectCreateError, setProjectCreateError] = useState(null);
  const [projectCreateSuccess, setProjectCreateSuccess] = useState(null);

  // --- OAUTH FLOW HANDLERS ---
  const login = () => {
    initiateLiveLogin().catch((err) => {
      setAuthError(`OAuth initialization error: ${err.message}`);
    });
  };

  const logout = () => {
    localStorage.removeItem("client_access_token");
    localStorage.removeItem("client_token_expiry");
    localStorage.removeItem("client_refresh_token");
    setToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);
    setUserProfile(null);
    setProjects([]);
    setRealityDataList([]);
    setSelectedProjectId("");
    setSelectedRealityDataId("");
    setMyAccountId(null);
    setItwinPermissionsMap({});
    setSelectedITwinContext({
      isExternal: false,
      realityDataLevel: REALITY_DATA_ACCESS.NO_PERMISSION,
      permissions: [],
    });
    resetUploadState();
  };

  const reauthenticate = async () => {
    try {
      const url = await getLiveLoginUrl();
      window.location.href = url;
    } catch (err) {
      setAuthError(`Could not start re-authentication: ${err.message}`);
    }
  };

  const resetUploadState = () => {
    setUploadLoading(false);
    setUploadProgress(0);
    setUploadSuccess(null);
    setUploadError(null);
    setUploadLogs([]);
  };

  // --- API METHODS ---

  // Load Primary Organization Account
  const loadMyPrimaryAccount = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await fetch(`${AUTH_CONFIG.apiBase}/itwins/myprimaryaccount`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json",
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      const accountId = data.iTwin?.id || null;
      setMyAccountId(accountId);
      return accountId;
    } catch (err) {
      console.error("Error fetching my primary account:", err);
      return null;
    }
  }, [token]);

  // Fetch Permissions for a specific iTwin
  const fetchPermissionsForITwin = useCallback(async (iTwinId, targetITwin = null) => {
    if (!token || !iTwinId) return null;

    try {
      const response = await fetch(
        `${AUTH_CONFIG.apiBase}/accesscontrol/itwins/${iTwinId}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.bentley.itwin-platform.v2+json",
          },
        }
      );

      const permissions = response.ok
        ? (await response.json()).permissions || []
        : [];

      const twinObj = targetITwin || projects.find((p) => p.id === iTwinId);
      const context = {
        ...evaluateUserITwinContext(twinObj, myAccountId, permissions),
        permissionsFetched: true,
      };

      setItwinPermissionsMap((prev) => ({
        ...prev,
        [iTwinId]: context,
      }));

      return context;
    } catch (err) {
      console.error(`Failed to fetch permissions for iTwin ${iTwinId}:`, err);
      return null;
    }
  }, [token, myAccountId, projects]);



  // Load iTwin Projects
  const loadProjects = useCallback(async () => {
    if (!token) return;
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${AUTH_CONFIG.apiBase}/itwins?subClass=Project`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json",
          Prefer: "return=representation"
        }
      });
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const rawTwins = data.iTwins || [];

      // Fetch full details for each iTwin to obtain iTwinAccountId
      const enrichedTwins = await Promise.all(
        rawTwins.map(async (twin) => {
          try {
            const detailRes = await fetch(`${AUTH_CONFIG.apiBase}/itwins/${twin.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.bentley.itwin-platform.v1+json"
              }
            });
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              if (detailData.iTwin) {
                return { ...twin, ...detailData.iTwin };
              }
            }
          } catch (e) {
            console.warn(`Could not fetch details for iTwin ${twin.id}:`, e);
          }
          return twin;
        })
      );

      setProjects(enrichedTwins);
    } catch (err) {
      console.error(err);
      setApiError(`Failed to retrieve iTwins: ${err.message}`);
    } finally {
      setApiLoading(false);
    }
  }, [token]);


  // Load Reality Data for the selected iTwin
  const loadRealityData = useCallback(async (iTwinId) => {
    if (!token || !iTwinId) return;
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${AUTH_CONFIG.apiBase}/reality-management/reality-data?iTwinId=${iTwinId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json",
          Prefer: "return=representation"
        }
      });
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const list = data.realityData || [];
      setRealityDataList(list);
      if (list.length > 0) {
        setSelectedRealityDataId(list[0].id);
      } else {
        setSelectedRealityDataId("");
      }
    } catch (err) {
      console.error(err);
      setApiError(`Failed to load Reality Data: ${err.message}`);
      setRealityDataList([]);
      setSelectedRealityDataId("");
    } finally {
      setApiLoading(false);
    }
  }, [token]);

  // Create a new iTwin project
  const createProject = async (projectData) => {
    if (!token) return false;
    setProjectCreateLoading(true);
    setProjectCreateError(null);
    setProjectCreateSuccess(null);

    try {
      const response = await fetch(`${AUTH_CONFIG.apiBase}/itwins`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          class: "Endeavor",
          subClass: projectData.subClass || "Project",
          type: projectData.type || "Construction Project",
          number: projectData.number,
          displayName: projectData.displayName,
          dataCenterLocation: projectData.dataCenterLocation || "East US",
          status: "Active"
        })
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error("You don't have the permission to create an iTwin. Please contact your administrator for access to an iTwin with the permission to create reality data.");
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const newId = data.iTwin?.id;

      setProjectCreateSuccess(`Live iTwin "${projectData.displayName}" provisioned successfully!`);
      await loadProjects();
      if (newId) {
        setSelectedProjectId(newId);
      }
      return true;
    } catch (err) {
      console.error(err);
      setProjectCreateError(err.message);
      return false;
    } finally {
      setProjectCreateLoading(false);
    }
  };

  // Create a new Reality Data instance
  const createRealityData = async (name, description = "", type = "LAS", rootDocument = undefined) => {
    if (!token || !selectedProjectId) {
      setUploadError("Please select a target iTwin first.");
      return null;
    }
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadLogs([`[INFO] Creating new Reality Data container "${name}"...`]);

    try {
      const response = await fetch(`${AUTH_CONFIG.apiBase}/reality-management/reality-data`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          iTwinId: selectedProjectId,
          displayName: name,
          description: description || "Uploaded scan via Reality Web Portal",
          type: type,
          ...(rootDocument && { rootDocument }),
          authoring: true
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const rId = data.realityData?.id;
      
      setUploadLogs(prev => [...prev, `[SUCCESS] Created Reality Data ID: ${rId}`]);
      await loadRealityData(selectedProjectId);
      setSelectedRealityDataId(rId);
      setUploadLoading(false);
      return rId;
    } catch (err) {
      console.error(err);
      setUploadError(`Failed to create Reality Data: ${err.message}`);
      setUploadLoading(false);
      return null;
    }
  };

  // Upload files to selected Reality Data
  const uploadFiles = async (realityDataId, files, iTwinId) => {
    if (!token || !realityDataId) {
      setUploadError("Missing token or selected Reality Data container.");
      return;
    }
    if (!iTwinId) {
      setUploadError("Missing required iTwinId parameter.");
      return;
    }
    if (!files || files.length === 0) {
      setUploadError("No files selected for upload.");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);
    setUploadLogs([`[INFO] Starting upload process for ${files.length} files...`]);

    const log = (msg) => setUploadLogs(prev => [...prev, msg]);

    try {
      // --- LIVE REAL UPLOAD FLOW ---
      log(`[INFO] Requesting Azure SAS write credentials from Reality Management API...`);
      const writeAccessUrl = `${AUTH_CONFIG.apiBase}/reality-management/reality-data/${realityDataId}/writeaccess?iTwinId=${iTwinId}`;

      const authRes = await fetch(writeAccessUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json"
        }
      });

      if (!authRes.ok) {
        throw new Error(`Write access unauthorized: ${authRes.status} ${authRes.statusText}`);
      }

      const authData = await authRes.json();
      const containerUrl = authData._links?.containerUrl?.href;
      if (!containerUrl) {
        throw new Error("API response did not return a valid Azure Blob containerUrl.");
      }

      log(`[SUCCESS] SAS Write Access granted. Note: Write SAS token is valid for exactly 1 hour. Uploads exceeding 1 hour require SAS key renewal.`);
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.relativePath || file.webkitRelativePath || file.name;
        // Strip any leading slashes to prevent malformed pathnames
        const cleanPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;

        log(`[INFO] Uploading file [${i + 1}/${files.length}]: ${cleanPath} (${(file.size / 1024).toFixed(1)} KB)...`);

        // Build the Azure Blob target URL
        const sasUrlObj = new URL(containerUrl);
        sasUrlObj.pathname = `${sasUrlObj.pathname}/${cleanPath}`;
        const uploadUrl = sasUrlObj.toString();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type || "application/octet-stream"
          },
          body: file
        });

        if (!uploadRes.ok) {
          throw new Error(`Azure upload failed for file ${cleanPath}: ${uploadRes.status}`);
        }

        log(`[SUCCESS] Uploaded ${cleanPath}`);
        const currentFileDoneProg = Math.floor(((i + 1) / files.length) * 100);
        setUploadProgress(currentFileDoneProg);
      }

      log(`[SUCCESS] All files successfully uploaded to storage.`);
      setUploadSuccess(`Successfully uploaded ${files.length} files onto the Reality Data container! Ready to finalize.`);
    } catch (err) {
      console.error(err);
      log(`[ERROR] ${err.message}`);
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Complete Authoring (equivalent to Step 3 - Commit Scan in PDF)
  const completeAuthoring = async (realityDataId, iTwinId) => {
    if (!token || !realityDataId) {
      setUploadError("Missing token or selected Reality Data container.");
      return false;
    }
    if (!iTwinId) {
      setUploadError("Missing required iTwinId parameter.");
      return false;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);
    
    // Append to existing logs
    setUploadLogs(prev => [...prev, `[INFO] Requesting to set authoring to false to complete integration...`]);

    const log = (msg) => setUploadLogs(prev => [...prev, msg]);

    try {
      log(`[INFO] Committing upload session (PATCH authoring: false)...`);
      
      const commitRes = await fetch(`${AUTH_CONFIG.apiBase}/reality-management/reality-data/${realityDataId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          authoring: false,
          iTwinId: iTwinId
        })
      });

      if (!commitRes.ok) {
        const errData = await commitRes.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Commit error ${commitRes.status}`);
      }

      log(`[SUCCESS] Reality Data authoring finalized (authoring = false).`);
      log(`[SUCCESS] Commit complete. Point cloud is fully registered and active!`);
      setUploadSuccess(`Reality Data container finalized and committed successfully (authoring: false)!`);
      return true;
    } catch (err) {
      console.error(err);
      log(`[ERROR] ${err.message}`);
      setUploadError(`Commit failed: ${err.message}`);
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  // Get Read SAS key & container URL (equivalent to requesting read access credentials)
  const getReadSasUrl = async (realityDataId, iTwinId) => {
    if (!token || !realityDataId) {
      throw new Error("Missing token or selected Reality Data container.");
    }
    if (!iTwinId) {
      throw new Error("Missing required iTwinId parameter.");
    }

    try {
      const readAccessUrl = `${AUTH_CONFIG.apiBase}/reality-management/reality-data/${realityDataId}/readaccess?iTwinId=${iTwinId}`;

      const response = await fetch(readAccessUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.bentley.itwin-platform.v1+json"
        }
      });

      if (!response.ok) {
        throw new Error(`Read access unauthorized: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const containerUrl = data._links?.containerUrl?.href;
      if (!containerUrl) {
        throw new Error("API response did not return a valid Azure Blob containerUrl.");
      }
      return containerUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // --- SIDE EFFECTS ---

  // Handle URL Callback for Authorization Code Flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state && !liveCallbackHandled) {
      liveCallbackHandled = true;
      setIsAuthenticating(true);
      handleLiveCallback(code, state)
        .then((tokenData) => {
          const expiryTime = Date.now() + tokenData.expiresIn * 1000;
          localStorage.setItem("client_access_token", tokenData.accessToken);
          localStorage.setItem("client_token_expiry", expiryTime.toString());
          setToken(tokenData.accessToken);
          setTokenExpiry(expiryTime);
          if (tokenData.refreshToken) {
            localStorage.setItem("client_refresh_token", tokenData.refreshToken);
            setRefreshToken(tokenData.refreshToken);
          }
          setAuthError(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error(err);
          setAuthError(err.message);
        })
        .finally(() => {
          setIsAuthenticating(false);
        });
    }
  }, []);

  // Handle Token Expiration on Load / Mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    // Avoid redirecting if we are currently handling an OAuth callback
    if (code && state) {
      return;
    }

    const savedToken = localStorage.getItem("client_access_token");
    const savedExpiry = localStorage.getItem("client_token_expiry");

    if (savedToken && savedExpiry) {
      const expiryTime = Number(savedExpiry);
      if (Date.now() >= expiryTime) {
        console.warn("Client session has expired. Redirecting to Bentley IMS for a new token...");
        logout();
        initiateLiveLogin().catch((err) => {
          setAuthError(`OAuth auto-login error: ${err.message}`);
        });
      }
    }
  }, []);

  // Update expiration timer countdown
  useEffect(() => {
    if (!token) {
      setTimeLeftStr("Not logged in");
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = tokenExpiry || Number(localStorage.getItem("client_token_expiry"));
      if (!expiry) {
        setTimeLeftStr("None");
        return;
      }
      const diff = expiry - now;
      if (diff <= 0) {
        setTimeLeftStr("Expired");
      } else {
        const totalSecs = Math.max(0, Math.floor(diff / 1000));
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeftStr(`${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [token, tokenExpiry]);

  // Background Token Auto-Renewal
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      const expiry = tokenExpiry || Number(localStorage.getItem("client_token_expiry"));
      if (!expiry) return;

      const timeLeft = expiry - now;
      if (timeLeft <= 5 * 60 * 1000) {
        if (!refreshToken) return;
        setIsRenewing(true);
        try {
          const tokenData = await refreshLiveToken(refreshToken);
          const nextExpiry = Date.now() + tokenData.expiresIn * 1000;
          localStorage.setItem("client_access_token", tokenData.accessToken);
          localStorage.setItem("client_token_expiry", nextExpiry.toString());
          setToken(tokenData.accessToken);
          setTokenExpiry(nextExpiry);
          if (tokenData.refreshToken) {
            localStorage.setItem("client_refresh_token", tokenData.refreshToken);
            setRefreshToken(tokenData.refreshToken);
          }
        } catch (err) {
          console.error("Renewal failed:", err);
          setAuthError(`Automatic session renewal failed: ${err.message}. Please sign in again.`);
        } finally {
          setIsRenewing(false);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [token, tokenExpiry, refreshToken]);

  // Load User Profile, Primary Account & Projects on token change
  useEffect(() => {
    if (token) {
      setUserProfile(getUserProfile(token));
      loadMyPrimaryAccount();
      loadProjects();
    } else {
      setUserProfile(null);
    }
  }, [token, loadMyPrimaryAccount, loadProjects]);

  // Pre-fill initial external/internal context for all projects as soon as projects & myAccountId load
  useEffect(() => {
    if (projects.length > 0 && myAccountId) {
      setItwinPermissionsMap((prev) => {
        const nextMap = { ...prev };
        let updated = false;
        projects.forEach((proj) => {
          const iTwinAccId = proj?.iTwinAccountId || proj?.accountId || proj?.parentId;
          const isExternal = Boolean(
            myAccountId && iTwinAccId && iTwinAccId !== myAccountId
          );

          if (!nextMap[proj.id]) {
            nextMap[proj.id] = {
              isExternal,
              realityDataLevel: REALITY_DATA_ACCESS.NO_PERMISSION,
              permissions: [],
              permissionsFetched: false,
            };
            updated = true;
          } else if (nextMap[proj.id].isExternal !== isExternal) {
            nextMap[proj.id] = { ...nextMap[proj.id], isExternal };
            updated = true;
          }
        });
        return updated ? nextMap : prev;
      });
    }
  }, [projects, myAccountId]);

  // Background fetch permissions for projects listed on screen (throttled to avoid hitting RBAC rate limits)
  useEffect(() => {
    if (!token || projects.length === 0 || !myAccountId) return;

    let isMounted = true;
    const pendingProjects = projects.filter(
      (proj) => !itwinPermissionsMap[proj.id]?.permissionsFetched
    );

    if (pendingProjects.length === 0) return;

    const fetchThrottledPermissions = async () => {
      for (const proj of pendingProjects) {
        if (!isMounted) break;
        await fetchPermissionsForITwin(proj.id, proj);
        // Throttle 150ms delay between consecutive RBAC permission calls
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    };

    fetchThrottledPermissions();

    return () => {
      isMounted = false;
    };
  }, [token, projects, myAccountId, fetchPermissionsForITwin, itwinPermissionsMap]);

  // Load reality data and fetch permissions automatically when active project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadRealityData(selectedProjectId);
      fetchPermissionsForITwin(selectedProjectId).then((ctx) => {
        if (ctx) setSelectedITwinContext(ctx);
      });
    } else {
      setRealityDataList([]);
      setSelectedRealityDataId("");
      setSelectedITwinContext({
        isExternal: false,
        realityDataLevel: REALITY_DATA_ACCESS.NO_PERMISSION,
        permissions: [],
      });
    }
  }, [selectedProjectId, loadRealityData, fetchPermissionsForITwin]);

  return {
    // Auth State & Actions
    token,
    timeLeftStr,
    isRenewing,
    userProfile,
    authError,
    isAuthenticating,
    login,
    logout,
    reauthenticate,
    setAuthError,

    // Account & Permission State & Actions
    myAccountId,
    itwinPermissionsMap,
    selectedITwinContext,
    fetchPermissionsForITwin,
    loadMyPrimaryAccount,
    filterRealityOnly,
    setFilterRealityOnly,


    // API State & Actions
    projects,
    selectedProjectId,
    setSelectedProjectId,
    realityDataList,
    selectedRealityDataId,
    setSelectedRealityDataId,
    apiLoading,
    apiError,
    loadProjects,
    loadRealityData,
    createRealityData,
    createProject,
    projectCreateLoading,
    projectCreateError,
    projectCreateSuccess,
    setProjectCreateError,
    setProjectCreateSuccess,

    // Upload & Commit Actions
    uploadLoading,
    uploadSuccess,
    uploadError,
    uploadProgress,
    uploadLogs,
    uploadFiles,
    completeAuthoring,
    getReadSasUrl,
    resetUploadState
  };
}


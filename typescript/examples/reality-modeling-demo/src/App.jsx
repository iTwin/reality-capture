import { useState, useEffect, useRef } from "react";
import useBentleyClient from "./useBentleyClient";
import "./App.css";

// --- URL ROUTING HELPERS ---
const parseHashRoute = () => {
  const hash = window.location.hash || "#/step/0";
  const [pathPart, queryPart] = hash.split("?");
  
  let step = 0;
  if (pathPart.includes("/step/4")) {
    step = 4;
  } else if (pathPart.includes("/step/3")) {
    step = 3;
  } else if (pathPart.includes("/step/2")) {
    step = 2;
  } else if (pathPart.includes("/step/1")) {
    step = 1;
  } else if (pathPart.includes("/step/0")) {
    step = 0;
  }
  
  const params = new URLSearchParams(queryPart || "");
  const projectId = params.get("project") || "";
  const rdId = params.get("rd") || "";
  
  return { step, projectId, rdId };
};

const updateHashRoute = (step, projectId, rdId) => {
  let newHash = `#/step/${step}`;
  const params = new URLSearchParams();
  if (projectId) {
    params.set("project", projectId);
  }
  if (rdId) {
    params.set("rd", rdId);
  }
  const queryStr = params.toString();
  if (queryStr) {
    newHash += `?${queryStr}`;
  }
  window.location.hash = newHash;
};

export default function App() {
  const {
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
  } = useBentleyClient();

  const [step, setStep] = useState(() => parseHashRoute().step);

  // Initialize selected project and reality data from URL hash on mount
  useEffect(() => {
    const { step: routeStep, projectId: routeProjId, rdId: routeRdId } = parseHashRoute();
    if (routeStep !== step) {
      setStep(routeStep);
    }
    if (routeProjId) {
      setSelectedProjectId(routeProjId);
    }
    if (routeRdId) {
      setSelectedRealityDataId(routeRdId);
    }
  }, []);

  // Listen for hash changes (browser back/forward or manual edits)
  useEffect(() => {
    const handleHashChange = () => {
      const { step: routeStep, projectId: routeProjId, rdId: routeRdId } = parseHashRoute();
      
      setStep(routeStep);
      
      if (routeProjId && routeProjId !== selectedProjectId) {
        setSelectedProjectId(routeProjId);
      }
      
      if (routeRdId && routeRdId !== selectedRealityDataId) {
        setSelectedRealityDataId(routeRdId);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [selectedProjectId, selectedRealityDataId, setSelectedProjectId, setSelectedRealityDataId]);

  // Sync state changes back to URL hash
  useEffect(() => {
    const currentRoute = parseHashRoute();
    if (
      currentRoute.step !== step ||
      currentRoute.projectId !== selectedProjectId ||
      currentRoute.rdId !== selectedRealityDataId
    ) {
      updateHashRoute(step, selectedProjectId, selectedRealityDataId);
    }
  }, [step, selectedProjectId, selectedRealityDataId]);

  // Redirect to Step 0 if on later steps with no selected project
  useEffect(() => {
    if (step > 0 && !selectedProjectId) {
      setStep(0);
    }
  }, [step, selectedProjectId]);

  // Redirect to Step 1 if on steps 2 or 3 with no selected reality data
  useEffect(() => {
    if (step > 1 && !selectedRealityDataId) {
      setStep(1);
    }
  }, [step, selectedRealityDataId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [newProject, setNewProject] = useState({ displayName: "", number: "", dataCenterLocation: "East US" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    const displayName = newProject.displayName.trim();
    if (!displayName) {
      alert("iTwin Name is required.");
      return;
    }

    // Auto-generate code number from display name
    const slug = displayName.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
    const autoNumber = `REALITY-${slug}`;

    // Detect conflict in the existing list of iTwins (projects)
    const nameConflict = projects.some(p => p.displayName && p.displayName.trim().toLowerCase() === displayName.toLowerCase());
    const numberConflict = projects.some(p => p.number && p.number.trim().toLowerCase() === autoNumber.toLowerCase());

    if (nameConflict || numberConflict) {
      setProjectCreateError(`Conflict detected: An iTwin with the name "${displayName}" or code "${autoNumber}" already exists.`);
      return;
    }

    const success = await createProject({
      ...newProject,
      displayName,
      number: autoNumber
    });

    if (success) {
      setNewProject({ displayName: "", number: "", dataCenterLocation: "East US" });
      setIsCreateModalOpen(false);
      setTimeout(() => {
        if (setProjectCreateSuccess) setProjectCreateSuccess(null);
      }, 5000);
    }
  };
  const [newRdName, setNewRealityDataName] = useState("REALITY-Captured-Images");
  const [newRdDesc, setNewRealityDataDesc] = useState("Direct ContextCapture image collection metadata.");
  const [newRdType, setNewRealityDataType] = useState("CCImageCollection");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const consoleEndRef = useRef(null);

  // Auto scroll terminal logs to bottom on update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [uploadLogs]);

  // Set default Reality Data name when project changes
  useEffect(() => {
    if (selectedProjectId) {
      const activeProj = projects.find(p => p.id === selectedProjectId);
      if (activeProj) {
        const randNum = Math.floor(100 + Math.random() * 900);
        const projNum = activeProj.number || randNum.toString();
        // Remove duplicate "REALITY-" prefix if it is already there (case-insensitive)
        const cleanProjNum = projNum.toUpperCase().startsWith("REALITY-")
          ? projNum.substring(8)
          : projNum;
        setNewRealityDataName(`REALITY-${cleanProjNum}-Images`);
      }
    }
  }, [selectedProjectId, projects]);

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const activeRealityData = realityDataList.find((r) => r.id === selectedRealityDataId);

  // Search filter
  const filteredProjects = projects.filter(
    (p) =>
      (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.number && p.number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- GALLERY STATES AND ACTIONS (STEP 4) ---
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);
  const [blobsList, setBlobsList] = useState([]);
  const [readSasUrl, setReadSasUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const loadGallery = async () => {
    if (!selectedRealityDataId) return;
    setGalleryLoading(true);
    setGalleryError(null);
    setSelectedImage(null);
    try {
      const containerUrl = await getReadSasUrl(selectedRealityDataId, selectedProjectId);
      setReadSasUrl(containerUrl);

      // List blobs using REST API
      const urlObj = new URL(containerUrl);
      urlObj.searchParams.set("restype", "container");
      urlObj.searchParams.set("comp", "list");
      
      const res = await fetch(urlObj.toString());
      if (!res.ok) {
        throw new Error(`Failed to list blobs from storage container: ${res.status}`);
      }
      
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      const blobNodes = xmlDoc.getElementsByTagName("Blob");
      const blobs = [];
      for (let i = 0; i < blobNodes.length; i++) {
        const nameNode = blobNodes[i].getElementsByTagName("Name")[0];
        if (nameNode) {
          blobs.push(nameNode.textContent);
        }
      }
      setBlobsList(blobs);
    } catch (err) {
      console.error(err);
      setGalleryError(err.message || "Failed to load image gallery.");
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      loadGallery();
    }
  }, [step, selectedRealityDataId]);

  const getBlobUrl = (blobName) => {
    if (!readSasUrl) return "";
    const urlObj = new URL(readSasUrl);
    urlObj.pathname = `${urlObj.pathname}/${blobName}`;
    return urlObj.toString();
  };

  const getFullResBlobName = (thumbName) => {
    if (thumbName.startsWith(".thumbnails/content/")) {
      // Strip prefix
      let name = thumbName.substring(".thumbnails/content/".length);
      // Strip suffix .webp
      if (name.endsWith(".webp")) {
        name = name.substring(0, name.length - ".webp".length);
      }
      // Reconstruct original extension by replacing the last underscore with a dot (e.g. pic_jpg -> pic.jpg)
      const lastUnderscoreIdx = name.lastIndexOf("_");
      if (lastUnderscoreIdx !== -1) {
        name = name.substring(0, lastUnderscoreIdx) + "." + name.substring(lastUnderscoreIdx + 1);
      }
      return name;
    }
    return thumbName;
  };

  const thumbnailBlobs = blobsList.filter(b => b.startsWith(".thumbnails/content/") && b.endsWith(".webp"));
  const hasThumbnails = thumbnailBlobs.length > 0;
  const displayBlobs = hasThumbnails 
    ? thumbnailBlobs 
    : blobsList.filter(b => (b.endsWith(".jpg") || b.endsWith(".jpeg") || b.endsWith(".png")) && !b.startsWith(".thumbnails/"));

  // --- DRAG & DROP HANDLERS ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.items) {
      const files = [];
      const traverse = async (entry) => {
        if (entry.isFile) {
          const file = await new Promise((resolve) => entry.file(resolve));
          // Attach relative path starting after the dropped folder
          file.relativePath = entry.fullPath.startsWith("/") ? entry.fullPath.substring(1) : entry.fullPath;
          files.push(file);
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          let allEntries = [];
          const readAllEntries = async () => {
            const entries = await new Promise((resolve) => dirReader.readEntries(resolve));
            if (entries.length > 0) {
              allEntries = allEntries.concat(entries);
              await readAllEntries();
            }
          };
          await readAllEntries();
          for (const childEntry of allEntries) {
            await traverse(childEntry);
          }
        }
      };

      const promises = [];
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(traverse(entry));
          }
        }
      }
      await Promise.all(promises);
      if (files.length > 0) {
        setSelectedFiles(files);
        resetUploadState();
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      resetUploadState();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(Array.from(e.target.files));
      resetUploadState();
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // --- ACTIONS ---
  const handleCreateRd = async (e) => {
    e.preventDefault();
    if (!newRdName) return;
    const rId = await createRealityData(newRdName, newRdDesc, newRdType);
    if (rId) {
      setNewRealityDataName(`REALITY-Cloud-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedRealityDataId) return;
    await uploadFiles(selectedRealityDataId, selectedFiles, selectedProjectId);
  };

  const handleBackToStep0 = () => {
    setStep(0);
    resetUploadState();
    setSelectedFiles([]);
  };

  const handleSelectProject = (projId) => {
    setSelectedProjectId(projId);
    setStep(1);
  };

  // --- RENDERING AUTH LOADER ---
  if (isAuthenticating) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel fade-in">
          <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 16px" }}></div>
          <h2>Securing Client Token</h2>
          <p className="login-subtitle">Exchanging PKCE authorization code with Bentley IMS...</p>
        </div>
      </div>
    );
  }

  // --- RENDERING LOGIN VIEW ---
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel fade-in">
          <div className="login-icon">RM</div>
          <h1 className="login-title">Reality Client Portal</h1>
          <p className="login-subtitle">Direct Upload Portal for Bentley iTwin Platform</p>
          {authError && (
            <div className="alert-box alert-warning">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={login} style={{ width: "100%", justifyContent: "center" }}>
            🔑 Log In with Bentley IMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="nav-logo">
          <div className="logo-icon">RM</div>
          <div className="logo-text">Reality Management</div>
          <div className="logo-tag" style={{ color: "#e0af68", borderColor: "rgba(224, 175, 104, 0.3)", background: "rgba(224, 175, 104, 0.1)" }}>
            Uploader
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li>
              <div
                className={`nav-link ${step === 0 ? "active" : ""}`}
                onClick={() => setStep(0)}
              >
                <span>📁</span> Step 0: Select iTwin
              </div>
            </li>
            <li>
              <button
                className={`nav-link ${step === 1 ? "active" : ""}`}
                onClick={() => selectedProjectId && setStep(1)}
                disabled={!selectedProjectId}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                <span>☁️</span> Step 1: Create Reality Data
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${step === 2 ? "active" : ""}`}
                onClick={() => selectedRealityDataId && setStep(2)}
                disabled={!selectedRealityDataId}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                <span>🔑</span> Step 2: Upload
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${step === 3 ? "active" : ""}`}
                onClick={() => selectedRealityDataId && setStep(3)}
                disabled={!selectedRealityDataId}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                <span>✅</span> Step 3: Complete
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${step === 4 ? "active" : ""}`}
                onClick={() => selectedRealityDataId && setStep(4)}
                disabled={!selectedRealityDataId}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                <span>🖼️</span> Step 4: Explore Gallery
              </button>
            </li>
          </ul>
        </nav>

        {/* AUTH/USER STATUS WIDGET */}
        {userProfile && (
          <div className="token-status-widget">
            <div className="user-info" style={{ marginBottom: 12 }}>
              <div className="user-avatar" style={{ background: "#e0af68" }}>
                {userProfile.name.charAt(0)}
              </div>
              <div className="user-details">
                <span className="user-name">{userProfile.name}</span>
                <span className="user-role">{userProfile.role}</span>
              </div>
            </div>
            
            <div className="token-status-header">
              <span>Bentley Session:</span>
              <span className={`token-status-badge ${isRenewing ? "renewing" : "active"}`}>
                {isRenewing ? "Renewing..." : "Authorized"}
              </span>
            </div>
            
            <div className="token-lifetime">
              <span>Expires in:</span>
              <span className="token-lifetime-value">{timeLeftStr}</span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={logout} style={{ marginTop: 12 }}>
              🚪 Log Out
            </button>
          </div>
        )}
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="main-content">
        
        {/* PROGRESS STEP HEADER */}
        <header className="wizard-header fade-in">
          <div>
            <h1 className="page-title">Direct Upload Portal</h1>
            <p className="page-description">Streamline point cloud uploads directly from your browser to iTwin.</p>
          </div>
          
          <div className="wizard-steps">
            <div className={`wizard-step ${step === 0 ? "active" : step > 0 ? "completed" : ""}`}>
              <div className="wizard-number">0</div>
              <span>Select iTwin</span>
            </div>
            <span className="wizard-separator">→</span>
            <div className={`wizard-step ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
              <div className="wizard-number">1</div>
              <span>Create Reality Data</span>
            </div>
            <span className="wizard-separator">→</span>
            <div className={`wizard-step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
              <div className="wizard-number">2</div>
              <span>Upload</span>
            </div>
            <span className="wizard-separator">→</span>
            <div className={`wizard-step ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}>
              <div className="wizard-number">3</div>
              <span>Complete</span>
            </div>
            <span className="wizard-separator">→</span>
            <div className={`wizard-step ${step === 4 ? "active" : ""}`}>
              <div className="wizard-number">4</div>
              <span>Explore</span>
            </div>
          </div>
        </header>

        {/* --- STEP 0: CHOOSE ITWIN --- */}
        {step === 0 && (
          <section className="fade-in">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Top Controls: Search and Refresh */}
              <div className="search-controls" style={{ marginBottom: 0 }}>
                <div className="search-input-wrapper" style={{ flex: 1 }}>
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search iTwins..."
                    className="form-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="project-search-input"
                  />
                </div>
                <button className="btn btn-secondary" onClick={loadProjects} disabled={apiLoading}>
                  {apiLoading ? <div className="spinner"></div> : "🔄 Refresh List"}
                </button>
              </div>

              {apiError && (
                <div className="alert-box alert-warning" style={{ margin: 0 }}>
                  <span>⚠️</span>
                  <span>{apiError}</span>
                </div>
              )}

              {projectCreateSuccess && (
                <div className="alert-box alert-success" style={{ margin: 0 }}>
                  <span>✅</span>
                  <span>{projectCreateSuccess}</span>
                </div>
              )}

              <div className="alert-box alert-info" style={{ margin: 0 }}>
                <span>ℹ️</span>
                <span>For the onboarding demo, the iTwin listing is filtered to display iTwins with the prefix <strong>"REALITY-"</strong> for development and testing consistency.</span>
              </div>

              {apiLoading && projects.length === 0 ? (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                  <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 20px" }}></div>
                  <p style={{ color: "var(--text-secondary)" }}>Querying Bentley iTwins API...</p>
                </div>
              ) : (
                <div className="project-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                  
                  {/* Special 'Create New iTwin' card/tile */}
                  <div
                    className="glass-panel project-card create-new-tile"
                    onClick={() => {
                      setProjectCreateError(null);
                      setProjectCreateSuccess(null);
                      setIsCreateModalOpen(true);
                    }}
                    style={{
                      border: "1px dashed rgba(224, 175, 104, 0.4)",
                      background: "rgba(224, 175, 104, 0.03)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "160px",
                      textAlign: "center"
                    }}
                  >
                    <span style={{ fontSize: "2.5rem", marginBottom: "12px" }}>➕</span>
                    <h3 style={{ color: "#e0af68", margin: 0, fontSize: "1.1rem" }}>Create New iTwin</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Provision a new Bentley iTwin
                    </p>
                  </div>

                  {filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`glass-panel project-card ${proj.id === selectedProjectId ? "selected" : ""}`}
                      onClick={() => handleSelectProject(proj.id)}
                      id={`project-card-${proj.id}`}
                      style={{ minHeight: "160px" }}
                    >
                      <div className="project-meta-header">
                        <span className="project-folder-icon">📁</span>
                        <span className="project-number-badge">{proj.number || "No ID"}</span>
                      </div>
                      <h3 className="project-card-title">{proj.displayName || "Unnamed iTwin"}</h3>
                      <p className="project-card-desc">
                        Location: {proj.dataCenterLocation || "East US"}<br />
                        Status: <span style={{ color: "var(--color-success)" }}>● {proj.status || "Active"}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- CREATE ITWIN MODAL DIALOG --- */}
            {isCreateModalOpen && (
              <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                    &times;
                  </button>
                  <h3 style={{ marginBottom: "16px", color: "#fff", fontSize: "1.4rem" }}>Provision New iTwin</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                    Enter details to provision a brand new Bentley iTwin container.
                  </p>

                  {projectCreateError && (
                    <div className="alert-box alert-warning" style={{ padding: "12px", marginBottom: "16px", fontSize: "0.85rem", display: "flex", flexDirection: "row", gap: "8px", alignItems: "flex-start", lineHeight: "1.4" }}>
                      <span>⚠️</span>
                      <span style={{ flex: 1, whiteSpace: "pre-line" }}>{projectCreateError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateProjectSubmit}>
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                      <label className="form-label" htmlFor="p-name">iTwin Name</label>
                      <input
                        id="p-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Construction iTwin Alpha"
                        value={newProject.displayName}
                        onChange={(e) => setNewProject(p => ({ ...p, displayName: e.target.value }))}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: "20px" }}>
                      <label className="form-label" htmlFor="p-datacenter">Datacenter Location</label>
                      <select
                        id="p-datacenter"
                        className="form-select"
                        style={{ width: "100%", padding: "10px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#fff", outline: "none" }}
                        value={newProject.dataCenterLocation || "East US"}
                        onChange={(e) => setNewProject(p => ({ ...p, dataCenterLocation: e.target.value }))}
                      >
                        <option value="East US">East US</option>
                        <option value="North Europe">North Europe</option>
                        <option value="Southeast Asia">Southeast Asia</option>
                        <option value="Australia East">Australia East</option>
                        <option value="UK South">UK South</option>
                        <option value="Canada Central">Canada Central</option>
                        <option value="Central India">Central India</option>
                        <option value="Japan East">Japan East</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={projectCreateLoading}>
                        {projectCreateLoading ? "Provisioning..." : "Create iTwin"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- STEP 1: CREATE REALITY DATA --- */}
        {step === 1 && (
          <section className="fade-in">
            {/* BACK BAR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleBackToStep0} id="back-to-step0-btn">
                ⬅️ Select Different iTwin
              </button>
              {activeProject && (
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Target iTwin: <strong style={{ color: "#fff" }}>{activeProject.displayName}</strong> <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>({activeProject.dataCenterLocation || "East US"})</span>
                </span>
              )}
            </div>

            <div className="step2-layout" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {/* LEFT COLUMN: CREATE NEW REALITY DATA CONTAINER */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 16, color: "#fff" }}>
                  Create Reality Data
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                  Provision a new Reality Data container in the selected iTwin project, registering your intent to upload and enabling write/edit (authoring) capabilities. Learn more about{" "}
                  <a href="https://developer.bentley.com/apis/reality-management/rm-rd-details/" target="_blank" rel="noopener noreferrer" className="doc-link">
                    supported reality data types ↗️
                  </a>.
                </p>

                <form onSubmit={handleCreateRd}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rd-name-input">Display Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRdName}
                      onChange={(e) => setNewRealityDataName(e.target.value)}
                      required
                      id="rd-name-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rd-desc-input">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRdDesc}
                      onChange={(e) => setNewRealityDataDesc(e.target.value)}
                      id="rd-desc-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rd-type-select">Reality Data Type</label>
                    <select
                      className="form-select"
                      value={newRdType}
                      onChange={(e) => setNewRealityDataType(e.target.value)}
                      id="rd-type-select"
                    >
                      <option value="CCImageCollection">CCImageCollection (ContextCapture Images)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={uploadLoading || apiLoading}
                    style={{ width: "100%", justifyContent: "center" }}
                    id="create-rd-btn"
                  >
                    {uploadLoading ? <div className="spinner"></div> : "Create Reality Data"}
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: EXISTING CONTAINERS LIST */}
              <div className="glass-panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 16, color: "#fff" }}>
                  Or Select Existing Reality Data
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                  Select an existing container in this project if you don't want to create a new one.
                </p>

                {apiLoading ? (
                  <div style={{ padding: "40px 0", textAlign: "center", flex: 1 }}>
                    <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Loading containers...</p>
                  </div>
                ) : realityDataList.length === 0 ? (
                  <div style={{ padding: "24px 0", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: 8, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: 8 }}>☁️</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      No Reality Data containers in this iTwin.
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto", flex: 1 }}>
                    {realityDataList.map((rd) => (
                      <div
                        key={rd.id}
                        className={`nav-link ${rd.id === selectedRealityDataId ? "active" : ""}`}
                        onClick={() => {
                          setSelectedRealityDataId(rd.id);
                          resetUploadState();
                        }}
                        style={{
                          border: "1px solid var(--border-color)",
                          background: rd.id === selectedRealityDataId ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.01)",
                          justifyContent: "space-between",
                          padding: "12px 16px"
                        }}
                        id={`rd-item-${rd.id}`}
                      >
                        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                          <strong style={{ color: "#fff", fontSize: "0.9rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {rd.displayName}
                          </strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--mono-font)" }}>
                            ID: {rd.id} | Type: {rd.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOOTER */}
            {selectedRealityDataId && (
              <div className="glass-panel" style={{ marginTop: 24, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Selected Container:</span>
                  <strong style={{ display: "block", color: "var(--color-primary)", fontSize: "1.05rem" }}>
                    {activeRealityData?.displayName || "Selected Reality Data"}
                  </strong>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  style={{ padding: "12px 24px" }}
                >
                  Next Step: Upload ➔
                </button>
              </div>
            )}
          </section>
        )}

        {/* --- STEP 2: REQUEST SAS KEY & UPLOAD --- */}
        {step === 2 && (
          <section className="fade-in">
            {/* BACK BAR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)} id="back-to-step1-btn">
                ⬅️ Back to Reality Data
              </button>
              {activeRealityData && (
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Target Container: <strong style={{ color: "#fff" }}>{activeRealityData.displayName}</strong> <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>({activeRealityData.id})</span>
                </span>
              )}
            </div>

            <div className="step2-layout" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
              {/* LEFT COLUMN: DIRECT FILE UPLOAD AND CONSOLE LOGS */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="glass-panel" style={{ padding: 24 }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 16, color: "#fff" }}>
                    Request SAS Key & Upload Files
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                    Request a temporary Shared Access Signature (SAS) write token from the platform, and stream files directly to secure cloud storage via <code>PUT BlockBlob</code>. Refer to the documentation on{" "}
                    <a href="https://developer.bentley.com/apis/reality-management/rm-rd-details/" target="_blank" rel="noopener noreferrer" className="doc-link">
                      supported reality data types ↗️
                    </a> for formatting.
                  </p>

                  {/* DROPZONE AREA */}
                  <div
                    className={`dropzone-container ${dragActive ? "drag-active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={onButtonClick}
                    id="file-dropzone"
                    style={{ pointerEvents: uploadLoading || uploadSuccess ? "none" : "auto", opacity: uploadLoading || uploadSuccess ? 0.6 : 1 }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      id="file-input-element"
                      disabled={uploadLoading || uploadSuccess}
                    />
                    <span className="dropzone-icon">☁️</span>
                    <span className="dropzone-text">Drag Files Here</span>
                    <span className="dropzone-subtext">or click to browse your disk (supports .jpg, .jpeg, .las, .laz, .json)</span>
                  </div>

                  {/* SELECTED FILES LIST */}
                  {selectedFiles.length > 0 && (
                    <div className="selected-files-card fade-in" style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Prepared Files ({selectedFiles.length})</span>
                        {!uploadLoading && !uploadSuccess && (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: "2px 6px" }}
                            onClick={() => setSelectedFiles([])}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 120, overflowY: "auto" }}>
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="file-row">
                            <span className="file-name">{file.relativePath || file.webkitRelativePath || file.name}</span>
                            <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!uploadSuccess && (
                    <div style={{ marginTop: 20 }}>
                      {selectedFiles.length === 0 && (
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12, display: "flex", gap: "6px", alignItems: "center" }}>
                          <span>ℹ️</span> Please drag & drop or select files above to enable the upload button.
                        </p>
                      )}
                      <button
                        className="btn btn-primary"
                        onClick={handleStartUpload}
                        disabled={uploadLoading || !selectedRealityDataId || selectedFiles.length === 0}
                        style={{ width: "100%", justifyContent: "center", opacity: selectedFiles.length === 0 ? 0.5 : 1 }}
                        id="start-upload-btn"
                      >
                        {uploadLoading ? (
                          <>
                            <div className="spinner"></div> Requesting SAS & Uploading...
                          </>
                        ) : (
                          "🔑 Request SAS Key & Upload"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: PROGRESS AND API CONSOLE */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {(uploadLoading || uploadLogs.length > 0) && (
                  <div className="progress-panel fade-in" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: 12 }}>
                      Upload Status & API Console
                    </h3>

                    <div className="progress-header">
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {uploadProgress < 100 ? "Syncing points with Azure container..." : "Upload successfully completed!"}
                      </span>
                      <strong style={{ fontFamily: "var(--mono-font)", color: "var(--neon-cyan)" }}>
                        {uploadProgress}%
                      </strong>
                    </div>

                    <div className="progress-bar-container" style={{ marginBottom: 16 }}>
                      <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>

                    {uploadSuccess && (
                      <div className="alert-box alert-success" style={{ padding: 12, fontSize: "0.85rem", marginBottom: 12 }}>
                        <span>🟢</span>
                        <span>{uploadSuccess}</span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="alert-box alert-danger" style={{ padding: 12, fontSize: "0.85rem", marginBottom: 12 }}>
                        <span>🔴</span>
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* LIVE COMMAND CONSOLE */}
                    <div className="console-title">
                      <span>💻</span> Live API Adapter Console
                    </div>
                    <div className="console-box" id="console-logs-box" style={{ flex: 1, minHeight: 200 }}>
                      {uploadLogs.map((log, idx) => {
                        let lineClass = "log-line-info";
                        if (log.startsWith("[SUCCESS]")) lineClass = "log-line-success";
                        else if (log.startsWith("[WARNING]")) lineClass = "log-line-warning";
                        else if (log.startsWith("[ERROR]")) lineClass = "log-line-error";
                        else if (log.startsWith("[SIMULATION]")) lineClass = "log-line-simulation";

                        return (
                          <div key={idx} className={`log-line ${lineClass}`}>
                            {log}
                          </div>
                        );
                      })}
                      <div ref={consoleEndRef} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOOTER */}
            {uploadSuccess && (
              <div className="glass-panel" style={{ marginTop: 24, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Files uploaded successfully!</span>
                  <strong style={{ display: "block", color: "var(--color-success)", fontSize: "1.05rem" }}>
                    Proceed to Step 3 to commit.
                  </strong>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setStep(3);
                  }}
                  style={{ padding: "12px 24px" }}
                >
                  Next Step: Complete ➔
                </button>
              </div>
            )}
          </section>
        )}

        {/* --- STEP 3: SET AUTHORING TO FALSE AND COMPLETE --- */}
        {step === 3 && (
          <section className="fade-in">
            {/* BACK BAR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(2)} disabled={uploadLoading}>
                ⬅️ Back to Upload Files
              </button>
              {activeRealityData && (
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Target Container: <strong style={{ color: "#fff" }}>{activeRealityData.displayName}</strong>
                </span>
              )}
            </div>

            <div className="step2-layout" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
              {/* LEFT COLUMN: COMMIT ACTION */}
              <div className="glass-panel" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 16, color: "#fff" }}>
                    Mark Upload as Complete
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                    This optional step updates the recommended <code>authoring</code> flag on the container to indicate that uploading has ended.
                  </p>

                  <div className="alert-box alert-info" style={{ marginBottom: 24 }}>
                    <span>ℹ️</span>
                    <div>
                      <span style={{ fontWeight: 600 }}>About the 'authoring' flag</span>
                      <p style={{ fontSize: "0.8rem", margin: "4px 0 0 0", color: "var(--text-secondary)" }}>
                        When a container is first created, it has <code>authoring: true</code>. Setting this flag to <code>false</code> is a recommended way to signal that the uploader is done, which updates the state in the UI and helps downstream systems know the data is ready.
                      </p>
                    </div>
                  </div>

                  {/* SESSION METADATA REVIEW */}
                  <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 16, marginBottom: 24 }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff", marginBottom: 12 }}>Onboarding Metadata Summary</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>iTwin Project:</span>
                        <strong style={{ color: "#fff" }}>{activeProject?.displayName}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Reality Data:</span>
                        <strong style={{ color: "#fff" }}>{activeRealityData?.displayName}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Reality Data ID:</span>
                        <code style={{ color: "var(--neon-cyan)" }}>{activeRealityData?.id}</code>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Uploaded Files:</span>
                        <span style={{ color: "#fff" }}>{selectedFiles.length} files</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Upload Flag:</span>
                        {uploadSuccess && uploadSuccess.includes("finalized") ? (
                          <span style={{ color: "var(--color-success)", fontWeight: 600 }}>authoring: false (Done)</span>
                        ) : (
                          <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>authoring: true (Uploading)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {uploadSuccess && uploadSuccess.includes("finalized") ? (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                    <h3 style={{ color: "var(--color-success)", marginBottom: 8 }}>Upload Flag Updated!</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                      The onboarding integration walkthrough is now complete.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <button className="btn btn-primary" onClick={() => setStep(4)} style={{ width: "100%", justifyContent: "center" }}>
                        🖼️ Explore Gallery (Optional)
                      </button>
                      <button className="btn btn-secondary" onClick={() => {
                        resetUploadState();
                        setSelectedFiles([]);
                        setSelectedRealityDataId("");
                        setStep(0);
                      }} style={{ width: "100%", justifyContent: "center" }}>
                        🔄 Restart Walkthrough
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      if (selectedRealityDataId) {
                        await completeAuthoring(selectedRealityDataId, selectedProjectId);
                      }
                    }}
                    disabled={uploadLoading || !selectedRealityDataId}
                    style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                    id="complete-authoring-btn"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="spinner"></div> Setting Flag to False...
                      </>
                    ) : (
                      "✅ Set 'authoring' to False"
                    )}
                  </button>
                )}
              </div>

              {/* RIGHT COLUMN: PROGRESS AND CONSOLE */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="progress-panel fade-in" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: 12 }}>
                    Commit Logs & API Console
                  </h3>

                  {uploadSuccess && (
                    <div className="alert-box alert-success" style={{ padding: 12, fontSize: "0.85rem", marginBottom: 12 }}>
                      <span>🟢</span>
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="alert-box alert-danger" style={{ padding: 12, fontSize: "0.85rem", marginBottom: 12 }}>
                      <span>🔴</span>
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="console-title">
                    <span>💻</span> Live API Adapter Console
                  </div>
                  <div className="console-box" id="console-logs-box" style={{ flex: 1, minHeight: 250 }}>
                    {uploadLogs.map((log, idx) => {
                      let lineClass = "log-line-info";
                      if (log.startsWith("[SUCCESS]")) lineClass = "log-line-success";
                      else if (log.startsWith("[WARNING]")) lineClass = "log-line-warning";
                      else if (log.startsWith("[ERROR]")) lineClass = "log-line-error";
                      else if (log.startsWith("[SIMULATION]")) lineClass = "log-line-simulation";

                      return (
                        <div key={idx} className={`log-line ${lineClass}`}>
                          {log}
                        </div>
                      );
                    })}
                    <div ref={consoleEndRef} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- STEP 4: EXPLORE IMAGE COLLECTION AND THUMBNAILS --- */}
        {step === 4 && (
          <section className="fade-in">
            {/* BACK BAR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(3)}>
                ⬅️ Back to Commit Session
              </button>
              {activeRealityData && (
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Target Container: <strong style={{ color: "#fff" }}>{activeRealityData.displayName}</strong>
                </span>
              )}
            </div>

            <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 12, color: "#fff" }}>
                🖼️ Image Collection Gallery
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                Explore the contents of your secure Reality Data container. Requesting a <strong>read SAS credentials token</strong> allows us to read the blobs directly.
                If present, thumbnails in <code>.thumbnails/content/</code> are loaded first; clicking any thumbnail will load its original full-resolution counterpart.
              </p>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <button className="btn btn-secondary btn-sm" onClick={loadGallery} disabled={galleryLoading}>
                  {galleryLoading ? "Syncing..." : "🔄 Refresh Gallery"}
                </button>
                {readSasUrl && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--mono-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "400px" }}>
                    Active Read SAS: {readSasUrl}
                  </span>
                )}
              </div>

              {galleryError && (
                <div className="alert-box alert-danger" style={{ margin: "16px 0" }}>
                  <span>⚠️</span>
                  <span>{galleryError}</span>
                </div>
              )}

              {galleryLoading ? (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                  <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 20px" }}></div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Fetching container blob list via Azure REST API...</p>
                </div>
              ) : blobsList.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: 8 }}>
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: 12 }}>📷</span>
                  <h4 style={{ color: "#fff", marginBottom: 6 }}>No Images Found</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    This Reality Data container appears to be empty. Complete Step 2 to upload files.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 16, fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>
                      Found <strong>{blobsList.length}</strong> total blobs in container.
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>
                      {thumbnailBlobs.length > 0 ? "Showing Thumbnails (.thumbnails/content/)" : "Showing Root Images (Fallback)"}
                    </span>
                  </div>

                  {/* GALLERY GRID */}
                  <div className="project-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
                    {displayBlobs.map((blobName) => {
                      const thumbUrl = getBlobUrl(blobName);
                      const fullResName = getFullResBlobName(blobName);
                      const fullResUrl = getBlobUrl(fullResName);
                      
                      return (
                        <div
                          key={blobName}
                          className="glass-panel project-card"
                          style={{
                            padding: 8,
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            height: "220px",
                            border: "1px solid var(--border-color)"
                          }}
                          onClick={() => setSelectedImage({
                            name: fullResName,
                            url: fullResUrl,
                            thumbName: blobName
                          })}
                        >
                          {/* Image Thumbnail Preview */}
                          <div style={{
                            flex: 1,
                            borderRadius: 6,
                            overflow: "hidden",
                            background: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 8,
                            position: "relative"
                          }}>
                            <img
                              src={thumbUrl}
                              alt={blobName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                              onError={(e) => {
                                // If the thumbnail fails to load, replace with a generic file icon
                                e.target.style.display = "none";
                                const parent = e.target.parentNode;
                                const fallback = document.createElement("div");
                                fallback.innerHTML = "🖼️";
                                fallback.style.fontSize = "2.5rem";
                                parent.appendChild(fallback);
                              }}
                            />
                            <div style={{
                              position: "absolute",
                              bottom: 4,
                              right: 4,
                              background: "rgba(0,0,0,0.6)",
                              borderRadius: 4,
                              padding: "2px 6px",
                              fontSize: "0.65rem",
                              color: "#fff"
                            }}>
                              {hasThumbnails ? "Thumbnail" : "Original"}
                            </div>
                          </div>

                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <strong style={{ fontSize: "0.8rem", color: "#fff", display: "block" }}>
                              {blobName.split("/").pop()}
                            </strong>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--mono-font)" }}>
                              {hasThumbnails ? `→ ${fullResName}` : "Root level"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* --- LIGHTBOX MODAL FOR FULL RESOLUTION --- */}
            {selectedImage && (
              <div className="modal-overlay" onClick={() => setSelectedImage(null)} style={{ background: "rgba(15, 23, 42, 0.95)" }}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: "90%",
                    width: "800px",
                    background: "#0f172a",
                    border: "1px solid var(--border-color)",
                    padding: 24,
                    borderRadius: 12
                  }}
                >
                  <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
                    &times;
                  </button>
                  <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: 6 }}>
                    Full Resolution Image Preview
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 16, fontFamily: "var(--mono-font)" }}>
                    Filename: {selectedImage.name} <br />
                    Source Thumbnail: {selectedImage.thumbName}
                  </p>

                  <div style={{
                    width: "100%",
                    height: "450px",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#020617",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-color)"
                  }}>
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        const parent = e.target.parentNode;
                        const errorMsg = document.createElement("div");
                        errorMsg.innerHTML = "<h4>⚠️ Image Load Failed</h4><p style='font-size: 0.8rem; color: var(--text-secondary);'>The original full-resolution image could not be fetched from the container. Make sure it has been uploaded to the root with the name matching: <code>" + selectedImage.name + "</code></p>";
                        errorMsg.style.textAlign = "center";
                        errorMsg.style.padding = "20px";
                        parent.appendChild(errorMsg);
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      SAS authorization active for this session.
                    </span>
                    <button className="btn btn-secondary" onClick={() => setSelectedImage(null)}>
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}

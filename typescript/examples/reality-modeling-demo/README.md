# Reality Client Upload Portal (SaaS Client-Side Integration)

> [!NOTE]
> **Developer Notice**: This is an LLM-generated reference integration application geared specifically toward developers onboarding with the Bentley iTwin Platform. It provides a real-world playground and template to understand direct client-side resource registration, SAS token fetching, and cloud storage upload workflows.

This application is a lightweight React + Vite dashboard demonstrating how a SaaS mobile or client-side application integrates directly with Bentley iTwin APIs without an intermediate custom backend proxy.

---

## 🚀 Key Integration Walkthrough

The project implements the following step-by-step developer integration flow:

1. **IMS Authentication**: Log in via Bentley Identity Management (IMS) using OAuth 2.0 Authorization Code Flow with PKCE.
2. **Project Selection**: Fetch active iTwins (Projects) calling `GET https://api.bentley.com/itwins`.
3. **Reality Data Container Provisioning**: Create and register a secure scan container on-the-fly via `POST https://api.bentley.com/reality-management/reality-data`.
4. **Acquire SAS Credentials**: Programmatically retrieve a direct write SAS token URL via `GET .../reality-data/{id}/writeaccess`.
5. **Direct Azure Upload**: Direct HTTP `PUT` block uploads from the browser to Azure Blob Storage using the acquired SAS token.
6. **Commit Upload Phase**: Complete authoring by calling `PATCH .../reality-data/{id}` with `authoring: null` to finalize the scan.

---

## 🛠️ Developer Configuration

To run this demo application locally, you **must register your own developer application client credentials**:

1. Go to [developer.bentley.com](https://developer.bentley.com/) and sign in.
2. Go to **My Apps** and register a new **Single Page Application (SPA)** client.
3. Enable the **itwin-platform** scope.
4. Configure a local HTTPS redirect URI (e.g., `https://localhost:8099`) under your app's redirect list.
5. Create a local `.env` file from the template below:

### Local `.env` Configuration Template
```env
# Bentley IMS OAuth Configuration
VITE_BENTLEY_CLIENT_ID=YOUR_REGISTERED_SPA_CLIENT_ID
VITE_BENTLEY_SCOPE=itwin-platform
VITE_BENTLEY_REDIRECT_URI=https://localhost:8099
VITE_BENTLEY_AUTHORITY=https://ims.bentley.com

# Bentley Resource API Base
VITE_BENTLEY_API_BASE=https://api.bentley.com
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local HTTPS Dev Server
The local development server is configured to run on port `8099` using a basic SSL protocol (`https://localhost:8099`) to comply with Bentley IMS redirect requirements.
```bash
npm run dev
```

---

## 📦 Bundling clean source for distribution

To generate a clean ZIP archive of this project with a template environment file (excluding `node_modules`, `dist` and other build files), you can run:
```bash
npm run zip
```
The resulting clean developer package will be built at `public/reality-client-portal.zip`.

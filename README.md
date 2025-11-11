# Microfrontend Prototype — README

A minimal, dockerized microfrontend architecture with:

- **Registry** (ASP.NET Core minimal API) — catalog of MFEs
- **Shell** (React + Vite) — tabbed UI that discovers & loads MFEs at runtime
- **MFEs** (React + Vite) — each exports a **Widget** (for dashboard) and a **Page** (for its tab)

This prototype uses a **register-only `remoteEntry.js`** pattern: each MFE builds a single JS file that, when loaded by the Shell, registers components on a shared `window.mfes[...]` object—no rendering side-effects.

---

## Contents

- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Quick start](#quick-start)
- [Services](#services)
  - [Registry](#registry)
  - [Shell](#shell)
  - [MFEs](#mfes)
- [Runtime flow](#runtime-flow)
- [Environment & Docker notes](#environment--docker-notes)
- [Known issues & fixes](#known-issues--fixes)
- [Troubleshooting](#troubleshooting)
- [Extending the prototype](#extending-the-prototype)

---

## Architecture

- **Registry**: Stores MFE manifests (id, name, `remoteEntryUrl`, slots, routes). MFEs **self-register** (preferably from the container on startup with retry).
- **Shell**: On load, calls the registry to get widgets & pages; injects `<script src="remoteEntry.js">` for each MFE; then renders the MFE’s Widget or Page.
- **MFEs**: Frontend-only static bundles. On load of `remoteEntry.js`, each MFE executes:
  ```ts
  window.mfes[manifest.id] = { Widget, Page }
  ```
  (No DOM rendering in production bundles.)

---

## Folder structure

```
proto-mfe/
  docker-compose.yml
  services/
    registry/
      proto-mfe.registry.csproj
      Program.cs
      Dockerfile
  frontends/
    shell/
      package.json
      tsconfig.json
      vite.config.ts
      index.html
      src/
        types.ts
        mfeLoader.ts
        main.tsx
        App.tsx
        Dashboard.tsx
        DynamicPage.tsx
      Dockerfile
    mfe-tasks/                # example MFE
      package.json
      tsconfig.json
      vite.config.ts
      index.html              # dev only
      src/
        remoteEntry.ts        # production entry (register-only)
        dev.tsx               # dev preview (renders to #root)
        polyfills.ts          # process shim (optional)
        manifest.ts
        types.ts
        Widget.tsx
        Page.tsx
      register.cjs            # container-side self-registration
      Dockerfile
    mfe-metrics/              # another MFE (same pattern)
    mfe-notifications/        # another MFE (same pattern)
```

> If you’re simplifying with **one MFE**, just keep a single `frontends/mfe-...` folder and remove the others.

---

## Quick start

From the repo root:

```bash
# Build and run all services
docker compose up --build
```

Open:

- **Shell**: http://localhost:3000  
- **Registry Swagger**: http://localhost:5000/swagger

Run a subset:

```bash
docker compose up -d registry shell
# or only one frontend
docker compose up -d mfe-tasks
```

Useful flags:

- `--no-deps` (start without dependencies)
- `--build` (force image rebuild)
- `-d` (detached)

---

## Services

### Registry

- **Language**: .NET 8 (minimal API)
- **Port**: 5000
- **Key endpoints**:
  - `POST /api/mfe/register` — upsert an MFE manifest
  - `GET  /api/mfe` — list all MFEs
  - `GET  /api/mfe/widgets?slot=dashboard` — filter by widget slot
  - `GET  /api/mfe/pages` — filter to MFEs with a `pageRoute`

**Build locally (optional):**
```bash
cd services/registry
dotnet build
dotnet run
```

### Shell

- **Language**: React + Vite
- **Port**: 3000 (mapped from container port 80)
- **Behavior**:
  - Fetches pages & widgets from the registry.
  - Renders a **tabbed UI**:
    - **Dashboard** tab → loads all widgets for slot `dashboard`
    - One tab per MFE → loads that MFE’s `Page`
  - Dynamically injects `<script src="{remoteEntryUrl}">` for each MFE.
  - Accesses components via `window.mfes[mfeId]`.

### MFEs

- **Language**: React + Vite library build
- **Port**: 3001 / 3002 / 3003 (host) → container `80`
- **Build output**: `dist/remoteEntry.js` (IIFE)
- **Production entry**: `src/remoteEntry.ts` (registers `{ Widget, Page }` only)
- **Dev entry**: `src/dev.tsx` (renders preview to `#root` when running `vite dev`)
- **Container startup**: runs `register.cjs` to **self-register** with retry, then serves `/dist`.

---

## Runtime flow

1. **Registry** starts and exposes REST endpoints.
2. Each **MFE container** starts:
   - Builds `remoteEntry.js` (at image build time).
   - Runs `register.cjs` → `POST /api/mfe/register` with its manifest (retries until registry is available).
3. **Shell** loads:
   - `GET /api/mfe/widgets?slot=dashboard` → to populate the dashboard.
   - `GET /api/mfe/pages` → to create dynamic tabs.
   - For each MFE, injects `<script src="remoteEntry.js">`.
   - When the script executes, it sets `window.mfes[id] = { Widget, Page }`.
   - Shell renders each Widget and Page in the UI.

---

## Environment & Docker notes

- **Compose** exposes the services on:
  - Registry: `5000:5000`
  - Shell: `3000:80`
  - MFE(s): `3001:80`, `3002:80`, `3003:80`
- MFEs register using service-to-service URL `http://registry:5000` (inside the Docker network).
- **Manifest.remoteEntryUrl** should point to a **browser-accessible** host URL, e.g.:
  - `http://localhost:3001/remoteEntry.js`

> In `docker-compose.yml`, we pass `PUBLIC_URL` env vars to each MFE’s registrar so manifests use the correct host URL.

---

## Known issues & fixes

### 1) **Registry was still booting when MFEs tried to register**
- **Symptom**: No `POST /api/mfe/register` seen.
- **Cause**: `depends_on` doesn’t wait for HTTP readiness.
- **Fix**:
  - Add **retry logic** in a Node-side `register.cjs` (runs on container startup).
  - (Optional) Add **healthcheck** to registry and `condition: service_healthy` in Compose.

### 2) **`process is not defined` in the browser**
- **Symptom**: Console error like `process.env.NODE_ENV === "production" ? ...`
- **Cause**: A CommonJS dep (e.g., React) was externalized in Vite lib mode; runtime `process` access remained.
- **Fixes**:
  - Ensure Vite bundles dependencies in the IIFE:
    ```ts
    // vite.config.ts
    build: {
      lib: { /* entry, formats: ['iife'] */ },
      rollupOptions: { external: [], output: { inlineDynamicImports: true } },
      commonjsOptions: { transformMixedEsModules: true }
    },
    define: { "process.env.NODE_ENV": JSON.stringify("production") }
    ```
  - (Optional) Add a tiny **process shim**:
    ```ts
    // src/polyfills.ts
    (window as any).process = (window as any).process || { env: { NODE_ENV: "production" } };
    ```

### 3) **Loading `remoteEntry.js` replaced the Shell UI**
- **Symptom**: Shell disappears when an MFE loads.
- **Cause**: The MFE’s entry rendered to `#root` (dev behavior) when the Shell injected it.
- **Fix**: Split entries:
  - **Production**: `src/remoteEntry.ts` (register-only; no DOM rendering)
  - **Dev preview**: `src/dev.tsx` (renders to `#root` only in dev)

### 4) **Never seeing any MFEs in the Shell**
- **Symptom**: Dashboard empty; no tabs except “Dashboard”.
- **Causes**:
  - MFEs haven’t registered yet (see #1).
  - Manifests have wrong `remoteEntryUrl` (pointing to a container name instead of `localhost:port`).
- **Fix**:
  - Confirm `GET http://localhost:5000/api/mfe` returns your manifests.
  - Verify each `remoteEntryUrl` loads in a browser (200 OK, JS file).

### 5) **CORS / network mistakes**
- **Symptom**: `fetch` or script loads blocked.
- **Fix**:
  - Registry enables permissive CORS in `Program.cs`.
  - Use host-appropriate URLs in manifests (`http://localhost:3001/...` for the browser).
  - Ensure ports are published in Compose.

---

## Troubleshooting

- **Bring up only the registry**:
  ```bash
  docker compose up -d --build registry
  open http://localhost:5000/swagger
  ```
- **Start one MFE and confirm it registers**:
  ```bash
  docker compose up -d --build mfe-tasks
  curl http://localhost:5000/api/mfe
  ```
- **Check logs**:
  ```bash
  docker compose logs -f registry
  docker compose logs -f mfe-tasks   # or whichever MFE
  docker compose logs -f shell
  ```
- **Verify `remoteEntry.js`** loads directly:
  - http://localhost:3001/remoteEntry.js (or 3002/3003)
- **Open the Shell** and watch the network tab:
  - http://localhost:3000 → confirm it calls `/api/mfe/pages` & `/api/mfe/widgets?slot=dashboard`

---

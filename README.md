# BoredAgent Web — React Frontend

A React single-page app for uploading images or ZIPs, tracking processing, and viewing OCR→PDF results produced by the backend (`BoredAgentBackend`).

## Features

- Drag-and-drop upload for multiple images and ZIP archives
- Adjustable batch size per upload, progress feedback, and a processing queue view
- Results gallery with PDF previews/downloads, and a review tab
- Live statistics and a clear-all button
- Works locally with the backend at http://localhost:8080 by default

## Project structure

- `src/App.js` — main app with tabbed navigation and state
- `src/components/*` — UI components (Upload, Queue, Results, Review, Statistics, header, modal, PDF viewer)
- `src/services/api.js` — API client with base URL resolution
- `.env` / `.env.development` — local dev overrides for API URL and dev server
- `config-overrides.js` — CRA dev server tweaks (allowedHosts)

## Requirements

- Node.js 18+
- npm 9+

## Install and run (local)

```cmd
cd BoredAgentWeb
npm install
npm start
```

This starts the dev server on http://localhost:3000 and points API calls to http://localhost:8080/api via `REACT_APP_API_URL`.

Build for production:

```cmd
npm run build
```

The build outputs to `build/`.

## Configuration

API base URL resolution order (see `src/services/api.js`):

1) `REACT_APP_API_URL` if set at build/runtime
2) Fallback to `window.location.origin + "/api"`

Local development provides `.env` files with:

```
REACT_APP_API_URL=http://localhost:8080/api
SKIP_PREFLIGHT_CHECK=true
```

Adjust these to match your backend.

## Using the app

1) Start the backend on port 8080
2) Start this frontend on port 3000
3) Go to http://localhost:3000
4) Upload images or a ZIP; optionally set a batch size
5) Watch the processing tab; when done, switch to Results or Review

## Available scripts

- `npm start` — Start dev server
- `npm run build` — Build production bundle
- `npm test` — Run tests (if present)
- `npm run eject` — Eject CRA (irreversible)

## Environment variables

- `REACT_APP_API_URL` — Base URL for the backend API
- `SKIP_PREFLIGHT_CHECK` — Skip peer-dep checks during install
- Dev server extras: `WDS_SOCKET_HOST`, `WDS_SOCKET_PORT`, `FAST_REFRESH`

## Deploying

Any static hosting works (Vercel, Netlify, S3+CloudFront, etc.). Ensure your backend is reachable and either:

- Serve the frontend and backend from the same origin and proxy `/api` to the backend, or
- Build the app with `REACT_APP_API_URL` pointing to your backend (e.g., `https://yourdomain.com/api`).

Example build with custom API URL:

```cmd
set REACT_APP_API_URL=https://yourdomain.com/api && npm run build
```

On Unix shells, use `REACT_APP_API_URL=https://yourdomain.com/api npm run build`.

## Notes

- The UI stores a small bit of state in `localStorage` to survive refreshes
- Large uploads may take time; progress bar reflects upload progress, not full processing

---

Pairs with `../BoredAgentBackend`.

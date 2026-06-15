# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single product, **MailGen AI** (an AI professional email generator), split into two services. There is no root `package.json`; each service has its own.

### Services

| Service | Path | Dev command | Port | Notes |
|---------|------|-------------|------|-------|
| Backend API | `backend/` | `npm run start:dev` | `3000` | NestJS 11 + TypeORM + SQLite (`db.sqlite`, auto-created). Auth (`/auth/*`) + email generation (`/mail/generate`). |
| Frontend SPA | `frontend/` | `npm run dev` | `5173` | React 19 + Vite 8. Run on port 5173 — the backend CORS allows only `http://localhost:5173`. |

Standard scripts live in each `package.json` (`build`, `lint`, `test` (backend only), `dev`/`start:dev`). The update script already runs `npm install` in both `backend/` and `frontend/`.

### Non-obvious caveats

- **Both services must run** for end-to-end use. Frontend API URLs are hardcoded to `http://localhost:3000`, and the backend only accepts CORS from `http://localhost:5173`. Do not change the ports.
- **Gemini is optional.** Email generation uses Google Gemini if `GEMINI_API_KEY` is set (in `backend/.env` or `/workspace/.env`); otherwise it transparently falls back to local template generation, so the full flow works with no API key.
- **Signup does not auto-login** — after `/auth/signup` the UI redirects to the login page; log in separately.
- **Ignore `Login Page by (AntiGravity)/backend/`.** It is leftover default NestJS scaffolding, has no lockfile, and is not part of the product. Do not start it (it would also bind port 3000 and conflict with the real backend).
- **SQLite uses `better-sqlite3`** with `synchronize: true`; the schema/`db.sqlite` file is created automatically on first backend start. No external DB server is needed.
- `npm run lint` currently reports pre-existing lint errors in both services; these are not caused by environment setup.

# Feature: documentation-baseline
Objective: Explore SALUD-UDP and bring its documentation into a coherent, current baseline.
Branch: dev | Delivery: single reviewable documentation work-unit sequence | Test runner: structural Markdown checks plus existing Docker baseline checks

## Specs

1. **S1 — Complete project exploration and documentation map**
   - User request: "perfecto ahora explora el proyecto completo y actualicemos la documetnacion. Ordenemos la casa"
   - Scope: document the current repository architecture, runtime paths, existing documentation, testing boundaries, configuration, and deployment context without inventing behavior.
   - Acceptance: one navigable documentation entry point identifies current, operational, historical, and testing documents.
   - Checks: Markdown links/paths resolve; documented commands match repository configuration.

2. **S2 — Current architecture and runtime guidance**
   - User request: "perfecto ahora explora el proyecto completo y actualicemos la documetnacion. Ordenemos la casa"
   - Scope: explain development and production request paths, frontend/backend boundaries, authentication flow, roles, and the clinical workflow using current source evidence.
   - Acceptance: a maintainer can understand how a request travels through the system and where each responsibility lives.
   - Checks: structural readback against `docker-compose.yml`, `docker-compose.prod.yml`, `frontend/vite.config.ts`, `backend/entrypoint.sh`, and current route/service files.

3. **S3 — Testing and quality baseline**
   - User request: "perfecto ahora explora el proyecto completo y actualicemos la documetnacion. Ordenemos la casa"
   - Scope: document executable backend checks, frontend lint/build checks, known coverage boundaries, and currently observed quality gaps.
   - Acceptance: a contributor can run the documented checks and distinguish passing coverage from unconfigured coverage.
   - Checks: commands are verified against `backend/pytest.ini`, `backend/requirements.txt`, and `frontend/package.json`.

4. **S4 — Configuration and deployment runbook**
   - User request: "perfecto ahora explora el proyecto completo y actualicemos la documetnacion. Ordenemos la casa"
   - Scope: document development and production environment templates, Docker Compose variants, Nginx/Gunicorn/static behavior, deployment assumptions, and safe reset/secret cautions.
   - Acceptance: a maintainer can select the correct environment template and startup/deployment command without guessing.
   - Checks: paths and commands match `.env.example`, `.env.prod.example`, both Compose files, `nginx/`, and `deploy.sh`.

## Tasks

- T1 — S1, S2 | delegated direct, parallel writer | complete | commit: none (working tree delivery)
- T2 — S3, S4 | delegated direct, parallel writer | complete | commit: none (working tree delivery)

## Log

- L1 (2026-10-19): "perfecto ahora explora el proyecto completo y actualicemos la documetnacion. Ordenemos la casa"
- L2 (2026-10-19): Read-only exploration found a clean `dev` branch synchronized with `origin/dev`; Docker baseline is running, backend pytest passes 26 tests, frontend has no test script, ESLint has 5 errors and 12 warnings, and npm audit reports 30 vulnerabilities. These findings are documented as baseline facts, not silently fixed in this documentation-only slice.
- L3 (2026-10-19): The Engram mirror is pending because the Codex host session is not registered; local progress must remain authoritative until memory becomes available.
- L4 (2026-10-19): T1 added the documentation index and current architecture/runtime guide and refreshed README navigation. T2 added testing and operations runbooks. Parent structural checks passed; no source or test files were changed.



# Architecture and runtime

**Current guide — source-checked 2026-10-19.** SALUD-UDP is a React single-page application backed by Django REST Framework and MySQL. Docker Compose selects the runtime: Vite proxies requests in development; Nginx serves the built SPA and proxies backend routes in production.

## Quick map

| Concern | Responsibility | Source |
|---|---|---|
| Browser UI and routes | React pages, feature modules, React Router | [`frontend/src/App.tsx`](../../frontend/src/App.tsx) |
| API client | Axios base URL, bearer token, refresh retry | [`frontend/src/services/api.ts`](../../frontend/src/services/api.ts) |
| API and admin routes | Django URL configuration and app routers | [`backend/config/urls.py`](../../backend/config/urls.py) |
| Domain and persistence | Django apps and ORM models; MySQL in Compose | [`backend/apps/`](../../backend/apps/) |
| Development entry | Vite proxy and Django `runserver` entrypoint | [`frontend/vite.config.ts`](../../frontend/vite.config.ts), [`backend/entrypoint.sh`](../../backend/entrypoint.sh) |
| Production entry | Nginx, built frontend volume, Gunicorn backend | [`docker-compose.prod.yml`](../../docker-compose.prod.yml), [`nginx/prod.conf`](../../nginx/prod.conf) |

## Request paths

### Development

```text
Browser → Vite (port 5173) → React SPA
                     ├── /api/*, /admin/*, /static/* → backend:8000
                     └── backend → db:3306 (MySQL)
```

[`docker-compose.yml`](../../docker-compose.yml) starts `db`, `backend`, and `frontend`. The frontend runs `npm run dev -- --host`; [`vite.config.ts`](../../frontend/vite.config.ts) proxies `/api`, `/admin`, and `/static` to `http://backend:8000`. The frontend API client uses `VITE_API_URL` or `/api` as its base URL. The backend service mounts `./backend:/app` and runs [`entrypoint.sh`](../../backend/entrypoint.sh): migrate, optionally create the configured superuser if it does not exist, then `python manage.py runserver 0.0.0.0:8000`.

### Production

```text
Browser → Nginx (port 80) ── / and SPA fallback → built frontend files
                         ├── /api/*, /admin/* → backend:8000 (Gunicorn)
                         └── /static/* → shared static_files volume
Frontend build service ── writes dist → shared frontend_build volume
Backend ── connects to db:3306 (MySQL)
```

[`docker-compose.prod.yml`](../../docker-compose.prod.yml) builds a production backend with `Dockerfile.prod`, a one-shot frontend image that writes `dist` to `frontend_build`, and Nginx. [`nginx/prod.conf`](../../nginx/prod.conf) serves the SPA with an `index.html` fallback, proxies API and Django admin to `backend:8000`, and serves `/static/` from the shared volume. Compose publishes Nginx on port 80. The dev `entrypoint.sh` description above does not apply to the production image.

## Application boundaries

| Layer | Responsibility | Main locations |
|---|---|---|
| Frontend shell | App routes, shared layout, auth context | [`frontend/src/App.tsx`](../../frontend/src/App.tsx), [`frontend/src/features/auth/`](../../frontend/src/features/auth/) |
| Frontend feature UI | Patients, clinical records, student management, student portal | [`frontend/src/features/pacientes/`](../../frontend/src/features/pacientes/), [`frontend/src/features/fichas/`](../../frontend/src/features/fichas/), [`frontend/src/features/estudiantes/`](../../frontend/src/features/estudiantes/), [`frontend/src/features/portal-estudiante/`](../../frontend/src/features/portal-estudiante/) |
| Shared API access | Axios configuration and JWT interceptors | [`frontend/src/services/api.ts`](../../frontend/src/services/api.ts) |
| Backend users | User endpoints and student management | [`backend/apps/users/`](../../backend/apps/users/) |
| Backend domain apps | Patient, clinical-record, and shared validation/permission behavior | [`backend/apps/pacientes/`](../../backend/apps/pacientes/), [`backend/apps/fichas/`](../../backend/apps/fichas/), [`backend/apps/common/`](../../backend/apps/common/) |
| Persistence | Django models backed by the Compose MySQL service | [`backend/apps/`](../../backend/apps/), [`docker-compose.yml`](../../docker-compose.yml) |

Root API routes are `/api/token/`, `/api/token/refresh/`, `/api/users/`, `/api/pacientes/`, and `/api/fichas/`; Django admin is `/admin/`. App-specific endpoints are registered in each app's URL configuration, including [`fichas/urls.py`](../../backend/apps/fichas/urls.py).

## Authentication and authorization

1. The login form calls `POST /api/token/` with email and password through [`authService.ts`](../../frontend/src/features/auth/services/authService.ts). SimpleJWT returns access and refresh tokens.
2. [`AuthContext.tsx`](../../frontend/src/features/auth/context/AuthContext.tsx) stores both tokens in `localStorage`, calls `GET /api/users/me/`, and keeps the returned user in application state. At startup it restores the user from the access token; on failure it removes both tokens.
3. The Axios request interceptor sends the access token as a Bearer token. On a 401 outside token endpoints it attempts one refresh with `/api/token/refresh/`; on refresh failure it clears tokens and navigates to `/login`.
4. `PrivateRoute` in [`App.tsx`](../../frontend/src/App.tsx) requires an authenticated frontend session. This is a UI route guard, not a substitute for backend authorization; Django viewsets apply authentication and action-specific permissions.

The domain roles are `ADMIN`, `DOCENTE`, and `ESTUDIANTE` (defined by the user model). After successful login, the frontend sends students to `/mi-clinica` and other roles to `/menu-usuario`. Backend behavior is enforced per endpoint/action; do not infer that every authenticated endpoint is restricted to a particular role solely from the UI.

## Clinical workflow

The current clinical record chain is:

```text
CasoClinico → AtencionClinica (linked to Paciente) → AtencionEstudiante → Vineta / Evolucion
```

1. A docente/admin creates a reusable `CasoClinico`.
2. A clinical `AtencionClinica` associates the case with a patient and date.
3. A docente/admin assigns an `ESTUDIANTE` to the attention through `asignar_estudiante`.
4. The student works in `/mi-clinica`, where assigned work and evolutions are exposed; docentes/admin manage the clinical-record views. The backend filters student-facing records by the authenticated student in the relevant viewsets.
5. An evolution is created for an assignment and may be updated while editable. A student can deliver their own evolution; the backend rejects student edits after delivery. The current implementation describes delivery as irreversible for the student.

Relevant backend endpoints and rules are in [`backend/apps/fichas/urls.py`](../../backend/apps/fichas/urls.py) and [`backend/apps/fichas/views.py`](../../backend/apps/fichas/views.py); frontend feature calls are in [`fichaService.ts`](../../frontend/src/features/fichas/services/fichaService.ts) and the student-portal service/pages under [`portal-estudiante`](../../frontend/src/features/portal-estudiante/). Exact permissions vary by action, so use the viewset implementation when troubleshooting access.

## Source of truth and freshness

- This overview was checked against the linked source and runtime files on **2026-10-19**.
- The source/configuration is authoritative when a component reference or historical document disagrees.
- Runtime and role rules can change independently of this guide; refresh the status date and links when those files change.

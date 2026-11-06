# Operations and deployment

Choose the environment file and Compose variant deliberately: development is a bind-mounted Django/Vite workflow; production serves a built frontend and Django static files through Nginx, with Gunicorn behind the proxy.

## Quick path

### Development

1. Copy `.env.example` to `.env` at the repository root.
2. Start the development stack:

   ```sh
   docker compose up --build -d
   ```

3. Open `http://localhost:5173`. Backend and database are internal Compose services; Vite proxies `/api` to `backend:8000`.

### Production

1. Copy `.env.prod.example` to `.env.prod`, then replace every `CAMBIA_ESTO...` placeholder with production values.
2. Review host/origin values and access to the production host before deployment.
3. From the repository root, start the production Compose definition:

   ```sh
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
   ```

Nginx publishes HTTP on host port 80. HTTPS termination, DNS, firewall rules, backups, and host provisioning are outside these Compose files and must be supplied by the deployment environment.

## Current runtime paths

| Concern | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
|---|---|---|
| Frontend | Vite dev server on host port 5173; source is bind-mounted. | `frontend_build` creates `dist`; Nginx serves the shared `frontend_build` volume and falls back to `index.html` for client routes. |
| API/admin | Frontend Vite proxy targets `backend:8000`; no backend host port is published. | Nginx proxies `/api/` and `/admin/` to `backend:8000`. |
| Django process | `backend/entrypoint.sh` migrates, creates the configured initial superuser if absent, then runs Django `runserver`. | `backend/entrypoint.prod.sh` migrates, runs `collectstatic`, creates the configured initial superuser if absent, then starts Gunicorn (3 workers, timeout 120s). |
| Static files | Django serves in development; backend source is mounted into `/app`. | Django writes to `/app/static` (`STATIC_ROOT`); the `static_files` volume is mounted read-only into Nginx at `/var/www/static`. |
| Database | MySQL 8, persisted in named volume `db_data`. | MySQL 8, persisted in named volume `db_data`. |

Both Compose definitions declare the same named-volume keys. If running both variants from this checkout, use distinct Compose project names (`-p`) and verify resolved volume names before startup to avoid sharing project-scoped volumes unintentionally.

## Environment and secrets

| File | Use | Notes |
|---|---|---|
| `.env.example` | Local development template | Contains convenient local credentials and an insecure Django development key; do not reuse these values outside local development. |
| `.env.prod.example` | Production template | Contains explicit `CAMBIA_ESTO` placeholders plus `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`; complete and review before use. |
| `.env`, `.env.prod` | Local secret-bearing runtime files | Both are ignored by `.gitignore`; keep them out of commits, screenshots, logs, and support bundles. |

`DJANGO_SUPERUSER_EMAIL` and `DJANGO_SUPERUSER_PASSWORD` are used on startup to create the initial account only if that email does not already exist. Changing the environment value later does not reset an existing account's password.

## Deployment script: assumptions and cautions

`deploy.sh` is a host-specific script, not a general local deployment command. It changes directory to `/var/www/dev`, requires `.env.prod`, runs `git pull origin production`, rebuilds/starts `docker-compose.prod.yml` with `.env.prod`, prunes unused Docker images, and prints Compose status.

Before relying on it, an operator must verify that the server path, checked-out branch/remote, credentials, production environment file, Docker Compose version, network/firewall, DNS/TLS termination, and backup/rollback process match the intended deployment. The script does not create `.env.prod`, back up the database, configure TLS, or provide rollback. `git pull` and image pruning change host state; run it only in the intended deployment environment.

## Safe reset and cleanup

- `docker compose down` stops/removes the selected Compose stack but preserves named volumes.
- **Do not use `docker compose down -v` as a routine restart.** It removes volumes for that project, including its MySQL `db_data` volume and database contents. Confirm project and volume names and a recoverable backup before any volume removal; never copy a development reset command into production.
- `docker image prune -f` in `deploy.sh` removes unused images; it is not a database backup or rollback mechanism.
- Do not commit real `.env` files or paste secrets into commands that may be retained in shell history.


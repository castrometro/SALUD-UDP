# Testing and quality baseline

Use the Docker development stack for the repository's current repeatable checks. The backend has automated pytest coverage; the frontend has lint and production-build scripts but no configured test script.

## Quick path

From the repository root, with `.env` prepared as described in [Operations](OPERATIONS.md#quick-path):

```sh
docker compose up --build -d
docker compose exec backend pytest
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

`pytest` reads `backend/pytest.ini` (`config.test_settings`, `--nomigrations`) and its dependencies are listed in `backend/requirements.txt`. Frontend commands are the `lint` and `build` scripts in `frontend/package.json`; build runs TypeScript (`tsc`) before Vite.

## What this baseline does and does not prove

| Area | Current evidence | Limit |
|---|---|---|
| Backend | Pytest/Django tests exist under `backend/apps/*/tests/`; the recorded baseline passed 26 tests. | No coverage threshold or coverage-report command is configured in the checked-in pytest settings/dependencies. Passing tests do not establish a coverage percentage. |
| Frontend | ESLint and the TypeScript+Vite production build are runnable scripts. | `frontend/package.json` has no `test` script; no automated frontend unit-test command is configured. |
| Integration | Development Compose starts MySQL, Django, and Vite together. | The listed checks do not by themselves prove browser workflows, production deployment, or external-host behavior. |

## Known baseline findings

- **Lint is currently failing:** the recorded baseline had 5 ESLint errors and 12 warnings. `--max-warnings 0` makes warnings fail the `lint` script as well; treat these as known baseline findings, not as evidence that this documentation change caused them.
- **Build status:** use `npm run build` to verify the current tree; no build result is asserted here.
- **No frontend tests / no coverage report:** these are configuration limits, not passing checks.

## Contributor checklist

- [ ] Run backend pytest after backend changes.
- [ ] Run frontend lint and build after frontend changes.
- [ ] Report each failed or skipped check; do not infer coverage from a green test run.


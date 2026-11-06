# SALUD-UDP documentation index

**Start here:** use the current architecture/runtime guide for a verified system overview, then follow the linked feature references for details. Historical and planning documents are labeled so they are not mistaken for implemented behavior.

**Status checked:** 2026-10-19. “Current” means checked against this repository on that date; update this label when source changes.

## Current guides

| Document | Status | Use it for |
|---|---|---|
| [Architecture and runtime](architecture.md) | Current — source-checked 2026-10-19 | Development/production request paths, app boundaries, authentication, roles, and clinical workflow. |
| [Clinical workflows](workflows.md) | Reference — verify details against source | Domain workflow and permission/action notes. Use the architecture guide and code as authority if they differ. |

## Component references

| Area | Document | Status |
|---|---|---|
| Backend — users and authentication | [users](backend/apps/users.md) | Reference; verify against current source |
| Backend — patients | [pacientes](backend/apps/pacientes.md) | Reference; verify against current source |
| Backend — clinical records | [fichas](backend/apps/fichas.md) | Reference; verify against current source |
| Backend — shared utilities | [common](backend/apps/common.md) | Reference; verify against current source |
| Frontend — authentication | [auth](frontend/features/auth.md) | Reference; verify against current source |
| Frontend — patients | [pacientes](frontend/features/pacientes.md) | Reference; verify against current source |
| Frontend — clinical records | [fichas](frontend/features/fichas.md) | Reference; verify against current source |
| Frontend — students | [estudiantes](frontend/features/estudiantes.md) | Reference; verify against current source |
| Frontend — student portal | [portal-estudiante](frontend/features/portal-estudiante.md) | Reference; verify against current source |

## Historical and planning material

These documents are useful for context, not as current implementation instructions. Confirm behavior in the code before relying on them.

| Document | Status | Context |
|---|---|---|
| [REDISENO_CASO_CLINICO.md](REDISENO_CASO_CLINICO.md) | Historical — explicitly marked superseded in the document | Earlier design proposal; the document itself points to the later model chain. |
| [REQUERIMIENTOS_FICHAS_SIMULACION.md](REQUERIMIENTOS_FICHAS_SIMULACION.md) | Planning/reference — not source of truth | Simulation requirements and workflow ideas; validate any “current” claims against the implementation. |
| [Docs/TODO.md](../TODO.md) | Planning | Repository-wide pending-work notes. |
| [Issue #3](../Issues/Issue%233/Issue.md) and [resolution](../Issues/Issue%233/resolucion.md) | Historical issue record | Issue-specific discussion and resolution. |

## Reading order

1. [Architecture and runtime](architecture.md) for current system behavior.
2. The relevant backend or frontend component reference for implementation detail.
3. [Clinical workflows](workflows.md) for the domain sequence, checking source where status differs.
4. Historical/planning material only when investigating design history or open requirements.

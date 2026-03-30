# SALUD-UDP — Instrucciones del Proyecto

Sistema de gestión de fichas clínicas ambulatorias para la Universidad Diego Portales.
Monolito modular: **Django REST** + **React/TypeScript** + **MySQL 8**, orquestado con Docker Compose.

## Idioma

- Todo el código (modelos, variables, comentarios, commits) está en **español**.
- Locale: `es-cl`, timezone: `America/Santiago`.

## Arquitectura

```
Browser → localhost:5173 (Vite dev)
            ├── /api/*    → proxy → backend:8000 (Django REST)
            ├── /admin/*  → proxy → backend:8000
            └── /static/* → proxy → backend:8000
         backend:8000 ← → db:3306 (MySQL 8)
```

### Backend — Django apps modulares

| App | Rol |
|-----|-----|
| `apps/users` | Auth JWT (email-based), roles ADMIN/DOCENTE/ESTUDIANTE |
| `apps/pacientes` | CRUD pacientes, validación RUT chileno |
| `apps/fichas` | CasoClinico (escenario genérico), AtencionClinica (caso+paciente+fecha), AtencionEstudiante (asignación), Vineta (inyección narrativa), Evolucion (notas clínicas) |
| `apps/common` | Validadores compartidos (`validate_rut`, `format_rut`) |

### Frontend — Feature-based React

| Feature | Rol |
|---------|-----|
| `features/auth` | AuthContext, JWT en localStorage, PrivateRoute |
| `features/pacientes` | CRUD con búsqueda y paginación |
| `features/fichas` | Casos clínicos, atenciones clínicas, asignaciones de estudiantes, evoluciones |
| `features/estudiantes` | Gestión de estudiantes (vista docente/admin) |

Detalle de cada módulo en `Docs/documentacion del sistema/`.

## Build & Test

```bash
# Levantar todo (migraciones corren automáticamente vía entrypoint.sh)
docker compose up --build -d

# Tests backend (pytest + SQLite en memoria, --nomigrations)
docker compose exec backend pytest

# Lint frontend (strict: max-warnings 0)
docker compose exec frontend npm run lint

# Build frontend (incluye tsc check)
docker compose exec frontend npm run build

# Reset completo (borra BD)
docker compose down -v && docker compose up --build -d
```

## Convenciones — Backend

### Modelos
- **Custom User** email-based (`AUTH_USER_MODEL = 'users.User'`), sin username.
- Roles via `TextChoices`: `ADMIN`, `DOCENTE`, `ESTUDIANTE`.
- RUT se auto-formatea en `save()` usando `format_rut()` de `apps/common/validators`.
- `validate_rut()` está **deshabilitada para MVP** (permite RUTs ficticios como SIM-001).
- Fichas usan arquitectura de **5 modelos principales**: `CasoClinico` → `AtencionClinica` → `AtencionEstudiante` → `Vineta` / `Evolucion`.
- `CasoClinico`: escenario genérico reutilizable con título, tema (unidad temática) y descripción. **Sin FK a Paciente**. Creado por docentes.
- `AtencionClinica`: sesión clínica que une caso + paciente + fecha. Constraint único `(caso_clinico, paciente, fecha_atencion)`.
- `AtencionEstudiante`: asignación de un estudiante a una atención (hecha por docente). Constraint único `(atencion_clinica, estudiante)`.
- `Vineta`: inyección de contexto narrativo del docente para un estudiante específico. `contenido` TextField, `numero` secuencial. FK a `AtencionEstudiante` (CASCADE). Individual por estudiante.
- `Evolucion`: nota clínica en cadena. `contenido` es JSONField con 8 campos (`CAMPOS_CLINICOS_DEFAULT`). `tipo_autor` (ESTUDIANTE/DOCENTE), `nombre_autor` (texto libre), `numero` secuencial. FK opcional a `Vineta` (SET_NULL).
- `Paciente`: incluye perfil clínico: `sexo` (MASCULINO/FEMENINO/OTRO/NO_INFORMA), `antecedentes_personales`, `medicamentos_habituales`, `alergias`.
- **on_delete=PROTECT**: AtencionClinica→CasoClinico, AtencionClinica→Paciente, AtencionEstudiante→AtencionClinica. ViewSets retornan HTTP 409 antes de que Django lance ProtectedError.
- **on_delete=CASCADE**: Evolucion→AtencionEstudiante, Vineta→AtencionEstudiante (se borran al quitar asignación).

### Views/Serializers
- `ModelViewSet` + `DefaultRouter` (sin namespaces, rutas bajo `/api/fichas/`).
- **5 ViewSets**: `CasoClinicoViewSet`, `AtencionClinicaViewSet`, `AtencionEstudianteViewSet`, `EvolucionViewSet`, `VinetaViewSet`.
- **5 routers**: `/fichas/casos-clinicos/`, `/fichas/atenciones-clinicas/`, `/fichas/atenciones-estudiantes/`, `/fichas/evoluciones/`, `/fichas/vinetas/`.
- Permisos dinámicos en `get_permissions()`: lectura abierta a autenticados, escritura por rol.
- Filtrado smart en `get_queryset()`: admin/docente ven todo, estudiante ve solo sus asignaciones/evoluciones.
- Acciones custom con `@action`: `atenciones` (en CasoClinico), `asignar_estudiante`/`estudiantes` (en AtencionClinica), `crear_evolucion`/`evoluciones`/`crear_vineta`/`vinetas` (en AtencionEstudiante).
- Serializers asignan `creado_por`/`modificado_por`/`asignado_por` desde `request.user`.
- `EvolucionViewSet` es read + patch only (`http_method_names = ['get', 'patch', 'head', 'options']`). Creación via `crear_evolucion` action.
- `VinetaViewSet` es read + patch only. Creación via `crear_vineta` action en AtencionEstudianteViewSet (solo docentes).
- Paginación global: `StandardResultsSetPagination` (PAGE_SIZE=10).

### Testing
- **Runner**: pytest-django con `config.test_settings` (SQLite en memoria).
- **Factories**: factory-boy + Faker. Una factory por modelo en `tests/factories.py`.
- **Patrón**: `Sequence` para unicidad (email, RUT), `SubFactory` para relaciones, `LazyFunction` para JSON mutable.
- Cobertura actual: solo smoke tests. Ver `tests/README.md` de cada app para pendientes.

## Convenciones — Frontend

### Stack y config
- React 18 + TypeScript 5 (strict, `noUnusedLocals`/`noUnusedParameters`).
- Path alias: `@/` → `src/` (configurado en vite y tsconfig).
- Tailwind con tema custom: fuentes `arizona`/`worksans`, colores `aqua`/`beige`.
- Icons: `lucide-react`.

### Patrones de feature
Cada feature sigue: `pages/` + `components/` + `services/` + `types.ts`.

- **List pages**: `useState` para items/loading/search/pagination + `useEffect` con debounce de búsqueda (500ms).
- **Detail pages**: `useParams` para ID + carga en mount.
- **Form pages**: `useState` con partial data + `handleSubmit` POST/PATCH + `navigate`.
- **Services**: funciones async que usan la instancia `api` de Axios. Un archivo por feature.

### API/Auth
- Axios instance en `services/api.ts` con base `/api`.
- Interceptor de request: agrega `Bearer` token desde localStorage.
- Interceptor de response: refresh automático en 401, redirect a `/login` si falla.
- `AuthContext` expone: `user`, `isAuthenticated`, `isAdmin`, `isDocente`, `isEstudiante`, `login()`, `logout()`.
- `PaginatedResponse<T>` genérico en `types/common.ts`.

### Tipado
- Campos nullable del backend se tipan como `T | null` (no `T?`). Ver Issue #3 para contexto.
- `ContenidoClinico` usa index signature `[key: string]: string` para acceso dinámico.

## Gotchas

- **RUT dual**: validación existe en backend (`apps/common/validators.py`) y frontend (`utils/rut.ts`). `validate_rut` backend **desactivada** en MVP.
- **Token refresh hardcodeado**: `api.ts` usa ruta relativa `/api/token/refresh/` — funciona solo con proxy de Vite o Nginx.
- **Compose no expone MySQL**: puerto 3306 no mapeado al host. Para desarrollo local sin Docker, cambiar `DB_HOST=localhost` y mapear puerto.
- **`CORS_ALLOW_ALL_ORIGINS = True`**: solo desarrollo. No usar en producción.
- **on_delete=PROTECT con 409**: No se puede borrar una entidad con hijos. Los ViewSets de CasoClinico, AtencionClinica y Paciente hacen pre-check y retornan HTTP 409 Conflict con mensaje descriptivo. El frontend muestra el `detail` del backend vía Toast.
- **Arquitectura actual**: CasoClinico → AtencionClinica → AtencionEstudiante → Vineta / Evolucion. No existe modelo `Plantilla`, `Ficha`, `FichaAmbulatoria`, `FichaEstudiante` ni `FichaVersion`. Los endpoints están bajo `/api/fichas/casos-clinicos/`, `/api/fichas/atenciones-clinicas/`, `/api/fichas/atenciones-estudiantes/`, `/api/fichas/evoluciones/` y `/api/fichas/vinetas/`.

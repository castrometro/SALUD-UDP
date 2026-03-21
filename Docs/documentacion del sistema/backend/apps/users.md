# Documentación del Módulo: Users (Backend)

## Propósito
Gestiona la autenticación, autorización y el modelo de usuario personalizado. Extiende `AbstractBaseUser` de Django para incluir roles específicos del dominio.

## Modelos (`models.py`)

### `User` (Custom User Model)
Reemplaza el modelo de usuario por defecto. Usa `email` como identificador principal (`USERNAME_FIELD`).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | EmailField (unique) | Identificador para login |
| `first_name` | CharField | Nombre |
| `last_name` | CharField | Apellido |
| `rut` | CharField | RUT chileno, validado por `apps.common.validators` |
| `role` | CharField (Choices) | `ADMIN`, `DOCENTE`, `ESTUDIANTE` |
| `is_active` | Boolean | Soft delete |
| `is_staff` | Boolean | Acceso al admin de Django |
| `date_joined` | DateTimeField | Fecha de registro |

### Roles (`User.Role`)
- **ADMIN**: Acceso total al sistema y Django Admin.
- **DOCENTE**: Crea pacientes, crea plantillas (fichas base), revisa trabajo de estudiantes.
- **ESTUDIANTE**: Clona plantillas, edita sus propias fichas.

### `CustomUserManager`
Manager personalizado con `create_user()` y `create_superuser()`. Normaliza email y valida campos de staff/superuser.

## Autenticación
JWT vía `djangorestframework-simplejwt`:
- **Login**: `POST /api/token/` → recibe `email` + `password`, retorna `access` y `refresh`.
- **Refresh**: `POST /api/token/refresh/` → renueva el token de acceso.
- Configurado en `config/urls.py` usando las vistas estándar de SimpleJWT.

## Permisos (`permissions.py`)

| Clase | Lógica |
|-------|--------|
| `IsAdmin` | `user.role == 'ADMIN'` |
| `IsDocente` | `user.role == 'DOCENTE'` |
| `IsDocenteOrAdmin` | `user.role in ['ADMIN', 'DOCENTE']` |
| `IsOwnerOrDocenteOrAdmin` | Object-level: dueño (`creado_por`) o docente/admin |

## Vistas (`views.py`)

### `UserViewSet`
- CRUD completo de usuarios.
- Acción `me` (GET `/api/users/me/`): retorna datos del usuario autenticado.
- Filtra por `?role=` en query params.

### `EstudianteViewSet`
- Endpoint dedicado: `/api/users/estudiantes/`
- Filtra automáticamente `role=ESTUDIANTE`.
- Búsqueda por `first_name`, `last_name`, `rut`, `email`.
- `perform_create` fuerza `role=ESTUDIANTE`.

## Serializers (`serializers.py`)
- `UserSerializer`: Campos básicos del usuario (sin password). `role` y `is_active` de solo lectura.
- `UserCreateSerializer`: Incluye `password` (write_only). Usa `create_user()` del manager.

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/` | Lista todos los usuarios |
| GET | `/api/users/me/` | Datos del usuario autenticado |
| POST | `/api/users/` | Crear usuario |
| GET | `/api/users/estudiantes/` | Lista estudiantes con búsqueda |
| POST | `/api/users/estudiantes/` | Crear estudiante (fuerza rol) |
| POST | `/api/token/` | Login (obtener JWT) |
| POST | `/api/token/refresh/` | Renovar access token |

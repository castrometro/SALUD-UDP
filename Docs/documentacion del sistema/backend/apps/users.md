# Documentación del Módulo: Users (Backend)

## Propósito
El módulo `apps/users` gestiona la autenticación, autorización y el modelo de usuario personalizado de la aplicación. Extiende el modelo `AbstractBaseUser` de Django para incluir roles específicos de la lógica de negocio (Docente, Estudiante).

## Modelos (`models.py`)

### `User` (Custom User Model)
Reemplaza el modelo de usuario por defecto de Django. Utiliza `email` como identificador principal (USERNAME_FIELD) en lugar de `username`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | EmailField | Identificador único para el login. |
| `rut` | CharField | Identificador nacional único (validado por `apps.common.validators`). |
| `role` | CharField (Choices) | Rol del sistema: `ADMIN`, `DOCENTE`, `ESTUDIANTE`. |
| `is_active` | Boolean | Para inactivar usuarios sin borrarlos (soft delete). |

### Roles (`User.Role`)
- **ADMIN**: Acceso total al panel de administración de Django.
- **DOCENTE**: Puede crear Plantillas (Casos Clínicos) y ver el historial de los alumnos.
- **ESTUDIANTE**: Puede clonar plantillas y editar sus propias fichas.

## Autenticación
El sistema utiliza JSON Web Tokens (JWT) vía `djangorestframework-simplejwt`.
- **Login**: POST `/api/token/` recibe `email` y `password`, retorna `access` y `refresh` tokens.

## Permisos (`permissions.py`)
Clases personalizadas para restringir el acceso a vistas:
- `IsDocente`: Solo permite acceso si `request.user.role == 'DOCENTE'` (o Admin).
- `IsEstudiante`: Solo permite acceso si `request.user.role == 'ESTUDIANTE'`.
- `IsOwnerOrDocente`: Para objetos como fichas, permite ver si eres el dueño O si eres docente.

## Serializers (`serializers.py`)
- `UserSerializer`: Serializa los datos básicos del usuario, excluyendo la contraseña.
- `CustomTokenObtainPairSerializer`: Extiende el login JWT para incluir información extra en el token decodificado (ej. `role`, `full_name`) para uso del frontend.

# Documentación del Módulo: Pacientes (Backend)

## Propósito
Gestiona la base de datos de pacientes clínicos. Es central para la creación de fichas ya que toda ficha está asociada a un paciente.

## Modelos (`models.py`)

### `Paciente`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `rut` | CharField (unique) | RUT chileno validado por módulo 11 |
| `nombre` | CharField | Nombre del paciente |
| `apellido` | CharField | Apellido del paciente |
| `prevision` | CharField | FONASA / ISAPRE / PARTICULAR |
| `correo` | EmailField | Opcional |
| `numero_telefono` | CharField | Opcional |
| `fecha_nacimiento` | DateField | Requerido |
| `domicilio` | CharField | Opcional |
| `created_at` | DateTimeField | Auto |
| `updated_at` | DateTimeField | Auto |

**Lógica clave:**
- `edad`: Property calculada dinámicamente desde `fecha_nacimiento`.
- `save()`: Formatea el RUT automáticamente al guardar (ej. `12.345.678-9`).

## Serializer (`serializers.py`)
- `PacienteSerializer`: Serializa todos los campos + `edad` como campo de solo lectura.

## Vistas (`views.py`)
- `PacienteViewSet`: ModelViewSet estándar con búsqueda y permisos por acción.

## Endpoints

| Método | Endpoint | Rol requerido | Descripción |
|--------|----------|---------------|-------------|
| GET | `/api/pacientes/` | Autenticado | Lista paginada |
| GET | `/api/pacientes/?search=...` | Autenticado | Búsqueda por nombre, apellido o RUT |
| GET | `/api/pacientes/{id}/` | Autenticado | Detalle |
| POST | `/api/pacientes/` | Docente/Admin | Crear paciente |
| PUT | `/api/pacientes/{id}/` | Docente/Admin | Actualizar |
| DELETE | `/api/pacientes/{id}/` | Docente/Admin | Eliminar |

## Permisos
- **Lectura**: Cualquier usuario autenticado (estudiantes necesitan ver pacientes para acceder a fichas).
- **Escritura**: Solo `IsDocenteOrAdmin`.

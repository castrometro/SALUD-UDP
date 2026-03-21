# Documentación del Módulo: Fichas (Backend)

## Propósito
Núcleo del sistema. Gestiona fichas clínicas ambulatorias con dos conceptos principales:
1. **Plantillas (Ficha Base)**: Casos clínicos creados por docentes.
2. **Fichas de Estudiantes**: Copias de plantillas que los estudiantes completan.

## Modelos (`models.py`)

### `FichaAmbulatoria`
Modelo principal con estructura recursiva (self-referencing FK).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `paciente` | FK → Paciente | Paciente asociado al caso |
| `es_plantilla` | Boolean | `True` si es creada por docente |
| `ficha_base` | FK → self | Referencia a la plantilla original (null si es plantilla) |
| `estudiante` | FK → User | Dueño de la ficha (null si es plantilla) |
| `creado_por` | FK → User | Quién la creó |
| `modificado_por` | FK → User | Última persona que la modificó |
| `motivo_consulta` | TextField | Campo clínico |
| `anamnesis` | TextField | Campo clínico |
| `examen_fisico` | TextField | Campo clínico |
| `diagnostico` | TextField | Campo clínico |
| `intervenciones` | TextField | Campo clínico |
| `factores` | TextField | Campo clínico |
| `rau_necesidades` | TextField | Campo clínico |
| `instrumentos_aplicados` | TextField | Campo clínico |

**Constraint**: `UniqueConstraint(fields=['ficha_base', 'estudiante'])` — un estudiante solo puede tener una copia por plantilla.

### `FichaHistorial`
Control de versiones manual. Cada vez que se actualiza una ficha, se guarda un snapshot del estado anterior.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ficha` | FK → FichaAmbulatoria | Ficha versionada |
| `version` | PositiveInteger | Número de versión |
| `modificado_por` | FK → User | Quién modificó |
| `fecha` | DateTimeField | Timestamp del snapshot |
| Campos clínicos | TextField | Copia de los 8 campos al momento de la modificación |

## Serializers (`serializers.py`)

### `FichaAmbulatoriaSerializer`
- Campos anidados de solo lectura: `paciente_detail`, `creado_por_nombre`, `estudiante_nombre`.
- `ficha_base_info`: Método que retorna id, fecha y autor de la plantilla padre.
- `total_versiones`: Count del historial.
- **En `update()`**: Guarda automáticamente el estado anterior en `FichaHistorial` antes de aplicar cambios.

### `CrearFichaEstudianteSerializer`
- Recibe `ficha_base_id`.
- Valida que la plantilla exista y que el estudiante no tenga ya una copia.
- Crea una copia profunda de la plantilla con los 8 campos clínicos.

## Vistas (`views.py`)

### `FichaAmbulatoriaViewSet`

**Filtrado por rol en `get_queryset()`:**
- Admin/Docente: ven todas las fichas.
- Estudiante: solo plantillas + sus propias fichas.

**Query params:**
- `?paciente={id}` — filtrar por paciente.
- `?plantillas=true` — solo plantillas.
- `?estudiante={id}` — fichas de un estudiante específico (solo docentes).

## Endpoints

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/` | Autenticado | Lista fichas (filtrada por rol) |
| POST | `/api/fichas/` | Autenticado | Crear ficha (plantilla si docente, propia si estudiante) |
| GET | `/api/fichas/{id}/` | Autenticado | Detalle de ficha |
| PUT | `/api/fichas/{id}/` | Dueño/Docente/Admin | Editar ficha (genera historial) |
| DELETE | `/api/fichas/{id}/` | Dueño/Docente/Admin | Eliminar ficha |
| POST | `/api/fichas/crear_mi_ficha/` | Estudiante | Clonar plantilla para el estudiante |
| GET | `/api/fichas/{id}/historial/` | Autenticado | Versiones históricas de una ficha |
| GET | `/api/fichas/{id}/fichas_estudiantes/` | Docente/Admin | Copias de alumnos de una plantilla |
| GET | `/api/fichas/{id}/mi_ficha/` | Estudiante | Obtener ficha propia para una plantilla |

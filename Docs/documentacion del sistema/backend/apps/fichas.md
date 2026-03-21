# Documentación del Módulo: Fichas (Backend)

## Propósito
Núcleo del sistema. Gestiona fichas clínicas con dos conceptos principales:
1. **Plantillas (Ficha Base)**: Casos clínicos creados por docentes.
2. **Fichas de Estudiantes**: Copias de plantillas que los estudiantes completan.

El contenido clínico se almacena como **JSONField**, lo que permite:
- Diferentes estructuras de campos según el tipo de atención (futuro).
- Agregar/quitar campos clínicos sin migraciones.
- Historial de versiones sin duplicación de columnas.

## Modelos (`models.py`)

### `Ficha`
Modelo principal con estructura recursiva (self-referencing FK).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `paciente` | FK → Paciente | Paciente asociado al caso. `on_delete=PROTECT` (no se puede borrar un paciente con fichas) |
| `es_plantilla` | Boolean | `True` si es creada por docente |
| `ficha_base` | FK → self | Referencia a la plantilla original (null si es plantilla). `on_delete=PROTECT` |
| `estudiante` | FK → User | Dueño de la ficha (null si es plantilla). `on_delete=SET_NULL` |
| `contenido` | JSONField | Campos clínicos en formato JSON (ver estructura abajo) |
| `creado_por` | FK → User | Quién la creó. `on_delete=SET_NULL` |
| `modificado_por` | FK → User | Última persona que la modificó. `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | Auto |
| `fecha_modificacion` | DateTimeField | Auto |

**Estructura de `contenido` (MVP ambulatorio):**
```json
{
    "motivo_consulta": "",
    "anamnesis": "",
    "examen_fisico": "",
    "diagnostico": "",
    "intervenciones": "",
    "factores": "",
    "rau_necesidades": "",
    "instrumentos_aplicados": ""
}
```

**Constraint**: `UniqueConstraint(fields=['ficha_base', 'estudiante'])` — un estudiante solo puede tener una copia por plantilla.

**Constante**: `CAMPOS_CLINICOS_DEFAULT` — diccionario con la estructura por defecto del contenido para el MVP.

### `FichaVersion`
Control de versiones. Cada vez que se actualiza una ficha, se guarda un snapshot del estado anterior.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ficha` | FK → Ficha | Ficha versionada |
| `version` | PositiveInteger | Número de versión |
| `autor` | FK → User | Quién hizo la modificación |
| `rol_autor` | CharField(20) | Rol con el que actuó (ESTUDIANTE, DOCENTE, etc.) |
| `fecha` | DateTimeField | Timestamp del snapshot |
| `contenido` | JSONField | Snapshot completo del contenido clínico al momento de la modificación |

**Constraint**: `UniqueConstraint(fields=['ficha', 'version'])`.

## Serializers (`serializers.py`)

### `FichaSerializer`
- Campos anidados de solo lectura: `paciente_detail`, `creado_por_nombre`, `estudiante_nombre`.
- `ficha_base_info`: Método que retorna id, fecha y autor de la plantilla padre.
- `total_versiones`: Count de versiones.
- **En `create()`**: Si no viene `contenido`, asigna `CAMPOS_CLINICOS_DEFAULT`.
- **En `update()`**: Guarda automáticamente el estado anterior como `FichaVersion` antes de aplicar cambios. Registra `rol_autor` del usuario.

### `CrearFichaEstudianteSerializer`
- Recibe `ficha_base_id`.
- Valida que la plantilla exista y que el estudiante no tenga ya una copia.
- Crea una copia con el `contenido` JSON de la plantilla.

## Vistas (`views.py`)

### `FichaViewSet`

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
| PUT | `/api/fichas/{id}/` | Dueño/Docente/Admin | Editar ficha (genera versión en historial) |
| DELETE | `/api/fichas/{id}/` | Dueño/Docente/Admin | Eliminar ficha |
| POST | `/api/fichas/crear_mi_ficha/` | Estudiante | Clonar plantilla para el estudiante |
| GET | `/api/fichas/{id}/historial/` | Autenticado | Versiones históricas de una ficha |
| GET | `/api/fichas/{id}/fichas_estudiantes/` | Docente/Admin | Copias de alumnos de una plantilla |
| GET | `/api/fichas/{id}/mi_ficha/` | Estudiante | Obtener ficha propia para una plantilla |

## Escalabilidad futura

Para soportar múltiples tipos de atención (Ambulatoria, Intrahospitalaria, etc.):

1. Agregar campo `tipo_atencion = CharField(choices=TipoAtencion.choices)` al modelo `Ficha`.
2. El `contenido` JSON tiene estructura diferente según el tipo.
3. La validación de la estructura puede hacerse en el serializer con un diccionario `CAMPOS_POR_TIPO`.
4. **No se necesitan modelos nuevos ni migraciones de estructura.**

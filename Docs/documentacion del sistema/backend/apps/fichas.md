# Documentación del Módulo: Fichas (Backend)

## Propósito
Núcleo del sistema. Gestiona fichas clínicas de simulación con una arquitectura de 3 modelos separados:
1. **Plantilla**: Caso clínico base creado por docentes (define el contenido clínico inicial).
2. **CasoClinico**: Vincula una Plantilla con un Paciente específico.
3. **FichaEstudiante**: Copia del caso que cada estudiante completa individualmente.

El contenido clínico se almacena como **JSONField**, lo que permite:
- Diferentes estructuras de campos según el tipo de atención (futuro).
- Agregar/quitar campos clínicos sin migraciones.
- Historial de versiones sin duplicación de columnas.

## Modelos (`models.py`)

### `Plantilla`
Caso clínico base. Contiene los campos clínicos iniciales y metadatos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | CharField(255) | Nombre descriptivo del caso |
| `descripcion` | TextField | Descripción del caso clínico |
| `contenido` | JSONField | Campos clínicos en formato JSON (ver estructura abajo) |
| `creado_por` | FK → User | Quién la creó. `on_delete=SET_NULL` |
| `modificado_por` | FK → User | Última persona que la modificó. `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | `auto_now_add` |
| `fecha_modificacion` | DateTimeField | `auto_now` |

**Ordering**: `-fecha_creacion`

### `CasoClinico`
Vinculación entre una Plantilla y un Paciente. Permite que una misma Plantilla se use con distintos pacientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `plantilla` | FK → Plantilla | Plantilla asociada. `on_delete=PROTECT` |
| `paciente` | FK → Paciente | Paciente del caso. `on_delete=PROTECT` |
| `creado_por` | FK → User | Quién lo creó. `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | `auto_now_add` |

**Constraint**: `UniqueConstraint(fields=['plantilla', 'paciente'])` — un paciente solo puede estar en un caso por plantilla.
**Ordering**: `-fecha_creacion`

### `FichaEstudiante`
Ficha individual del estudiante. Copia el contenido clínico de la Plantilla del caso para que el estudiante lo complete.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `caso_clinico` | FK → CasoClinico | Caso al que pertenece. `on_delete=PROTECT` |
| `estudiante` | FK → User | Estudiante dueño. `on_delete=SET_NULL` |
| `contenido` | JSONField | Campos clínicos del estudiante |
| `creado_por` | FK → User | Quién la creó. `on_delete=SET_NULL` |
| `modificado_por` | FK → User | Última persona que la modificó. `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | `auto_now_add` |
| `fecha_modificacion` | DateTimeField | `auto_now` |

**Constraint**: `UniqueConstraint(fields=['caso_clinico', 'estudiante'], condition=Q(estudiante__isnull=False))` — un estudiante solo puede tener una ficha por caso clínico.
**Ordering**: `-fecha_creacion`

### `FichaVersion`
Control de versiones. Cada vez que se actualiza una FichaEstudiante, se guarda un snapshot del estado anterior.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ficha` | FK → FichaEstudiante | Ficha versionada. `on_delete=CASCADE` |
| `version` | PositiveInteger | Número de versión (autoincremental) |
| `autor` | FK → User | Quién hizo la modificación. `on_delete=SET_NULL` |
| `rol_autor` | CharField(20) | Rol con el que actuó (ESTUDIANTE, DOCENTE, etc.) |
| `fecha` | DateTimeField | `auto_now_add` |
| `contenido` | JSONField | Snapshot completo del contenido clínico |

**Constraint**: `UniqueConstraint(fields=['ficha', 'version'])`.
**Ordering**: `-version`

### Estructura de `contenido` (MVP ambulatorio)
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

**Constante**: `CAMPOS_CLINICOS_DEFAULT` — diccionario con la estructura por defecto del contenido.

## Serializers (`serializers.py`)

### `PlantillaSerializer`
- Campos de solo lectura: `creado_por`, `modificado_por`, `fecha_creacion`, `fecha_modificacion`.
- Campos calculados: `creado_por_nombre`, `modificado_por_nombre`, `total_casos` (count de CasosClinicos), `total_estudiantes` (count de FichasEstudiantes a través de casos).
- **En `create()`**: Asigna `creado_por=request.user`. Si no viene `contenido`, asigna `CAMPOS_CLINICOS_DEFAULT`.
- **En `update()`**: Asigna `modificado_por=request.user`.

### `CasoClinicoSerializer`
- Campos de solo lectura: `creado_por`, `fecha_creacion`.
- Campos anidados: `paciente_detail` (PacienteSerializer), `plantilla_titulo`.
- Campos calculados: `creado_por_nombre`, `total_estudiantes`.
- **En `create()`**: Asigna `creado_por=request.user`.

### `FichaEstudianteSerializer`
- Campos de solo lectura: `creado_por`, `modificado_por`, `fecha_creacion`, `fecha_modificacion`.
- Campos anidados: `caso_clinico_detail` (CasoClinicoSerializer), `estudiante_nombre`, `creado_por_nombre`, `modificado_por_nombre`.
- Campos calculados: `total_versiones`.
- **En `create()`**: Asigna `creado_por=request.user`. Copia `contenido` de la plantilla del caso o usa `CAMPOS_CLINICOS_DEFAULT`.
- **En `update()`**: Guarda automáticamente el estado anterior como `FichaVersion` (método `_guardar_version()`) antes de aplicar cambios. Registra `rol_autor` del usuario. Asigna `modificado_por=request.user`.

### `FichaVersionSerializer`
- Campos: todos del modelo + `autor_nombre`.

### `CrearFichaEstudianteSerializer`
- Recibe `caso_clinico_id`.
- Valida que el caso exista.
- Crea FichaEstudiante con `estudiante=request.user`, copia contenido de la plantilla del caso.
- El constraint de unicidad en BD previene duplicados.

## Vistas (`views.py`)

### `PlantillaViewSet`
- **queryset**: Todas las plantillas con `select_related('creado_por', 'modificado_por')`.
- **Permisos**: `IsAuthenticated` para lectura, `IsAuthenticated + IsOwnerOrDocenteOrAdmin` para escritura.
- **destroy()**: Retorna HTTP **409 Conflict** si la plantilla tiene casos clínicos asociados. Mensaje descriptivo en español.

### `CasoClinicoViewSet`
- **queryset**: Todos los casos con `select_related` múltiple.
- **Permisos**: `IsAuthenticated` para lectura, `IsAuthenticated + IsOwnerOrDocenteOrAdmin` para escritura.
- **Query params**: `?plantilla={id}`, `?paciente={id}`.
- **destroy()**: Retorna HTTP **409 Conflict** si el caso tiene fichas de estudiantes asociadas.
- **Acción custom**: `@action(detail=True) fichas_estudiantes/` — lista paginada de FichasEstudiantes del caso.

### `FichaEstudianteViewSet`
- **queryset**: Todas las fichas con `select_related` complejo encadenado.
- **Permisos**: `IsAuthenticated` para lectura, `IsAuthenticated + IsOwnerOrDocenteOrAdmin` para update/destroy.
- **Filtrado por rol**: Estudiante solo ve sus fichas. Docente/Admin ven todas.
- **Query params**: `?caso_clinico={id}`, `?estudiante={id}` (solo docentes).
- **Acciones custom**:
  - `crear_mi_ficha/` (POST, detail=False): Crea ficha para el usuario actual en un caso.
  - `historial/` (GET, detail=True): Retorna FichaVersions de la ficha.
  - `mi_ficha/` (GET, detail=False, `?caso_clinico={id}`): Retorna la ficha del usuario en un caso, 404 si no existe.

## Endpoints

### Plantillas
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/plantillas/` | Autenticado | Lista plantillas (paginada) |
| POST | `/api/fichas/plantillas/` | Docente/Admin | Crear plantilla |
| GET | `/api/fichas/plantillas/{id}/` | Autenticado | Detalle de plantilla |
| PUT/PATCH | `/api/fichas/plantillas/{id}/` | Dueño/Docente/Admin | Editar plantilla |
| DELETE | `/api/fichas/plantillas/{id}/` | Dueño/Docente/Admin | Eliminar (409 si tiene casos) |

### Casos Clínicos
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/casos-clinicos/` | Autenticado | Lista casos clínicos |
| POST | `/api/fichas/casos-clinicos/` | Docente/Admin | Crear caso (vincular plantilla+paciente) |
| GET | `/api/fichas/casos-clinicos/{id}/` | Autenticado | Detalle del caso |
| DELETE | `/api/fichas/casos-clinicos/{id}/` | Dueño/Docente/Admin | Eliminar (409 si tiene fichas) |
| GET | `/api/fichas/casos-clinicos/{id}/fichas_estudiantes/` | Docente/Admin | Fichas de estudiantes del caso |

### Fichas de Estudiantes
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/fichas-estudiantes/` | Autenticado | Lista fichas (filtrada por rol) |
| GET | `/api/fichas/fichas-estudiantes/{id}/` | Autenticado | Detalle de ficha |
| PUT/PATCH | `/api/fichas/fichas-estudiantes/{id}/` | Dueño/Docente/Admin | Editar (genera versión) |
| DELETE | `/api/fichas/fichas-estudiantes/{id}/` | Dueño/Docente/Admin | Eliminar ficha |
| POST | `/api/fichas/fichas-estudiantes/crear_mi_ficha/` | Estudiante | Clonar caso para el estudiante |
| GET | `/api/fichas/fichas-estudiantes/{id}/historial/` | Autenticado | Versiones históricas |
| GET | `/api/fichas/fichas-estudiantes/mi_ficha/?caso_clinico={id}` | Estudiante | Ficha propia en un caso |

## Relaciones y protección de datos

```
Plantilla ──(1:N)──→ CasoClinico ──(1:N)──→ FichaEstudiante ──(1:N)──→ FichaVersion
                         │
                    Paciente (1:N)
```

| Relación | on_delete | Efecto |
|----------|-----------|--------|
| CasoClinico → Plantilla | `PROTECT` | No se puede borrar plantilla con casos (backend retorna 409) |
| CasoClinico → Paciente | `PROTECT` | No se puede borrar paciente con casos (backend retorna 409) |
| FichaEstudiante → CasoClinico | `PROTECT` | No se puede borrar caso con fichas (backend retorna 409) |
| FichaEstudiante → Estudiante | `SET_NULL` | Si se borra usuario, fichas se conservan |
| FichaVersion → FichaEstudiante | `CASCADE` | Si se borra ficha, se borran sus versiones |
| *.creado_por / *.modificado_por | `SET_NULL` | Trazabilidad se conserva como null |

## Escalabilidad futura

Para soportar múltiples tipos de atención (Ambulatoria, Intrahospitalaria, etc.):

1. Agregar campo `tipo_atencion` a `Plantilla`.
2. El `contenido` JSON tiene estructura diferente según el tipo.
3. La validación de la estructura puede hacerse en el serializer con un diccionario `CAMPOS_POR_TIPO`.
4. **No se necesitan modelos nuevos ni migraciones de estructura.**

# Documentación del Módulo: Fichas (Backend)

## Propósito
Núcleo del sistema. Gestiona fichas clínicas de simulación con una arquitectura de 5 modelos principales:
1. **CasoClinico**: Escenario genérico reutilizable creado por docentes (sin paciente asociado).
2. **AtencionClinica**: Sesión clínica que une caso + paciente + fecha.
3. **AtencionEstudiante**: Asignación de un estudiante a una atención (hecha por el docente).
4. **Vineta**: Inyección de contexto narrativo del docente, individual por estudiante.
5. **Evolucion**: Nota clínica en cadena, escrita por estudiantes o docentes.

El contenido clínico se almacena como **JSONField**, lo que permite:
- Diferentes estructuras de campos según el tipo de atención (futuro).
- Agregar/quitar campos clínicos sin migraciones.

## Modelos (`models.py`)

### `CasoClinico`
Escenario genérico reutilizable. **No tiene FK a Paciente** — el paciente se asigna al crear una AtencionClinica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | CharField(255) | Nombre descriptivo del caso |
| `tema` | CharField(255) | Unidad temática o curricular (opcional) |
| `descripcion` | TextField | Descripción narrativa del escenario clínico |
| `creado_por` | FK → User | Quién lo creó. `on_delete=SET_NULL` |
| `modificado_por` | FK → User | Última persona que lo modificó. `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | `auto_now_add` |
| `fecha_modificacion` | DateTimeField | `auto_now` |

**Ordering**: `-fecha_creacion`

### `AtencionClinica`
Sesión clínica: une un caso con un paciente en una fecha específica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `caso_clinico` | FK → CasoClinico | Caso asociado. `on_delete=PROTECT` |
| `paciente` | FK → Paciente | Paciente de la sesión. `on_delete=PROTECT` |
| `fecha_atencion` | DateField | Fecha de la sesión clínica |
| `creado_por` | FK → User | `on_delete=SET_NULL` |
| `modificado_por` | FK → User | `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | `auto_now_add` |
| `fecha_modificacion` | DateTimeField | `auto_now` |

**Constraint**: `UniqueConstraint(fields=['caso_clinico', 'paciente', 'fecha_atencion'])`.
**Ordering**: `-fecha_atencion`

### `AtencionEstudiante`
Asignación de un estudiante a una atención clínica (hecha por el docente).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `atencion_clinica` | FK → AtencionClinica | Atención asociada. `on_delete=PROTECT` |
| `estudiante` | FK → User | Estudiante asignado. `on_delete=SET_NULL` |
| `asignado_por` | FK → User | Docente que hizo la asignación. `on_delete=SET_NULL` |
| `fecha_asignacion` | DateTimeField | `auto_now_add` |

**Constraint**: `UniqueConstraint(fields=['atencion_clinica', 'estudiante'], condition=Q(estudiante__isnull=False))`.
**Ordering**: `-fecha_asignacion`

### `TipoAutor` (TextChoices)
`ESTUDIANTE`, `DOCENTE` — rol con el que se creó la evolución.

### `Evolucion`
Nota clínica en cadena dentro de una asignación estudiante-atención.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `atencion_estudiante` | FK → AtencionEstudiante | Asignación. `on_delete=CASCADE` |
| `vineta` | FK → Vineta | Viñeta a la que responde (opcional). `on_delete=SET_NULL` |
| `numero` | PositiveIntegerField | Número secuencial dentro de la asignación |
| `contenido` | JSONField | Campos clínicos (8 campos por defecto) |
| `tipo_autor` | CharField(20) | `TipoAutor` choices |
| `nombre_autor` | CharField(255) | Nombre visible del autor (texto libre) |
| `creado_por` | FK → User | `on_delete=SET_NULL` |
| `fecha_creacion` | DateTimeField | `auto_now_add` |

**Constraint**: `UniqueConstraint(fields=['atencion_estudiante', 'numero'])`.
**Ordering**: `numero` (ascendente)

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

### `Vineta`
Inyección de contexto narrativo del docente para un estudiante específico (individual por asignación).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `atencion_estudiante` | FK → AtencionEstudiante | Asignación. `on_delete=CASCADE` |
| `numero` | PositiveIntegerField | Número secuencial de la viñeta |
| `contenido` | TextField | Texto narrativo (motivo de consulta, resultados, etc.) |
| `creada_por` | FK → User | Docente que la creó. `on_delete=SET_NULL` |
| `created_at` | DateTimeField | `auto_now_add` |

**Constraint**: `UniqueConstraint(fields=['atencion_estudiante', 'numero'])`.
**Ordering**: `numero` (ascendente)

## Serializers (`serializers.py`)

### `CasoClinicoSerializer`
- Campos de solo lectura: `creado_por`, `modificado_por`, `fecha_creacion`, `fecha_modificacion`.
- Campos calculados: `creado_por_nombre`, `modificado_por_nombre`, `total_atenciones`.
- **En `create()`**: Asigna `creado_por=request.user`.
- **En `update()`**: Asigna `modificado_por=request.user`.

### `AtencionClinicaSerializer`
- Campos de solo lectura: `creado_por`, `modificado_por`, `fecha_creacion`, `fecha_modificacion`.
- Campos anidados: `caso_clinico_detail` (CasoClinicoSerializer), `paciente_detail` (PacienteSerializer).
- Campos calculados: `creado_por_nombre`, `modificado_por_nombre`, `total_estudiantes`.
- **En `create()`**: Asigna `creado_por=request.user`.
- **En `update()`**: Asigna `modificado_por=request.user`.

### `AtencionEstudianteSerializer`
- Campos anidados: `atencion_clinica_detail` (AtencionClinicaSerializer, read_only).
- Campos calculados: `estudiante_nombre`, `asignado_por_nombre`, `total_evoluciones`.
- **En `create()`**: Asigna `asignado_por=request.user`.

### `EvolucionSerializer`
- Campos calculados: `creado_por_nombre`.
- Read-only: `numero`, `creado_por`, `fecha_creacion`.
- **En `create()`**: Auto-calcula `numero` secuencial, asigna `creado_por`, auto-rellena `nombre_autor` y `contenido` si no se proporcionan.

### `VinetaSerializer`
- Campos calculados: `creada_por_nombre`.
- Read-only: `numero`, `creada_por`, `created_at`.
- **En `create()`**: Auto-calcula `numero` secuencial, asigna `creada_por`.

### `AsignarEstudianteSerializer`
- Recibe `estudiante_id`. Valida existencia y rol ESTUDIANTE.

### `CrearEvolucionSerializer`
- Recibe `contenido` (opcional), `tipo_autor` (obligatorio), `nombre_autor` (opcional), `vineta` (ID opcional).

### `CrearVinetaSerializer`
- Recibe `contenido` (obligatorio). Solo docentes pueden crear viñetas.

## Vistas (`views.py`)

### `CasoClinicoViewSet`
- **queryset**: Casos con `select_related` + `annotate(total_atenciones)`.
- **Permisos**: `IsAuthenticated` para lectura, `IsOwnerOrDocenteOrAdmin` para escritura.
- **Búsqueda**: `?search=` filtra por titulo y descripcion.
- **destroy()**: Retorna HTTP **409 Conflict** si tiene atenciones asociadas.
- **Acción custom**: `@action(detail=True) atenciones/` — lista paginada de AtencionesClinicas del caso.

### `AtencionClinicaViewSet`
- **queryset**: Atenciones con `select_related` + `annotate(total_estudiantes)`.
- **Permisos**: `IsAuthenticated` para lectura, `IsOwnerOrDocenteOrAdmin` para escritura.
- **Filtrado por rol**: Estudiante solo ve atenciones donde está asignado. `?caso_clinico=`, `?paciente=`.
- **destroy()**: Retorna HTTP **409 Conflict** si tiene asignaciones.
- **Acciones custom**:
  - `asignar_estudiante/` (POST, detail=True): Asigna estudiante a la atención. Body: `{ "estudiante_id": 123 }`.
  - `estudiantes/` (GET, detail=True): Lista paginada de AtencionesEstudiante de la atención.

### `AtencionEstudianteViewSet`
- **queryset**: Asignaciones con `select_related` complejo + `annotate(total_evoluciones)`.
- **Filtrado por rol**: Estudiante solo ve las suyas. `?atencion_clinica=`, `?estudiante=`.
- **Acciones custom**:
  - `crear_evolucion/` (POST, detail=True): Crea evolución. Valida permisos por rol.
  - `evoluciones/` (GET, detail=True): Lista evoluciones de la asignación (sin paginar, ordenadas por `numero`).
  - `crear_vineta/` (POST, detail=True): Crea viñeta. Solo docentes/admin.
  - `vinetas/` (GET, detail=True): Lista viñetas de la asignación (sin paginar, ordenadas por `numero`).

### `VinetaViewSet`
- **http_method_names**: `['get', 'patch', 'head', 'options']` — solo lectura + actualización parcial.
- **Filtrado por rol**: Estudiante solo ve viñetas de sus asignaciones. `?atencion_estudiante=`.
- **Permisos**: `IsOwnerOrDocenteOrAdmin` para `partial_update`.

### `EvolucionViewSet`
- **http_method_names**: `['get', 'patch', 'head', 'options']` — solo lectura + actualización parcial.
- **Filtrado por rol**: Estudiante solo ve sus evoluciones. `?atencion_estudiante=`.
- **Permisos**: `IsOwnerOrDocenteOrAdmin` para `partial_update`.

## Endpoints

### Casos Clínicos
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/casos-clinicos/` | Autenticado | Lista (paginada, `?search=`) |
| POST | `/api/fichas/casos-clinicos/` | Docente/Admin | Crear caso clínico |
| GET | `/api/fichas/casos-clinicos/{id}/` | Autenticado | Detalle |
| PUT/PATCH | `/api/fichas/casos-clinicos/{id}/` | Dueño/Docente/Admin | Editar |
| DELETE | `/api/fichas/casos-clinicos/{id}/` | Dueño/Docente/Admin | Eliminar (409 si tiene atenciones) |
| GET | `/api/fichas/casos-clinicos/{id}/atenciones/` | Autenticado | Atenciones del caso (paginada) |

### Atenciones Clínicas
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/atenciones-clinicas/` | Autenticado | Lista (filtrada por rol, `?caso_clinico=`, `?paciente=`) |
| POST | `/api/fichas/atenciones-clinicas/` | Docente/Admin | Crear atención |
| GET | `/api/fichas/atenciones-clinicas/{id}/` | Autenticado | Detalle |
| PUT/PATCH | `/api/fichas/atenciones-clinicas/{id}/` | Dueño/Docente/Admin | Editar |
| DELETE | `/api/fichas/atenciones-clinicas/{id}/` | Dueño/Docente/Admin | Eliminar (409 si tiene asignaciones) |
| POST | `/api/fichas/atenciones-clinicas/{id}/asignar_estudiante/` | Docente/Admin | Asignar estudiante |
| GET | `/api/fichas/atenciones-clinicas/{id}/estudiantes/` | Autenticado | Estudiantes asignados (paginada) |

### Atenciones Estudiantes
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/atenciones-estudiantes/` | Autenticado | Lista (filtrada por rol, `?atencion_clinica=`, `?estudiante=`) |
| GET | `/api/fichas/atenciones-estudiantes/{id}/` | Autenticado | Detalle |
| DELETE | `/api/fichas/atenciones-estudiantes/{id}/` | Docente/Admin | Eliminar asignación (cascade borra evoluciones) |
| POST | `/api/fichas/atenciones-estudiantes/{id}/crear_evolucion/` | Autenticado | Crear evolución |
| GET | `/api/fichas/atenciones-estudiantes/{id}/evoluciones/` | Autenticado | Evoluciones de la asignación |
| POST | `/api/fichas/atenciones-estudiantes/{id}/crear_vineta/` | Docente/Admin | Crear viñeta |
| GET | `/api/fichas/atenciones-estudiantes/{id}/vinetas/` | Autenticado | Viñetas de la asignación |

### Viñetas
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/vinetas/` | Autenticado | Lista (filtrada por rol, `?atencion_estudiante=`) |
| GET | `/api/fichas/vinetas/{id}/` | Autenticado | Detalle |
| PATCH | `/api/fichas/vinetas/{id}/` | Dueño/Docente/Admin | Editar contenido |

### Evoluciones
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/api/fichas/evoluciones/` | Autenticado | Lista (filtrada por rol, `?atencion_estudiante=`) |
| GET | `/api/fichas/evoluciones/{id}/` | Autenticado | Detalle |
| PATCH | `/api/fichas/evoluciones/{id}/` | Dueño/Docente/Admin | Editar contenido |

## Relaciones y protección de datos

```
CasoClinico ──(1:N)──→ AtencionClinica ──(1:N)──→ AtencionEstudiante ──(1:N)──→ Evolucion
                            │                                       │
                       Paciente (N:1)                          Vineta (1:N)
```

| Relación | on_delete | Efecto |
|----------|-----------|--------|
| AtencionClinica → CasoClinico | `PROTECT` | No se puede borrar caso con atenciones (409) |
| AtencionClinica → Paciente | `PROTECT` | No se puede borrar paciente con atenciones (409) |
| AtencionEstudiante → AtencionClinica | `PROTECT` | No se puede borrar atención con asignaciones (409) |
| AtencionEstudiante → Estudiante | `SET_NULL` | Si se borra usuario, asignación se conserva |
| Evolucion → AtencionEstudiante | `CASCADE` | Si se borra asignación, se borran evoluciones |
| Evolucion → Vineta | `SET_NULL` | Si se borra viñeta, evolución se conserva |
| Vineta → AtencionEstudiante | `CASCADE` | Si se borra asignación, se borran viñetas |
| *.creado_por / *.modificado_por / *.asignado_por | `SET_NULL` | Trazabilidad se conserva como null |

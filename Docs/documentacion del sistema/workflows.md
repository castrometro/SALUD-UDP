# Flujos Críticos: Fichas Clínicas

Este documento describe el ciclo de vida completo de las fichas clínicas, desde la creación del Caso Clínico hasta las evoluciones clínicas.

## Arquitectura de 5 Modelos Principales

```
CasoClinico ──(1:N)──→ AtencionClinica ──(1:N)──→ AtencionEstudiante ──(1:N)──→ Evolucion
                            │                                       │
                       Paciente (N:1)                          Vineta (1:N)
```

- **CasoClinico**: Escenario genérico reutilizable con título, tema y descripción. **Sin FK a Paciente**. Creado por docentes.
- **AtencionClinica**: Sesión clínica que une caso + paciente + fecha. Constraint único `(caso_clinico, paciente, fecha_atencion)`.
- **AtencionEstudiante**: Asignación de un estudiante a una atención (hecha por docente). Constraint único `(atencion_clinica, estudiante)`.
- **Vineta**: Inyección de contexto narrativo del docente, individual por estudiante. Contenido TextField, número secuencial. FK a AtencionEstudiante (CASCADE).
- **Evolucion**: Nota clínica en cadena. Contenido JSONField con 9 campos (incluye `indicaciones`). `tipo_autor` (ESTUDIANTE/DOCENTE), `nombre_autor` (texto libre), `numero` secuencial, `entregada` (bool, bloqueo irreversible). FK opcional a Vineta (SET_NULL).

## Diagrama de Flujo

```mermaid
graph TD
    A[Docente crea Caso Clínico] -->|POST /api/fichas/casos-clinicos/\ncon titulo + tema + descripcion| B(CasoClinico en BD)
    B --> C[Docente crea Atención Clínica]
    C -->|POST /api/fichas/atenciones-clinicas/\ncon caso_clinico + paciente + fecha| D(AtencionClinica en BD)
    D --> E[Docente asigna estudiantes]
    E -->|POST /atenciones-clinicas/{id}/asignar_estudiante/\ncon estudiante_id| F(AtencionEstudiante en BD)
    F --> G[Estudiante ve su asignación en /mi-clinica]
    G --> H[Estudiante crea evolución]
    H -->|POST /atenciones-estudiantes/{id}/crear_evolucion/\ncon contenido + tipo_autor| I(Evolucion #1 creada)
    I --> J[Docente crea evolución como Doctor]
    J -->|POST /atenciones-estudiantes/{id}/crear_evolucion/\ncon tipo_autor=DOCENTE + nombre_autor| K(Evolucion #2 creada)
    K --> L[Estudiante ve evolución del docente]
    L --> H
    I --> M2[Estudiante entrega evolución]
    M2 -->|POST /evoluciones/{id}/entregar/| M3(Evolución entregada - edición bloqueada)
    F --> M[Docente crea viñeta]
    M -->|POST /atenciones-estudiantes/{id}/crear_vineta/\ncon contenido narrativo| N(Vineta #1 creada)
    N --> G
```

## 1. Creación de Caso Clínico (Rol: Docente)
- El docente navega a `/casos-clinicos/nuevo`.
- Completa título, tema (unidad temática, opcional) y descripción narrativa del escenario clínico.
- **No selecciona paciente** — el caso es genérico y reutilizable.
- Al guardar, el backend crea un `CasoClinico` con `creado_por=docente`.

## 2. Creación de Atención Clínica (Rol: Docente)
- Dentro de un caso clínico, el docente crea una atención.
- Selecciona un paciente y una fecha de atención.
- El backend crea un `AtencionClinica` vinculando caso + paciente + fecha.
- Un mismo caso puede tener múltiples atenciones con distintos pacientes o fechas.

## 3. Asignación de Estudiantes (Rol: Docente)
- Dentro de una atención clínica, el docente asigna estudiantes.
- Endpoint: `POST /api/fichas/atenciones-clinicas/{id}/asignar_estudiante/` con `{ "estudiante_id": 123 }`.
- Se crea `AtencionEstudiante` con `asignado_por=docente`.
- Constraint: un estudiante solo puede estar asignado una vez por atención.

## 4. Creación de Evoluciones (Rol: Estudiante/Docente)
- El estudiante o docente crea evoluciones en su asignación.
- Endpoint: `POST /api/fichas/atenciones-estudiantes/{id}/crear_evolucion/`.
- Body: `{ "contenido": {...}, "tipo_autor": "ESTUDIANTE"|"DOCENTE", "nombre_autor": "...", "vineta": null|ID }`.
- El `numero` se calcula automáticamente (secuencial).
- Si no se proporciona `contenido`, se inicializa con `CAMPOS_CLINICOS_DEFAULT` (9 campos vacíos, incluye `indicaciones`).
- Si no se proporciona `nombre_autor`, se usa `user.get_full_name()`.
- Un estudiante solo puede crear evoluciones de tipo `ESTUDIANTE` en sus propias asignaciones.
- `vineta` permite asociar opcionalmente la evolución a una viñeta específica.

## 4b. Creación de Viñetas (Rol: Docente)
- El docente crea viñetas de contexto narrativo para un estudiante específico.
- Endpoint: `POST /api/fichas/atenciones-estudiantes/{id}/crear_vineta/`.
- Body: `{ "contenido": "Texto narrativo..." }`.
- El `numero` se calcula automáticamente (secuencial dentro de la asignación).
- Solo docentes y admins pueden crear viñetas.
- Las viñetas son individuales por estudiante (FK → AtencionEstudiante).

## 5. Edición de Evoluciones (Rol: Creador/Docente/Admin)
- Solo se puede editar el `contenido` via `PATCH /api/fichas/evoluciones/{id}/`.
- El creador o un docente/admin puede editar.
- **Bloqueo por entrega**: Si la evolución fue entregada (`entregada=True`), el estudiante ya no puede editarla (retorna 403). Docentes/admin aún pueden editar.
- No se crean versiones automáticas — cada evolución es una entrada inmutable en la cadena.

## 5b. Entrega de Evoluciones (Rol: Estudiante)
- El estudiante entrega una evolución específica via `POST /api/fichas/evoluciones/{id}/entregar/`.
- La entrega marca `entregada=True` y bloquea la edición permanentemente para el estudiante.
- Es irreversible: el estudiante no puede revertir la entrega.
- Cada evolución se entrega individualmente (no es por asignación completa).
- Frontend: Botón "Entregar" con diálogo de confirmación en `EvolucionEstudiantePage`.

## 6. Revisión (Rol: Docente)
- El docente entra al caso clínico.
- Ve la lista de atenciones clínicas con sus pacientes y fechas.
- Puede filtrar casos por tema (unidad curricular) vía `?tema=` o desde FichaListPage.
- Dentro de cada atención, ve la lista de estudiantes asignados.
- Asigna estudiantes con buscador autocomplete (por nombre, apellido, email o RUT).
- Para cada estudiante, ve la línea de tiempo con viñetas y evoluciones.
- Las viñetas se muestran como tarjetas ámbar con badge `creada_por_nombre`.
- Las evoluciones se muestran como tarjetas con badge `nombre_autor` (texto libre personalizable) y enlace al detalle.
- Evoluciones entregadas se muestran con ícono de candado + "Entregada".
- **Anti-spoiler**: El estudiante no ve título, descripción ni tema del caso clínico (ocultados por `AtencionClinicaSerializer.to_representation()`).

## 7. Permisos por Acción

| Acción | Quién puede |
|--------|-------------|
| Crear caso clínico | Docente, Admin |
| Editar caso clínico | Dueño, Docente, Admin |
| Crear atención clínica | Docente, Admin |
| Crear asignación | Docente, Admin |
| Crear evolución propia | Estudiante (en su asignación) |
| Crear evolución como Doctor | Docente, Admin |
| Entregar evolución | Estudiante (creador de la evolución) |
| Crear viñeta | Docente, Admin |
| Editar viñeta | Dueño, Docente, Admin |
| Editar evolución | Creador, Docente, Admin (bloqueado si `entregada` para estudiante) |
| Ver evoluciones | Cualquier autenticado (sobre asignaciones accesibles) |
| Eliminar caso clínico | Dueño, Docente, Admin (409 si tiene atenciones) |
| Eliminar atención clínica | Dueño, Docente, Admin (409 si tiene asignaciones) |
| Eliminar asignación | Docente, Admin (cascade borra evoluciones y viñetas) |

## 8. Protección de datos (on_delete)

| Relación | on_delete | Razón |
|----------|-----------|-------|
| `AtencionClinica.caso_clinico` | `PROTECT` | No se puede borrar caso con atenciones (409) |
| `AtencionClinica.paciente` | `PROTECT` | No se puede borrar paciente con atenciones (409) |
| `AtencionEstudiante.atencion_clinica` | `PROTECT` | No se puede borrar atención con asignaciones (409) |
| `AtencionEstudiante.estudiante` | `SET_NULL` | Si se borra usuario, asignación se conserva |
| `Evolucion.atencion_estudiante` | `CASCADE` | Si se borra asignación, se borran evoluciones |
| `Evolucion.vineta` | `SET_NULL` | Si se borra viñeta, evolución se conserva |
| `Vineta.atencion_estudiante` | `CASCADE` | Si se borra asignación, se borran viñetas |
| `*.creado_por`, `*.modificado_por`, `*.asignado_por` | `SET_NULL` | Trazabilidad se conserva como null |

Los ViewSets de CasoClinico, AtencionClinica y Paciente implementan `destroy()` con pre-check: cuentan los hijos y retornan HTTP **409 Conflict** con mensaje descriptivo. El frontend muestra el `detail` del 409 vía componente Toast.

## 9. Rutas Frontend

### Vista Docente/Admin
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/casos-clinicos` | FichaListPage | Lista de casos clínicos con filtro por tema |
| `/casos-clinicos/nuevo` | FichaFormPage | Crear caso clínico |
| `/casos-clinicos/:id` | FichaDetailPage | Detalle con pestañas (descripción, atenciones) |
| `/casos-clinicos/:id/editar` | FichaFormPage | Editar caso clínico |
| `/casos-clinicos/:casoId/nueva-atencion` | AtencionFormPage | Crear atención (seleccionar paciente + fecha) |
| `/atenciones/:id` | AtencionDetailPage | Detalle de atención (estudiantes asignados, evoluciones) |
| `/evoluciones/:id` | EvolucionPage | Ver/editar evolución con 9 campos clínicos |

### Portal Estudiante
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/mi-clinica` | MisAsignacionesPage | Lista de asignaciones del estudiante |
| `/mi-clinica/asignacion/:id` | AsignacionDetailPage | Timeline con viñetas + evoluciones |
| `/mi-clinica/evolucion/:id` | EvolucionEstudiantePage | Ver/editar/entregar evolución |

### Redirect por rol al login
- **Estudiantes** → `/mi-clinica`
- **Docentes/Admin** → `/casos-clinicos`

## NO IMPLEMENTADO (Futuro)

- Jornadas con visibilidad controlada (Día 1 AM, Día 1 PM, etc.)
- ~~Roles simulados ("Dr. García - Médico de turno")~~ → **Implementado** via campo `nombre_autor` libre en evoluciones (ej: "Dr. González (Urgenciólogo)")
- Liberación progresiva de información
- Reinicio de caso por rotación
- Exportación a PDF

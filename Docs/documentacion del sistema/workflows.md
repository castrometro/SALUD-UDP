# Flujos Críticos: Fichas Clínicas

Este documento describe el ciclo de vida completo de las fichas clínicas, desde la creación del Caso Clínico hasta las evoluciones clínicas.

## Arquitectura de 4 Modelos Principales

```
CasoClinico ──(1:N)──→ AtencionClinica ──(1:N)──→ AtencionEstudiante ──(1:N)──→ Evolucion
                            │
                       Paciente (N:1)
```

- **CasoClinico**: Escenario genérico reutilizable con título y descripción. **Sin FK a Paciente**. Creado por docentes.
- **AtencionClinica**: Sesión clínica que une caso + paciente + fecha. Constraint único `(caso_clinico, paciente, fecha_atencion)`.
- **AtencionEstudiante**: Asignación de un estudiante a una atención (hecha por docente). Constraint único `(atencion_clinica, estudiante)`.
- **Evolucion**: Nota clínica en cadena. Contenido JSONField con 8 campos. `tipo_autor` (ESTUDIANTE/DOCENTE), `nombre_autor` (texto libre), `numero` secuencial.

## Diagrama de Flujo

```mermaid
graph TD
    A[Docente crea Caso Clínico] -->|POST /api/fichas/casos-clinicos/\ncon titulo + descripcion| B(CasoClinico en BD)
    B --> C[Docente crea Atención Clínica]
    C -->|POST /api/fichas/atenciones-clinicas/\ncon caso_clinico + paciente + fecha| D(AtencionClinica en BD)
    D --> E[Docente asigna estudiantes]
    E -->|POST /atenciones-clinicas/{id}/asignar_estudiante/\ncon estudiante_id| F(AtencionEstudiante en BD)
    F --> G[Estudiante ve su asignación]
    G --> H[Estudiante crea evolución]
    H -->|POST /atenciones-estudiantes/{id}/crear_evolucion/\ncon contenido + tipo_autor| I(Evolucion #1 creada)
    I --> J[Docente crea evolución como Doctor]
    J -->|POST /atenciones-estudiantes/{id}/crear_evolucion/\ncon tipo_autor=DOCENTE + nombre_autor| K(Evolucion #2 creada)
    K --> L[Estudiante ve evolución del docente]
    L --> H
```

## 1. Creación de Caso Clínico (Rol: Docente)
- El docente navega a `/casos-clinicos/nuevo`.
- Completa título y descripción narrativa del escenario clínico.
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
- Body: `{ "contenido": {...}, "tipo_autor": "ESTUDIANTE"|"DOCENTE", "nombre_autor": "..." }`.
- El `numero` se calcula automáticamente (secuencial).
- Si no se proporciona `contenido`, se inicializa con `CAMPOS_CLINICOS_DEFAULT` (8 campos vacíos).
- Si no se proporciona `nombre_autor`, se usa `user.get_full_name()`.
- Un estudiante solo puede crear evoluciones de tipo `ESTUDIANTE` en sus propias asignaciones.

## 5. Edición de Evoluciones (Rol: Creador/Docente/Admin)
- Solo se puede editar el `contenido` via `PATCH /api/fichas/evoluciones/{id}/`.
- El creador o un docente/admin puede editar.
- No se crean versiones automáticas — cada evolución es una entrada inmutable en la cadena.

## 6. Revisión (Rol: Docente)
- El docente entra al caso clínico.
- Ve la lista de atenciones clínicas con sus pacientes y fechas.
- Dentro de cada atención, ve la lista de estudiantes asignados.
- Para cada estudiante, ve la cadena de evoluciones con `tipo_autor` y `nombre_autor`.

## 7. Permisos por Acción

| Acción | Quién puede |
|--------|-------------|
| Crear caso clínico | Docente, Admin |
| Editar caso clínico | Dueño, Docente, Admin |
| Crear atención clínica | Docente, Admin |
| Crear asignación | Docente, Admin |
| Crear evolución propia | Estudiante (en su asignación) |
| Crear evolución como Doctor | Docente, Admin |
| Editar evolución | Creador, Docente, Admin |
| Ver evoluciones | Cualquier autenticado (sobre asignaciones accesibles) |
| Eliminar caso clínico | Dueño, Docente, Admin (409 si tiene atenciones) |
| Eliminar atención clínica | Dueño, Docente, Admin (409 si tiene asignaciones) |
| Eliminar asignación | Docente, Admin (cascade borra evoluciones) |

## 8. Protección de datos (on_delete)

| Relación | on_delete | Razón |
|----------|-----------|-------|
| `AtencionClinica.caso_clinico` | `PROTECT` | No se puede borrar caso con atenciones (409) |
| `AtencionClinica.paciente` | `PROTECT` | No se puede borrar paciente con atenciones (409) |
| `AtencionEstudiante.atencion_clinica` | `PROTECT` | No se puede borrar atención con asignaciones (409) |
| `AtencionEstudiante.estudiante` | `SET_NULL` | Si se borra usuario, asignación se conserva |
| `Evolucion.atencion_estudiante` | `CASCADE` | Si se borra asignación, se borran evoluciones |
| `*.creado_por`, `*.modificado_por`, `*.asignado_por` | `SET_NULL` | Trazabilidad se conserva como null |

Los ViewSets de CasoClinico, AtencionClinica y Paciente implementan `destroy()` con pre-check: cuentan los hijos y retornan HTTP **409 Conflict** con mensaje descriptivo. El frontend muestra el `detail` del 409 vía componente Toast.

## 9. Rutas Frontend

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/casos-clinicos` | FichaListPage | Lista de casos clínicos |
| `/casos-clinicos/nuevo` | FichaFormPage | Crear caso clínico |
| `/casos-clinicos/:id` | FichaDetailPage | Detalle con pestañas (descripción, atenciones) |
| `/casos-clinicos/:id/editar` | FichaFormPage | Editar caso clínico |
| `/casos-clinicos/:casoId/nueva-atencion` | AtencionFormPage | Crear atención (seleccionar paciente + fecha) |
| `/atenciones/:id` | AtencionDetailPage | Detalle de atención (estudiantes asignados, evoluciones) |
| `/evoluciones/:id` | EvolucionPage | Ver/editar evolución con 8 campos clínicos |

## NO IMPLEMENTADO (Futuro)

- Jornadas con visibilidad controlada (Día 1 AM, Día 1 PM, etc.)
- Roles simulados ("Dr. García - Médico de turno")
- Liberación progresiva de información
- Reinicio de caso por rotación
- Exportación a PDF

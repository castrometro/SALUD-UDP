# Flujos Críticos: Fichas Clínicas

Este documento describe el ciclo de vida completo de una Ficha Clínica, desde su creación como "Caso Clínico" (Plantilla) hasta su completitud por un estudiante.

## Diagrama de Flujo

```mermaid
graph TD
    A[Docente crea Ficha Plantilla] -->|POST /api/fichas/ con es_plantilla=true| B(Base de Datos)
    C[Estudiante ve Caso Clínico] -->|GET /api/fichas/ID/mi_ficha/| D{Ya tiene copia?}
    D -- No --> E[Botón: Crear mi ficha]
    E -->|POST /api/fichas/crear_mi_ficha/| F[Clonar Plantilla]
    F -->|Nueva ficha con ficha_base=ID| G[Ficha del Estudiante]
    D -- Sí --> G
    G --> H[Estudiante Edita y Guarda]
    H -->|PUT /api/fichas/ID/| I[Serializer guarda FichaVersion N]
    I --> J[Ficha actualizada]
    J --> K[Docente edita como Doctor]
    K -->|PUT /api/fichas/ID/| L[FichaVersion N+1 con rol_autor=DOCENTE]
    L --> M[Estudiante ve evolución al día siguiente]
    M --> H
```

## 1. Creación de Plantilla (Rol: Docente)
- El docente navega a `/fichas/nueva` (o desde detalle de paciente con `?paciente=ID`).
- Completa los campos clínicos iniciales del caso (almacenados como JSON en `contenido`).
- Al guardar, el backend crea una `Ficha` con `es_plantilla=True` y `creado_por=docente`.
- Esta ficha es visible para todos los estudiantes como "caso clínico" de solo lectura.

## 2. Clonación (Rol: Estudiante)
- El estudiante ve la plantilla en el detalle del paciente o en la lista de fichas.
- Si no ha trabajado en ella, ve el botón **"Crear mi ficha"**.
- **Backend (`crear_mi_ficha`)**:
    1. Verifica que no exista ya una ficha para el par `(ficha_base_id, estudiante_id)` — protegido además por `UniqueConstraint` en BD.
    2. Crea una **copia del JSON `contenido`** de la plantilla.
    3. Asigna `es_plantilla=False`, vincula `ficha_base`, asigna `estudiante=user`.

## 3. Edición y Versionamiento (Automático)
- Cada vez que el estudiante (o docente) guarda cambios en una ficha (`PUT /api/fichas/{id}/`):
    1. `FichaSerializer.update()` intercepta el guardado.
    2. **Antes de guardar**: Toma snapshot del `contenido` JSON actual → crea `FichaVersion` con versión `N` y `rol_autor` del usuario.
    3. **Guarda**: Actualiza `Ficha` con el nuevo `contenido` y `modificado_por=user`.
- La versión se calcula como `última_versión + 1` (o 1 si es la primera edición).

## 4. Evolución por el Docente (Rol: "Doctor")
- El docente entra a la ficha del estudiante.
- Edita el `contenido` simulando una evolución del paciente (nuevos signos vitales, indicaciones, etc.).
- Al guardar, `FichaVersion` registra `rol_autor=DOCENTE`, dejando claro quién hizo cada versión.
- Al día siguiente, el estudiante ve el nuevo estado del paciente.

## 5. Revisión (Rol: Docente)
- El docente entra a su plantilla.
- Pestaña **"Fichas de Estudiantes"**: Lista todos los alumnos que han clonado esta plantilla (`GET /api/fichas/{id}/fichas_estudiantes/`).
- Al entrar a la ficha de un alumno, pestaña **"Historial"**: Muestra la evolución por versiones con `rol_autor` para identificar quién hizo qué.
- Puede **"viajar en el tiempo"** seleccionando versiones anteriores.

## 6. Permisos por Acción

| Acción | Quién puede |
|--------|-------------|
| Crear plantilla | Docente, Admin |
| Clonar plantilla | Estudiante |
| Editar ficha propia | Estudiante (dueño) |
| Editar cualquier ficha | Docente, Admin |
| Ver historial | Cualquier autenticado (sobre fichas a las que tiene acceso) |
| Ver fichas de estudiantes | Docente, Admin |
| Eliminar ficha | Dueño, Docente, Admin |

## 7. Protección de datos

| Relación | on_delete | Razón |
|----------|-----------|-------|
| `Ficha.paciente` | `PROTECT` | No se puede borrar un paciente que tenga fichas |
| `Ficha.ficha_base` | `PROTECT` | No se puede borrar una plantilla que tenga fichas de estudiantes |
| `Ficha.estudiante` | `SET_NULL` | Si se borra un usuario, las fichas se conservan (trazabilidad) |
| `Ficha.creado_por` | `SET_NULL` | Idem |
| `FichaVersion.ficha` | `CASCADE` | Si se borra la ficha, se borran sus versiones |

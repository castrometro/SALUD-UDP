# Documentación del Feature: Estudiantes (Frontend)

## Propósito
Gestiona la vista de "Estudiantes" desde la perspectiva de un Docente/Admin, permitiendo buscar alumnos y revisar su trabajo.

## Estructura

### Pages
- **`EstudianteListPage.tsx`**: Listado de todos los estudiantes registrados.
    - Filtros por nombre/email.
    - Lógica de paginación o scroll infinito (Issue #4).
- **`EstudianteDetailPage.tsx`**: Perfil académico del estudiante.
    - Muestra métricas de casos resueltos.
    - Tablero de historial (vía `EstudianteCasosTab` y `EstudianteFichasTab`).

### Integración Backend
Consume la API de `/users/` filtrando por `role=ESTUDIANTE`.
*(Nota: Se recomienda migrar a endpoint dedicado `/estudiantes/` para optimizar payload, ver Issue "Refactor Student Fetching").*

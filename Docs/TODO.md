# TODO — Pendientes del Proyecto

## Frontend

- [ ] Buscador de estudiante en la asignación de atención (paciente-alumno)
- [ ] Vista de estudiante no debe ver el nombre de los casos, solo fecha de atención
- [ ] Estudiante no debe ver la descripción del caso ni cualquier dato que sea spoiler
- [ ] Docente al crear una ficha debe poder modificar el autor con un campo de texto libre (ej: "Dr. González (Urgenciólogo)" en vez de "Docente")
- [ ] Fichas del docente deben tener más opciones/variedades:
  - [ ] Indicaciones: cuidados del paciente, concentraciones de medicamentos, administraciones de volumen, etc.
- [ ] Botón "Entregar" en la ficha del estudiante que bloquee la edición posterior

## Arquitectura / UX

- [ ] Diferenciar más la vista para perfil docente y perfil estudiante
- [ ] Páginas separadas por rol (docente vs estudiante) para no mezclar lógicas, manteniendo feature folder pattern
- [ ] Evitar panel intermedio con opciones después del login (ir directo a la vista principal del rol)

# Estado de Pruebas: Fichas

## Cobertura Actual

- [x] **Smoke Test**: Creación básica de CasosClinicos y Fichas de Estudiante.
- [ ] **Lógica de Negocio**:
  - [ ] `crear_mi_ficha`: Validar que crea ficha con contenido vacío (CAMPOS_CLINICOS_DEFAULT).
  - [ ] `crear_mi_ficha`: Validar error si ya existe.
  - [ ] `historial`: Validar versionamiento al editar.
- [ ] **API**:
  - [ ] Endpoints protegidos por rol.

## Notas para QA

- Esta app es el "Core" del sistema. Requiere la mayor cobertura.
- CasoClinico es la entidad central (titulo, descripcion, paciente).
- FichaEstudiante arranca con contenido vacío, no copia de ninguna plantilla.

# Estado de Pruebas: Fichas

## Cobertura Actual

- [x] **Smoke Test**: Creación básica de Plantillas y Fichas de Estudiante.
- [ ] **Lógica de Negocio**:
  - [ ] `crear_mi_ficha`: Validar que copia profundidad (anamnesis, etc).
  - [ ] `crear_mi_ficha`: Validar error si ya existe.
  - [ ] `historial`: Validar versionamiento al editar.
- [ ] **API**:
  - [ ] Endpoints protegidos por rol.

## Notas para QA

- Esta app es el "Core" del sistema. Requiere la mayor cobertura.
- Poner énfasis en la recursividad (`ficha_base`).

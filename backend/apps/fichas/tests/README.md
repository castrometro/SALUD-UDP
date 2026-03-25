# Estado de Pruebas: Fichas

## Cobertura Actual

- [x] **Smoke Test**: Creación básica de CasoClinico, AtencionClinica, AtencionEstudiante y Evolucion.
- [x] **Relaciones**: Validar cadena CasoClinico → AtencionClinica → AtencionEstudiante → Evolucion.
- [x] **Constraints**: UniqueConstraint en AtencionClinica y AtencionEstudiante.
- [x] **Cascading**: CASCADE en Evolucion al borrar AtencionEstudiante.
- [ ] **Lógica de Negocio**:
  - [ ] `asignar_estudiante`: Validar asignación y error si ya asignado.
  - [ ] `crear_evolucion`: Validar creación con número secuencial.
  - [ ] `crear_evolucion`: Validar que estudiante solo crea tipo ESTUDIANTE.
  - [ ] `crear_evolucion`: Validar contenido por defecto si no se proporciona.
- [ ] **API**:
  - [ ] Endpoints protegidos por rol.
  - [ ] Filtrado por rol en queryset (estudiante vs docente).
  - [ ] Destroy con 409 (CasoClinico, AtencionClinica).

## Notas para QA

- Esta app es el "Core" del sistema. Requiere la mayor cobertura.
- CasoClinico es genérico (sin FK a Paciente). El paciente se asigna en AtencionClinica.
- No existe modelo FichaEstudiante, FichaVersion ni Plantilla.
- Evoluciones se crean via la acción custom `crear_evolucion` en AtencionEstudianteViewSet.

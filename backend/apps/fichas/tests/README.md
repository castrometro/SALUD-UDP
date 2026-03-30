# Estado de Pruebas: Fichas

## Cobertura Actual

- [x] **Smoke Test**: Creación básica de CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion y Vineta.
- [x] **Relaciones**: Validar cadena CasoClinico → AtencionClinica → AtencionEstudiante → Evolucion / Vineta.
- [x] **Constraints**: UniqueConstraint en AtencionClinica, AtencionEstudiante y Vineta.
- [x] **Cascading**: CASCADE en Evolucion y Vineta al borrar AtencionEstudiante.
- [x] **CasoClinico.tema**: Campo tema opcional.
- [x] **Vineta**: Creación, unicidad numero por asignación.
- [x] **Evolucion + Vineta**: FK opcional a viñeta (con y sin).
- [ ] **Lógica de Negocio**:
  - [ ] `asignar_estudiante`: Validar asignación y error si ya asignado.
  - [ ] `crear_evolucion`: Validar creación con número secuencial.
  - [ ] `crear_evolucion`: Validar que estudiante solo crea tipo ESTUDIANTE.
  - [ ] `crear_evolucion`: Validar contenido por defecto si no se proporciona.
  - [ ] `crear_vineta`: Validar que solo docentes pueden crear viñetas.
  - [ ] `crear_vineta`: Validar número secuencial automático.
- [ ] **API**:
  - [ ] Endpoints protegidos por rol.
  - [ ] Filtrado por rol en queryset (estudiante vs docente).
  - [ ] Destroy con 409 (CasoClinico, AtencionClinica).
  - [ ] VinetaViewSet: read + patch filtrado por rol.

## Notas para QA

- Esta app es el "Core" del sistema. Requiere la mayor cobertura.
- CasoClinico es genérico (sin FK a Paciente). El paciente se asigna en AtencionClinica.
- No existe modelo FichaEstudiante, FichaVersion ni Plantilla.
- Evoluciones se crean via la acción custom `crear_evolucion` en AtencionEstudianteViewSet.
- Viñetas se crean via la acción custom `crear_vineta` en AtencionEstudianteViewSet (solo docentes).
- Viñetas son individuales por estudiante (FK → AtencionEstudiante).

# Estado de Pruebas: Pacientes

## Cobertura Actual

- [x] **Smoke Test**:
  - [x] Creación de paciente.
  - [x] **Lógica de Negocio**: Cálculo correcto de la `edad` (considerando mes/día).
- [x] **Perfil Clínico**:
  - [x] Campos clínicos (sexo, antecedentes_personales, medicamentos_habituales, alergias).
  - [x] Campos clínicos son opcionales (default vacío / NO_INFORMA).
- [ ] **Modelos**:
  - [ ] Validación de `rut` algorítmica (Módulo 11).
- [ ] **API**:
  - [ ] CRUD básico.

## Notas para QA

- La propiedad `edad` es crítica para reglas de negocio clínicas.
- El campo `sexo` tiene 4 opciones: MASCULINO, FEMENINO, OTRO, NO_INFORMA (default).
- Los campos de perfil clínico (antecedentes, medicamentos, alergias) son TextField opcionales.

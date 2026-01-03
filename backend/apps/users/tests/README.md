# Estado de Pruebas: Users (Auth)

## Cobertura Actual

- [x] **Smoke Test**:
  - [x] Creación de usuario.
  - [x] Verificación de `__str__` (Email + Rol).
- [ ] **Modelos**:
  - [ ] Validación de `rut` duplicado.
- [ ] **API**:
  - [ ] Login (JWT).
  - [ ] Refresh Token.

## Notas para QA

- El modelo `User` tiene un comportamiento custom en `__str__` que incluye el rol.

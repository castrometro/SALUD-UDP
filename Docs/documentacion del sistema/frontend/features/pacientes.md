# Documentación del Feature: Pacientes (Frontend)

## Propósito
CRUD de pacientes. Desde el detalle de un paciente se pueden ver los casos clínicos en que participa.

## Estructura

```
features/pacientes/
├── types.ts                    # Paciente interface
├── services/
│   └── pacienteService.ts      # CRUD API calls
└── pages/
    ├── PacienteListPage.tsx    # Tabla con búsqueda y paginación
    ├── PacienteFormPage.tsx    # Formulario crear/editar
    └── PacienteDetailPage.tsx  # Detalle con casos clínicos asociados
```

## Tipos (`types.ts`)
- `Paciente`: id, rut, nombre, apellido, prevision, correo, numero_telefono, fecha_nacimiento, domicilio, edad (calculado server-side), created_at/updated_at.

## Servicio (`pacienteService.ts`)

| Función | Método | Endpoint |
|---------|--------|----------|
| `getPacientes(page, search)` | GET | `/pacientes/?page=&search=` |
| `getPaciente(id)` | GET | `/pacientes/{id}/` |
| `createPaciente(data)` | POST | `/pacientes/` |
| `updatePaciente(id, data)` | PUT | `/pacientes/{id}/` |
| `deletePaciente(id)` | DELETE | `/pacientes/{id}/` |

## Páginas

### `PacienteListPage.tsx`
- Tabla con columnas: Paciente (nombre+edad), RUT (formateado), Contacto (correo+teléfono), Previsión (badge con color), Acciones.
- Búsqueda con debounce 500ms (nombre, apellido, rut). Resetea a página 1.
- Paginación.
- **Acciones**: Ver detalle, Editar, Eliminar (con `window.confirm`).
- **Eliminación**: Toast de éxito o error con mensaje del backend (409 si tiene casos clínicos).
- **Toast**: Componente `Toast` para feedback visual de éxito/error.

### `PacienteFormPage.tsx`
- Crear o editar paciente.
- Validación de RUT chileno en frontend (`validateRut()`, `formatRut()`).
- RUT deshabilitado en modo edición.
- Dropdown de previsión (FONASA, ISAPRE, PARTICULAR).
- Campos: RUT, Fecha Nacimiento, Nombre, Apellido, Previsión, Teléfono, Correo, Domicilio.

### `PacienteDetailPage.tsx`
- Tarjeta de perfil: Avatar (iniciales), nombre, RUT formateado, badge de previsión.
- Grid de información: Fecha Nacimiento (con edad), Correo, Teléfono, Domicilio.
- Botón para editar paciente.
- **Casos Clínicos Asignados**: Lista de CasosClinicos del paciente.
  - Cada caso muestra: título del caso clínico, fecha de creación, total de estudiantes, creado por, enlace al caso.
  - Estado vacío si no tiene casos.
- Carga en paralelo: paciente y casos clínicos en mount.

## Flujo principal
1. Docente busca paciente en lista.
2. Entra al detalle del paciente.
3. Crea un caso clínico desde `/casos-clinicos/nuevo` asociándolo al paciente.

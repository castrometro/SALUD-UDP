# Documentación del Feature: Pacientes (Frontend)

## Propósito
CRUD de pacientes y punto de entrada para crear fichas clínicas (primero se busca al paciente).

## Estructura

```
features/pacientes/
├── types.ts                    # Paciente interface
├── services/
│   └── pacienteService.ts      # CRUD API calls
└── pages/
    ├── PacienteListPage.tsx    # Tabla con búsqueda y paginación
    ├── PacienteFormPage.tsx    # Formulario crear/editar
    └── PacienteDetailPage.tsx  # Detalle con fichas asociadas
```

## Tipos (`types.ts`)
- `Paciente`: id, rut, nombre, apellido, prevision, correo, numero_telefono, fecha_nacimiento, domicilio, edad, timestamps.

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
- Tabla con columnas: nombre, RUT, previsión, acciones.
- Búsqueda con debounce de 500ms (resetea a página 1).
- Paginación.
- Botones: ver detalle, editar, eliminar (con `window.confirm`).

### `PacienteFormPage.tsx`
- Crear o editar paciente.
- Validación de RUT chileno en frontend (`validateRut()`, `formatRut()`).
- RUT deshabilitado en modo edición.
- Dropdown de previsión (FONASA, ISAPRE, PARTICULAR).

### `PacienteDetailPage.tsx`
- Tarjeta con avatar (iniciales), RUT, previsión, datos de contacto.
- Historial clínico agrupado por ficha base:
  - Plantillas con borde púrpura. Muestra `contenido?.motivo_consulta` y `contenido?.diagnostico`.
  - Copias de estudiantes anidadas con badges verdes.
- Botón "Nueva Ficha" enlaza a `/fichas/nueva?paciente={id}`.

## Flujo principal
1. Docente busca paciente en lista.
2. Entra al detalle del paciente.
3. Desde ahí crea una ficha plantilla o revisa fichas existentes.

# Documentación del Feature: Estudiantes (Frontend)

## Propósito
Gestión de estudiantes desde la perspectiva de docentes/admin. Permite crear, editar, buscar alumnos y revisar su trabajo.

## Estructura

```
features/estudiantes/
├── types.ts                        # Estudiante, EstudianteCreateData
├── services/
│   └── estudianteService.ts        # CRUD API calls
├── pages/
│   ├── EstudianteListPage.tsx      # Tabla con búsqueda
│   ├── EstudianteFormPage.tsx      # Formulario crear/editar
│   └── EstudianteDetailPage.tsx    # Perfil con pestañas
└── components/
    ├── EstudianteFichasTab.tsx      # Tabla de fichas del estudiante
    └── EstudianteCasosTab.tsx       # Grid de pacientes únicos
```

## Tipos (`types.ts`)
- `Estudiante`: id, rut, first_name, last_name, email, role, is_active.
- `EstudianteCreateData`: email, password, first_name, last_name, rut.

## Servicio (`estudianteService.ts`)
Consume `/api/users/estudiantes/` (endpoint dedicado en backend).

| Función | Método | Endpoint |
|---------|--------|----------|
| `getEstudiantes(page, search)` | GET | `/users/estudiantes/?page=&search=` |
| `getEstudiante(id)` | GET | `/users/estudiantes/{id}/` |
| `createEstudiante(data)` | POST | `/users/estudiantes/` |
| `updateEstudiante(id, data)` | PUT | `/users/estudiantes/{id}/` |
| `deleteEstudiante(id)` | DELETE | `/users/estudiantes/{id}/` |

## Páginas

### `EstudianteListPage.tsx`
- Tabla con búsqueda por nombre, email, RUT y paginación.
- Columnas: Estudiante (nombre), RUT, Email, Acciones.
- Acciones: ver detalle, editar, eliminar (con `window.confirm`).

### `EstudianteFormPage.tsx`
- Crear o editar estudiante.
- Campos: first_name, last_name, rut (deshabilitado en edición), email, password (solo en creación).
- Validación de RUT chileno en frontend (`validateRut()`, `formatRut()`).
- Manejo de errores de API con mensajes detallados.
- Estado de loading con botón deshabilitado durante submit.

### `EstudianteDetailPage.tsx`
Perfil académico del estudiante con 2 pestañas:

1. **Fichas Clínicas** (`EstudianteFichasTab`): Tabla de fichas del estudiante con fecha, paciente (nombre + RUT), diagnóstico (truncado), acción de ver.
2. **Casos / Pacientes** (`EstudianteCasosTab`): Grid de pacientes únicos con los que ha trabajado. Cada tarjeta muestra nombre, RUT, última visita y cantidad de fichas. Enlace al detalle del paciente.

Tarjeta de perfil: Avatar (iniciales), nombre, rol, RUT, email.

## Componentes

### `EstudianteFichasTab.tsx`
- Props: `fichas[]`, configuración de paginación (opcional).
- Tabla con columnas: Fecha, Paciente (nombre + RUT), Diagnóstico, Ver.
- Estado vacío si no hay fichas.

### `EstudianteCasosTab.tsx`
- Props: `fichas[]`.
- Agrupa fichas por paciente usando `useMemo()`.
- Cards (grid 3 columnas) con avatar, nombre, RUT, última fecha, count de fichas.
- Enlace al detalle del paciente.

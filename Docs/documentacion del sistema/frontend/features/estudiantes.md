# Documentación del Feature: Estudiantes (Frontend)

## Propósito
Gestión de estudiantes desde la perspectiva de docentes/admin. Permite buscar alumnos y revisar su trabajo.

## Estructura

```
features/estudiantes/
├── types.ts                        # Estudiante interface
├── services/
│   └── estudianteService.ts        # CRUD API calls
├── pages/
│   ├── EstudianteListPage.tsx      # Tabla con búsqueda
│   └── EstudianteDetailPage.tsx    # Perfil con pestañas
└── components/
    ├── EstudianteFichasTab.tsx      # Tabla de fichas del estudiante
    └── EstudianteCasosTab.tsx       # Grid de pacientes únicos
```

## Tipos (`types.ts`)
- `Estudiante`: id, rut, first_name, last_name, email, role, is_active.

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
- Tabla con búsqueda por nombre/email y paginación.
- Acciones: ver detalle, editar.

### `EstudianteDetailPage.tsx`
Perfil académico del estudiante con 2 pestañas:

1. **Fichas Clínicas** (`EstudianteFichasTab`): Tabla de fichas del estudiante con fecha, paciente (RUT), diagnóstico, acción de ver.
2. **Casos / Pacientes** (`EstudianteCasosTab`): Grid de pacientes únicos con los que ha trabajado. Cada tarjeta muestra nombre, RUT, última visita y cantidad de fichas.

## Componentes

### `EstudianteFichasTab.tsx`
- Tabla paginada de fichas.
- Columnas: Fecha, Paciente (nombre + RUT), Diagnóstico, Ver.

### `EstudianteCasosTab.tsx`
- Agrupa fichas por paciente usando `useMemo()`.
- Cards con avatar, nombre, RUT, última fecha y count de fichas.
- Enlace al detalle del paciente.

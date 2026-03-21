# Documentación del Feature: Fichas (Frontend)

## Propósito
Maneja la UI para creación, edición y visualización de fichas clínicas. Es el punto de interacción principal para estudiantes y docentes.

## Estructura

```
features/fichas/
├── types.ts                    # FichaAmbulatoria, FichaHistorial, FichaBaseInfo
├── services/
│   └── fichaService.ts         # CRUD + acciones especiales
├── pages/
│   ├── FichaDetailPage.tsx     # Vista detalle con pestañas (la página más compleja)
│   └── FichaFormPage.tsx       # Formulario crear/editar
└── components/
    └── PacienteSelect.tsx      # Autocomplete de pacientes
```

## Tipos (`types.ts`)
- `FichaAmbulatoria`: ~30 campos. Incluye `paciente_detail` anidado, `es_plantilla`, `ficha_base`, `estudiante` (number | null), 8 campos clínicos, trazabilidad y `total_versiones`.
- `FichaHistorial`: Snapshot versionado con los 8 campos clínicos + metadata.
- `FichaBaseInfo`: Info resumida de la plantilla padre (id, fecha, autor).

## Servicio (`fichaService.ts`)

| Función | Método | Endpoint |
|---------|--------|----------|
| `getFichas()` | GET | `/fichas/` |
| `getFicha(id)` | GET | `/fichas/{id}/` |
| `createFicha(data)` | POST | `/fichas/` |
| `updateFicha(id, data)` | PUT | `/fichas/{id}/` |
| `deleteFicha(id)` | DELETE | `/fichas/{id}/` |
| `getFichasPlantillas()` | GET | `/fichas/?plantillas=true` |
| `getFichasByPaciente(id)` | GET | `/fichas/?paciente={id}` |
| `getFichasByEstudiante(id)` | GET | `/fichas/?estudiante={id}` |
| `getFichaHistorial(id)` | GET | `/fichas/{id}/historial/` |
| `crearMiFicha(plantillaId)` | POST | `/fichas/crear_mi_ficha/` |
| `getMiFicha(id)` | GET | `/fichas/{id}/mi_ficha/` |
| `getFichasEstudiantes(id)` | GET | `/fichas/{id}/fichas_estudiantes/` |

## Páginas

### `FichaDetailPage.tsx`
La página más compleja del sistema. Tiene 3 pestañas:

1. **Caso Clínico**: Muestra los 8 campos clínicos. Modo edición con guardar/descartar/eliminar.
2. **Historial de Cambios**: Timeline de versiones anteriores. Se puede visualizar cualquier versión.
3. **Fichas de Estudiantes** (solo docentes): Lista todos los alumnos que clonaron esta plantilla.

**Lógica condicional por rol:**
- Docente/Admin: puede editar, ver historial, ver fichas de estudiantes.
- Estudiante viendo plantilla: ve botón "Crear mi ficha".
- Estudiante viendo su ficha: puede editar.

**Carga perezosa:** Las pestañas cargan datos solo cuando el usuario hace click.

### `FichaFormPage.tsx`
Formulario para crear nueva ficha o editar existente.
- Detecta automáticamente si docente (crea plantilla) o estudiante (crea ficha propia).
- Soporte para pre-seleccionar paciente via `?paciente={id}` en la URL.
- 8 campos clínicos como textarea.

## Componentes

### `PacienteSelect.tsx`
Autocompletado para seleccionar paciente:
- Filtra por nombre, apellido o RUT.
- Muestra como "Nombre Apellido (RUT)".
- Click fuera para cerrar, botón para limpiar.

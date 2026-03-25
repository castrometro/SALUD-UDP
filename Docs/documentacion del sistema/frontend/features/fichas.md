# Documentación del Feature: Fichas (Frontend)

## Propósito
Maneja la UI para casos clínicos y fichas de estudiantes. Es el punto de interacción principal para docentes y estudiantes.

## Estructura

```
features/fichas/
├── types.ts                    # CasoClinico, FichaEstudiante, FichaHistorial
├── services/
│   └── fichaService.ts         # API calls para CasoClinico y FichaEstudiante + acciones custom
├── pages/
│   ├── FichaListPage.tsx       # Lista de casos clínicos con búsqueda
│   ├── FichaFormPage.tsx       # Formulario crear/editar caso clínico
│   ├── FichaDetailPage.tsx     # Detalle de caso clínico con pestañas
│   └── FichaEstudianteDetailPage.tsx  # Detalle de ficha de estudiante con historial
└── components/
    └── PacienteSelect.tsx      # Autocomplete de pacientes
```

## Tipos (`types.ts`)

### `ContenidoClinico`
Interface + constante `CONTENIDO_DEFAULT` que define los 8 campos clínicos del MVP:
```ts
interface ContenidoClinico {
    motivo_consulta: string;
    anamnesis: string;
    examen_fisico: string;
    diagnostico: string;
    intervenciones: string;
    factores: string;
    rau_necesidades: string;
    instrumentos_aplicados: string;
    [key: string]: string; // Permite acceso dinámico
}
```

### `CasoClinico`
Entidad central creada por docentes:
- `id`, `titulo`, `descripcion` (texto narrativo del escenario clínico).
- `paciente` (ID), `paciente_detail` (Paciente | null).
- Trazabilidad: `creado_por`/`modificado_por` (IDs), `creado_por_nombre`/`modificado_por_nombre`, timestamps.
- Agregado: `total_estudiantes`.

### `FichaEstudiante`
Ficha individual del estudiante:
- `id`, `caso_clinico` (ID), `caso_clinico_detail` (CasoClinico | null), `estudiante` (ID | null), `estudiante_nombre`.
- `contenido` (ContenidoClinico).
- Trazabilidad: `creado_por`/`modificado_por` + nombres, timestamps.
- Agregado: `total_versiones`.

### `FichaHistorial`
Snapshot de versión:
- `id`, `ficha` (ID), `version`, `autor` (ID | null), `autor_nombre`, `rol_autor`, `fecha`.
- `contenido` (ContenidoClinico).

## Servicio (`fichaService.ts`)

### Casos Clínicos
| Función | Método | Endpoint |
|---------|--------|----------|
| `getCasosClinicos(page, pageSize, pacienteId?, search?)` | GET | `/fichas/casos-clinicos/?...` |
| `getCasoClinico(id)` | GET | `/fichas/casos-clinicos/{id}/` |
| `createCasoClinico({titulo, descripcion, paciente})` | POST | `/fichas/casos-clinicos/` |
| `updateCasoClinico(id, data)` | PATCH | `/fichas/casos-clinicos/{id}/` |
| `deleteCasoClinico(id)` | DELETE | `/fichas/casos-clinicos/{id}/` |
| `getFichasEstudiantesDeCaso(casoId, page, pageSize)` | GET | `/fichas/casos-clinicos/{id}/fichas_estudiantes/` |

### Fichas de Estudiantes
| Función | Método | Endpoint |
|---------|--------|----------|
| `getFichasEstudiante(page, pageSize, estudianteId?)` | GET | `/fichas/fichas-estudiantes/?...` |
| `getFichaEstudiante(id)` | GET | `/fichas/fichas-estudiantes/{id}/` |
| `updateFichaEstudiante(id, data)` | PATCH | `/fichas/fichas-estudiantes/{id}/` |
| `deleteFichaEstudiante(id)` | DELETE | `/fichas/fichas-estudiantes/{id}/` |
| `crearMiFicha(casoClinicoId)` | POST | `/fichas/fichas-estudiantes/crear_mi_ficha/` |
| `getMiFicha(casoClinicoId)` | GET | `/fichas/fichas-estudiantes/mi_ficha/?caso_clinico={id}` |
| `getFichaHistorial(fichaId)` | GET | `/fichas/fichas-estudiantes/{id}/historial/` |

## Páginas

### `FichaListPage.tsx`
Lista de casos clínicos con búsqueda server-side y paginación.
- **Estado**: `casos[]`, `searchTerm`, `currentPage`, `totalPages`, `totalItems`, `toast`.
- Búsqueda server-side con `?search=` (titulo y descripcion), reseteando a página 1.
- Tabla con columnas: Caso Clínico (título+descripción), Paciente, Estudiantes, Fecha.
- **Acciones** (solo docentes): Ver detalle (link), Editar, Eliminar.
- **Eliminación**: Muestra Toast con mensaje del backend (409 si tiene fichas asociadas).

### `FichaFormPage.tsx`
Formulario para crear/editar casos clínicos.
- **Estado**: `formData` (titulo, descripcion, paciente), `isEdit`, `toast`.
- Carga caso clínico si edita (por ID en URL).
- Campos: título (input), descripción narrativa (textarea grande, 8 rows), paciente (PacienteSelect, deshabilitado en edición).
- Muestra Toast de éxito tras guardar.

### `FichaDetailPage.tsx`
Detalle de un caso clínico con 2 pestañas.

1. **Descripción del Caso**: Muestra la descripción narrativa en formato solo lectura.
2. **Fichas de Estudiantes**: Lista de FichasEstudiantes del caso.
   - Cada ficha muestra: nombre estudiante, estado, fecha.
   - Para estudiantes: botón "Crear mi ficha" o link "Ver mi ficha".

**Header**: Título del caso, info del paciente con link.
**Acciones** (solo docentes): Editar caso, Eliminar caso (con modal de confirmación).
**Toast**: Éxito/error para todas las operaciones.

### `FichaEstudianteDetailPage.tsx`
Detalle de la ficha de un estudiante con edición y historial.

- **Estado**: `ficha`, `editableFicha`, `caso`, `isEditing`, `activeTab`, `historial`, `selectedVersion`, `toast`.
- **Sección colapsable**: Descripción del caso clínico como referencia.
- **2 pestañas**:
  1. **Caso Clínico**: Info del paciente (nombre, RUT), datos de trazabilidad.
     - 8 campos clínicos editables (textareas).
     - Botones: Editar / Guardar / Descartar (solo dueño o docente).
     - Banner de advertencia al ver versión histórica.
  2. **Historial**: Lista de versiones con número, autor, fecha, `rol_autor`.
     - Click en versión para ver snapshot (viaje en el tiempo).
     - Botón "Ver versión actual" para volver.
- **Eliminación**: Solo docentes.

## Componentes

### `PacienteSelect.tsx`
Autocompletado para seleccionar paciente:
- Carga todos los pacientes en mount (filtrado client-side).
- Filtro por nombre, apellido o RUT (substring).
- Muestra "Nombre Apellido (RUT)" en placeholder y opciones.
- Click fuera para cerrar, botón X para limpiar.

### `Toast.tsx` (`components/ui/`)
Notificación flotante reutilizable:
- Props: `message`, `type` (success/error), `duration` (default 3000ms), `onClose`.
- Auto-cierre con animación suave.
- Posición: top-right, fixed, z-50.

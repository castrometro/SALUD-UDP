# Documentación del Feature: Fichas (Frontend)

## Propósito
Maneja la UI para plantillas clínicas, casos clínicos y fichas de estudiantes. Es el punto de interacción principal para docentes y estudiantes.

## Estructura

```
features/fichas/
├── types.ts                    # Plantilla, CasoClinico, FichaEstudiante, FichaHistorial
├── services/
│   └── fichaService.ts         # API calls para las 3 entidades + acciones custom
├── pages/
│   ├── FichaListPage.tsx       # Lista de plantillas con búsqueda
│   ├── FichaFormPage.tsx       # Formulario crear/editar plantilla
│   ├── FichaDetailPage.tsx     # Detalle de plantilla con pestañas (la más compleja)
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

### `Plantilla`
Caso clínico base creado por docentes:
- `id`, `titulo`, `descripcion`, `contenido` (ContenidoClinico).
- Trazabilidad: `creado_por`/`modificado_por` (IDs), `creado_por_nombre`/`modificado_por_nombre`, timestamps.
- Agregados: `total_casos`, `total_estudiantes`.

### `CasoClinico`
Vinculación plantilla + paciente:
- `id`, `plantilla` (ID), `plantilla_titulo`, `paciente` (ID), `paciente_detail` (Paciente | null).
- Trazabilidad: `creado_por`, `creado_por_nombre`, `fecha_creacion`.
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

### Plantillas
| Función | Método | Endpoint |
|---------|--------|----------|
| `getPlantillas(page, pageSize)` | GET | `/fichas/plantillas/?page=&page_size=` |
| `getPlantilla(id)` | GET | `/fichas/plantillas/{id}/` |
| `createPlantilla(data)` | POST | `/fichas/plantillas/` |
| `updatePlantilla(id, data)` | PATCH | `/fichas/plantillas/{id}/` |
| `deletePlantilla(id)` | DELETE | `/fichas/plantillas/{id}/` |

### Casos Clínicos
| Función | Método | Endpoint |
|---------|--------|----------|
| `getCasosClinicos(page, pageSize, plantillaId?, pacienteId?)` | GET | `/fichas/casos-clinicos/?...` |
| `getCasoClinico(id)` | GET | `/fichas/casos-clinicos/{id}/` |
| `createCasoClinico({plantilla, paciente})` | POST | `/fichas/casos-clinicos/` |
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
Lista de plantillas con búsqueda y paginación.
- **Estado**: `plantillas[]`, `searchTerm`, `currentPage`, `totalPages`, `totalItems`, `toast`.
- Búsqueda con debounce 500ms, reseteando a página 1.
- Tabla con columnas: Plantilla (título+descripción), Casos, Estudiantes, Fecha/Autor.
- Tarjetas de resumen: total plantillas, casos, estudiantes.
- **Acciones**: Ver detalle (link), Editar, Eliminar (con `window.confirm`).
- **Eliminación**: Muestra Toast con mensaje del backend (409 si tiene casos asociados).

### `FichaFormPage.tsx`
Formulario para crear/editar plantillas.
- **Estado**: `formData` (titulo, descripcion, contenido), `isEdit`, `toast`.
- Carga plantilla si edita (por ID en URL).
- Campos de metadatos: título (input), descripción (textarea).
- 8 campos clínicos como textareas (leen/escriben en `formData.contenido`).
- Muestra Toast de éxito tras guardar.
- Caja informativa explicando el flujo Plantilla → Casos → Fichas.

### `FichaDetailPage.tsx`
La página más compleja. Detalle de una plantilla con 3 pestañas.

1. **Contenido Clínico**: Muestra los 8 campos desde `plantilla.contenido` en formato solo lectura.
2. **Casos Clínicos**: Lista de CasosClinicos asociados.
   - Componente `PacienteSelect` para seleccionar paciente.
   - Botón para crear nuevo CasoClinico (vincula plantilla+paciente).
   - Cada caso muestra: paciente, fecha, total estudiantes, botón eliminar.
   - Toast de error si constraint de unicidad o si caso tiene fichas.
3. **Fichas de Estudiantes**: Lista paginada de FichasEstudiantes a través de todos los casos.

**Header**: Título, contadores (total casos, total estudiantes).
**Acciones** (solo docentes): Editar plantilla, Eliminar plantilla (con modal de confirmación).
**Carga lazy**: Las pestañas cargan datos solo al activarse.
**Toast**: Éxito/error para todas las operaciones (crear caso, eliminar caso, eliminar plantilla).

### `FichaEstudianteDetailPage.tsx`
Detalle de la ficha de un estudiante con edición y historial.

- **Estado**: `ficha`, `editableFicha`, `caso`, `isEditing`, `activeTab`, `historial`, `selectedVersion`, `toast`.
- **2 pestañas**:
  1. **Caso Clínico**: Info del paciente (nombre, RUT), datos de trazabilidad.
     - 8 campos clínicos editables (textareas).
     - Botones: Editar / Guardar / Descartar (solo dueño o docente).
     - Banner de advertencia al ver versión histórica.
  2. **Historial**: Lista de versiones con número, autor, fecha, `rol_autor`.
     - Click en versión para ver snapshot (viaje en el tiempo).
     - Botón "Ver versión actual" para volver.
- **Eliminación**: Solo docentes. Muestra mensaje de error del backend.

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

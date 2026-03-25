# Documentación del Feature: Fichas (Frontend)

## Propósito
Maneja la UI para casos clínicos, atenciones clínicas, asignaciones de estudiantes y evoluciones. Es el punto de interacción principal para docentes y estudiantes.

## Estructura

```
features/fichas/
├── types.ts                    # CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion
├── services/
│   └── fichaService.ts         # API calls para los 4 modelos + acciones custom
├── pages/
│   ├── FichaListPage.tsx       # Lista de casos clínicos con búsqueda
│   ├── FichaFormPage.tsx       # Formulario crear/editar caso clínico
│   ├── FichaDetailPage.tsx     # Detalle de caso clínico con atenciones
│   ├── AtencionFormPage.tsx    # Crear atención (paciente + fecha)
│   ├── AtencionDetailPage.tsx  # Detalle de atención (estudiantes, evoluciones)
│   ├── EvolucionPage.tsx       # Ver/editar evolución con 8 campos clínicos
│   └── FichaEstudianteDetailPage.tsx  # (deprecated) Redirect a /casos-clinicos
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
Escenario genérico reutilizable (sin paciente):
- `id`, `titulo`, `descripcion`.
- Trazabilidad: `creado_por`/`modificado_por` (IDs), `creado_por_nombre`/`modificado_por_nombre`, timestamps.
- Agregado: `total_atenciones`.

### `AtencionClinica`
Sesión clínica (caso + paciente + fecha):
- `id`, `caso_clinico` (ID), `caso_clinico_detail` (CasoClinico | null).
- `paciente` (ID), `paciente_detail` (Paciente | null).
- `fecha_atencion` (string ISO date).
- Trazabilidad: `creado_por`/`modificado_por` + nombres, timestamps.
- Agregado: `total_estudiantes`.

### `AtencionEstudiante`
Asignación de estudiante a atención:
- `id`, `atencion_clinica` (ID), `atencion_clinica_detail` (AtencionClinica | null).
- `estudiante` (ID | null), `estudiante_nombre`.
- `asignado_por` (ID | null), `asignado_por_nombre`.
- `fecha_asignacion`, `total_evoluciones`.

### `Evolucion`
Nota clínica en cadena:
- `id`, `atencion_estudiante` (ID), `numero`.
- `contenido` (ContenidoClinico).
- `tipo_autor` (TipoAutor: 'ESTUDIANTE' | 'DOCENTE'), `nombre_autor`.
- Trazabilidad: `creado_por`/`creado_por_nombre`, `fecha_creacion`.

## Servicio (`fichaService.ts`)

### Casos Clínicos
| Función | Método | Endpoint |
|---------|--------|----------|
| `getCasosClinicos(page, pageSize, search?)` | GET | `/fichas/casos-clinicos/?...` |
| `getCasoClinico(id)` | GET | `/fichas/casos-clinicos/{id}/` |
| `createCasoClinico({titulo, descripcion})` | POST | `/fichas/casos-clinicos/` |
| `updateCasoClinico(id, data)` | PATCH | `/fichas/casos-clinicos/{id}/` |
| `deleteCasoClinico(id)` | DELETE | `/fichas/casos-clinicos/{id}/` |
| `getAtencionesDeCaso(casoId, page, pageSize)` | GET | `/fichas/casos-clinicos/{id}/atenciones/` |

### Atenciones Clínicas
| Función | Método | Endpoint |
|---------|--------|----------|
| `getAtencionesClinicas(page, pageSize, casoId?, pacienteId?)` | GET | `/fichas/atenciones-clinicas/?...` |
| `getAtencionClinica(id)` | GET | `/fichas/atenciones-clinicas/{id}/` |
| `createAtencionClinica({caso_clinico, paciente, fecha_atencion})` | POST | `/fichas/atenciones-clinicas/` |
| `updateAtencionClinica(id, data)` | PATCH | `/fichas/atenciones-clinicas/{id}/` |
| `deleteAtencionClinica(id)` | DELETE | `/fichas/atenciones-clinicas/{id}/` |
| `asignarEstudiante(atencionId, estudianteId)` | POST | `/fichas/atenciones-clinicas/{id}/asignar_estudiante/` |
| `getEstudiantesDeAtencion(atencionId)` | GET | `/fichas/atenciones-clinicas/{id}/estudiantes/` |

### Atenciones Estudiante
| Función | Método | Endpoint |
|---------|--------|----------|
| `getAtencionesEstudiante(page, pageSize, estudianteId?, atencionClinicaId?)` | GET | `/fichas/atenciones-estudiantes/?...` |
| `getAtencionEstudiante(id)` | GET | `/fichas/atenciones-estudiantes/{id}/` |
| `crearEvolucion(asignacionId, {contenido, tipo_autor, nombre_autor})` | POST | `/fichas/atenciones-estudiantes/{id}/crear_evolucion/` |
| `getEvolucionesDeAsignacion(asignacionId)` | GET | `/fichas/atenciones-estudiantes/{id}/evoluciones/` |

### Evoluciones
| Función | Método | Endpoint |
|---------|--------|----------|
| `getEvoluciones(page, pageSize, atencionEstudianteId?)` | GET | `/fichas/evoluciones/?...` |
| `getEvolucion(id)` | GET | `/fichas/evoluciones/{id}/` |
| `updateEvolucion(id, {contenido})` | PATCH | `/fichas/evoluciones/{id}/` |

## Páginas

### `FichaListPage.tsx`
Lista de casos clínicos con búsqueda server-side y paginación.
- **Estado**: `casos[]`, `searchTerm`, `currentPage`, `totalPages`, `totalItems`, `toast`.
- Búsqueda server-side con `?search=` (titulo y descripcion), reseteando a página 1.
- Tabla con columnas: Caso Clínico (título+descripción), Atenciones, Fecha.
- **Acciones** (solo docentes): Ver detalle (link), Editar, Eliminar.
- **Eliminación**: Muestra Toast con mensaje del backend (409 si tiene atenciones asociadas).

### `FichaFormPage.tsx`
Formulario para crear/editar casos clínicos.
- **Estado**: `formData` (titulo, descripcion), `isEdit`, `toast`.
- Carga caso clínico si edita (por ID en URL).
- Campos: título (input), descripción narrativa (textarea grande).
- **No incluye selector de paciente** — el paciente se asigna al crear una atención.

### `FichaDetailPage.tsx`
Detalle de un caso clínico con atenciones clínicas.
- Muestra título, descripción, atenciones clínicas paginadas.
- Cada atención muestra: paciente, fecha, cantidad de estudiantes.
- **Acciones** (solo docentes): Editar caso, Eliminar caso, Nueva Atención.

### `AtencionFormPage.tsx`
Crear una atención clínica dentro de un caso.
- **Route param**: `casoId` desde `/casos-clinicos/:casoId/nueva-atencion`.
- Campos: `PacienteSelect` + fecha de atención (date picker).
- Al guardar, navega a `/atenciones/${atencion.id}`.

### `AtencionDetailPage.tsx`
Detalle de una atención clínica con estudiantes y evoluciones.
- Muestra info del caso, paciente, fecha.
- Lista de estudiantes asignados en grid.
- Modal para asignar nuevo estudiante (por ID).
- Al seleccionar un estudiante, muestra sus evoluciones.
- Docentes pueden crear evoluciones como "Doctor" (con `nombre_autor` personalizable).

### `EvolucionPage.tsx`
Ver/editar una evolución individual con los 8 campos clínicos.
- **Route param**: `id` desde `/evoluciones/:id`.
- Muestra los 8 campos clínicos en textareas.
- Toggle editar/ver con permisos (dueño o docente).
- Guarda via `PATCH /fichas/evoluciones/{id}/`.

### `FichaEstudianteDetailPage.tsx` (deprecated)
Redirecciona a `/casos-clinicos` via `<Navigate>`.

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

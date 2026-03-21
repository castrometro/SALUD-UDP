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
    [key: string]: string; // Permite acceso dinámico por nombre de campo
}
```
Incluye índice signature (`[key: string]: string`) para permitir acceso dinámico desde el grid de campos en `FichaDetailPage`.

### `FichaAmbulatoria`
Refleja el contrato exacto del backend. Los campos clínicos están **dentro de `contenido`** (JSONField en el modelo Django):
- Metadata: `id`, `paciente`, `es_plantilla`, `ficha_base`, `estudiante`.
- Nested: `paciente_detail` (Paciente), `ficha_base_info` (FichaBaseInfo), `contenido` (ContenidoClinico).
- Trazabilidad: `creado_por_nombre`, `modificado_por_nombre`, timestamps, `total_versiones`.
- `estudiante_nombre`: nombre del estudiante dueño (null si plantilla).

### `FichaHistorial`
Snapshot de versión. **Nota**: El backend usa `autor`/`autor_nombre` (no `modificado_por`):
- `id`, `ficha`, `version`, `autor`, `autor_nombre`, `rol_autor`, `fecha`.
- `contenido`: ContenidoClinico (snapshot del estado al momento de la versión).

### `FichaBaseInfo`
Info resumida de la plantilla padre: `id`, `fecha_modificacion`, `modificado_por_nombre`.

## Servicio (`fichaService.ts`)

| Función | Método | Endpoint |
|---------|--------|----------|
| `getFichas()` | GET | `/fichas/` |
| `getFicha(id)` | GET | `/fichas/{id}/` |
| `createFicha(data)` | POST | `/fichas/` |
| `updateFicha(id, data)` | PATCH | `/fichas/{id}/` |
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

1. **Caso Clínico**: Muestra los 8 campos clínicos desde `ficha.contenido`. Modo edición con guardar/descartar/eliminar. Los campos se renderizan dinámicamente desde un array `valoracionFields` que referencia keys de `contenido`.
2. **Historial de Cambios**: Timeline de versiones anteriores. Se puede visualizar cualquier versión (los campos se leen de `version.contenido`). Muestra `autor_nombre` por versión.
3. **Fichas de Estudiantes** (solo docentes en plantillas): Grid de tarjetas con avatar, nombre, fechas y count de versiones.

**Lógica condicional por rol:**
- Docente/Admin: puede editar, ver historial, ver fichas de estudiantes.
- Estudiante viendo plantilla: ve botón "Crear mi ficha".
- Estudiante viendo su ficha: puede editar.

**Carga perezosa:** Las pestañas cargan datos solo cuando el usuario hace click.

### `FichaFormPage.tsx`
Formulario para crear nueva ficha o editar existente.
- Estado inicial con `contenido: { ...CONTENIDO_DEFAULT }`.
- `handleChange` actualiza `formData.contenido[campo]` (no campos raíz).
- Detecta automáticamente si docente (crea plantilla) o estudiante (crea ficha propia).
- Soporte para pre-seleccionar paciente via `?paciente={id}` en la URL.
- 8 campos clínicos como textarea, leyendo/escribiendo de `formData.contenido`.

## Componentes

### `PacienteSelect.tsx`
Autocompletado para seleccionar paciente:
- Filtra por nombre, apellido o RUT.
- Muestra como "Nombre Apellido (RUT)".
- Click fuera para cerrar, botón para limpiar.

# Documentación del Feature: Portal Estudiante (Frontend)

## Propósito
Portal exclusivo para el rol ESTUDIANTE. Ofrece una experiencia simplificada y centrada en las tareas del alumno: ver asignaciones, trabajar evoluciones y entregarlas. Separado del feature `fichas` (que es la vista docente/admin) para evitar mezclar lógicas de rol.

## Estructura

```
features/portal-estudiante/
├── services/
│   └── portalEstudianteService.ts   # Re-exports relevantes desde fichaService
└── pages/
    ├── MisAsignacionesPage.tsx       # Lista de asignaciones del estudiante
    ├── AsignacionDetailPage.tsx      # Timeline: viñetas + evoluciones
    └── EvolucionEstudiantePage.tsx   # Editor de evolución + entrega
```

## Servicio (`portalEstudianteService.ts`)
Re-exporta funciones de `fichaService` necesarias para el portal:

| Re-export | Función original |
|-----------|-----------------|
| `getAtencionesEstudiante` | Lista asignaciones (filtrada por rol) |
| `getAtencionEstudiante` | Detalle de una asignación |
| `getEvolucionesDeAsignacion` | Evoluciones de una asignación |
| `getVinetasDeAsignacion` | Viñetas de una asignación |
| `crearEvolucion` | Crear evolución en asignación |
| `getEvolucion` | Detalle de una evolución |
| `updateEvolucion` | Editar contenido de evolución |
| `entregarEvolucion` | POST entregar (marcar como entregada) |

## Páginas

### `MisAsignacionesPage.tsx`
Lista de asignaciones del estudiante autenticado.
- Carga `getAtencionesEstudiante()` (el backend filtra por `estudiante=request.user`).
- Muestra tarjetas con: paciente, fecha de atención, cantidad de evoluciones.
- **Anti-spoiler**: No muestra título/descripción/tema del caso clínico (ocultados por el backend via `to_representation`).
- Enlace a detalle de asignación.

### `AsignacionDetailPage.tsx`
Timeline de una asignación con viñetas y evoluciones intercaladas.
- **Route param**: `id` desde `/mi-clinica/asignacion/:id`.
- Carga en paralelo: asignación, evoluciones y viñetas.
- **Línea de Tiempo**: Muestra viñetas (tarjetas ámbar con badge `creada_por_nombre || 'Docente'`) y evoluciones (tarjetas con badge `nombre_autor`) ordenadas.
- **Badge `entregada`**: Evoluciones entregadas muestran ícono de candado + "Entregada".
- Botón **"Nueva Evolución"** para crear evolución siempre visible.
- Enlace a cada evolución para ver/editar.

### `EvolucionEstudiantePage.tsx`
Editor de evolución con 9 campos clínicos y funcionalidad de entrega.
- **Route param**: `id` desde `/mi-clinica/evolucion/:id`.
- Muestra los 9 campos clínicos en textareas (incluye Indicaciones).
- Badge con `nombre_autor` del creador.
- **Badge `entregada`**: Si la evolución fue entregada, muestra ícono de candado + "Entregada".
- **`canEdit`**: Solo si es el dueño Y la evolución no ha sido entregada.
- **Botón "Entregar"**: Junto al botón "Editar". Abre diálogo de confirmación ("¿Estás seguro? Esta acción no se puede deshacer."). Llama a `entregarEvolucion(id)`. Una vez entregada, se bloquea la edición permanentemente.
- Toggle editar/ver con textareas que se habilitan/deshabilitan.

## Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/mi-clinica` | MisAsignacionesPage | Lista de asignaciones del estudiante |
| `/mi-clinica/asignacion/:id` | AsignacionDetailPage | Timeline con viñetas + evoluciones |
| `/mi-clinica/evolucion/:id` | EvolucionEstudiantePage | Ver/editar/entregar evolución |

## Redirect por Rol al Login
- **Estudiantes**: Redirigidos a `/mi-clinica` después del login.
- **Docentes/Admin**: Redirigidos a `/casos-clinicos`.
- Configurado en `LoginPage.tsx` / `AuthContext.tsx`.

## Diferencias con el Feature `fichas` (vista docente)
| Aspecto | `features/fichas` (Docente) | `features/portal-estudiante` (Estudiante) |
|---------|----------------------------|------------------------------------------|
| Casos clínicos | Lista completa con filtros y CRUD | No accede directamente |
| Asignaciones | Dentro de AtencionDetailPage | MisAsignacionesPage (lista propia) |
| Evoluciones | EvolucionPage (sin entrega) | EvolucionEstudiantePage (con entrega) |
| Anti-spoiler | Ve título/descripción/tema | Ocultos por backend |
| Viñetas | Puede crear | Solo lectura |
| Entrega | No aplica | Botón "Entregar" per-evolución |

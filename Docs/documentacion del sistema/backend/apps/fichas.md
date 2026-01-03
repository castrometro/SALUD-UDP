# Documentación del Módulo: Fichas (Backend)

## Propósito
El módulo de `fichas` gestiona toda la información clínica de la aplicación. Es el núcleo del sistema y maneja dos conceptos principales:
1.  **Plantillas (Ficha Base)**: Casos clínicos creados por docentes.
2.  **Fichas de Estudiantes**: Copias de las plantillas que los estudiantes rellenan.

## Modelos de Datos (`models.py`)

### `FichaAmbulatoria`
Es el modelo principal. Utiliza una estructura recursiva para relacionar la ficha del estudiante con la plantilla del docente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `es_plantilla` | Boolean | `True` si es creada por un docente (Caso Clínico). |
| `ficha_base` | ForeignKey (self) | Referencia a la plantilla original. `null` si la ficha es la plantilla misma. |
| `estudiante` | ForeignKey (User) | Dueño de la ficha. `null` si es una plantilla. |
| `paciente` | ForeignKey | Paciente asociado al caso. |

**Lógica Clave:**
- Un estudiante crea una ficha copiando una plantilla.
- La copia hereda los datos del `paciente` y la referencia a `ficha_base`.

### `FichaHistorial`
Implementa un sistema de control de versiones manual.
- Cada vez que se actualiza una ficha, se guarda una copia de su estado anterior en esta tabla.
- Permite a los docentes ver la evolución del razonamiento clínico del estudiante.

## Serializers (`serializers.py`)

### `FichaAmbulatoriaSerializer`
- **Campos de Lectura**: Incluye detalles anidados del `paciente` y nombres de usuarios (`creado_por_nombre`).
- **Validación de Tipos**: Se ajustó para permitir valores `null` explícitos en `ficha_base` y `estudiante`, sincronizado con el frontend.

### `CrearFichaEstudianteSerializer`
- Serializer especializado para la acción de "Clonar Plantilla".
- Valida que el estudiante no tenga ya una copia de esa plantilla específica.

## Vistas y Endpoints (`views.py`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/fichas/` | Lista fichas. Filtra según rol (Estudiante ve las suyas, Docente ve todas). |
| POST | `/api/fichas/{id}/crear_mi_ficha/` | Clona una plantilla (ID) para el usuario autenticado. |
| GET | `/api/fichas/{id}/historial/` | Retorna todas las versiones históricas de una ficha. |
| GET | `/api/fichas/{id}/fichas_estudiantes/` | (Docente) Lista todas las copias de alumnos asociadas a una plantilla. |

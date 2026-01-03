# Documentación del Feature: Fichas (Frontend)

## Propósito
Este módulo en `/frontend/src/features/fichas` maneja toda la UI para la creación, edición y visualización de fichas clínicas. Es el punto de interacción principal para Estudiantes y Docentes.

## Estructura de Archivos

### Pages
- **`FichaDetailPage.tsx`**: La página más compleja del sistema.
    - Maneja lógica condicional masiva según Roles (Docente vs Estudiante).
    - Renderiza pestañas dinámicas: "Caso Clínico", "Historial" (Docente), "Fichas de Estudiantes" (Docente).
    - Gestiona el estado de edición del formulario.
- **`FichaFormPage.tsx`**: Formulario para crear nuevas fichas (no plantillas).

### Components
- **`EstudianteFichasTab.tsx`**: Muestra lista de fichas asociadas a un estudiante específico.
- **`EstudianteCasosTab.tsx`**: Muestra casos (plantillas) asignados o disponibles para un estudiante.

### Services (`fichaService.ts`)
Encapsula las llamadas a la API.
- `crearMiFicha(plantillaId)`: Clave para el flujo de estudiantes.
- `getFichaHistorial(id)`: Obtiene versiones anteriores.

## Tipos (`types.ts`)
Sincronizados estrictamente con el Backend (ver Issue #3).
- `FichaAmbulatoria`: Maneja campos nulos explícitamente (`number | null`).
- `FichaBaseInfo`: Sub-interfaz para datos de la plantilla padre.

## Notas de Implementación
- **Permisos en UI**: Se usa `user?.role` para ocultar/mostrar botones de edición y pestañas de historial.
- **Gestión de Estado**: `FichaDetailPage` usa múltiples `useState` para manejar la carga asíncrona de historiales y sub-fichas solo cuando el usuario cambia de pestaña (Lazy Loading manual).

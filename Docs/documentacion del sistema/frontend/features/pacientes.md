# Documentación del Feature: Pacientes (Frontend)

## Propósito
Permite buscar, listar, crear y ver el detalle de los pacientes. Es el punto de entrada para crear una ficha clínica (primero se busca al paciente).

## Estructura

### Pages
- **`PacienteListPage.tsx`**: Tabla con buscador y filtros.
- **`PacienteDetailPage.tsx`**: "Hoja de Vida" del paciente. Muestra sus datos y el historial de fichas asociadas.
    - Desde aquí se inicia el flujo de "Crear Ficha" (Docente) o "Ver Caso" (Estudiante).
- **`PacienteCreatePage.tsx`** (Planificada/Existente): Formulario de ingreso.

### Components
- **`PacienteSelect.tsx`**: Componente autocompletar reutilizable para asignar pacientes en formularios.

### Flujos Relacionados
- **Ver Fichas**: El detalle del paciente lista las `FichaAmbulatoria` relacionadas. Al hacer click, redirige al `FichaDetailPage`.

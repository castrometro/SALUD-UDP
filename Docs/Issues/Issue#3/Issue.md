# Issue #3: Type Validation Consistency

## Descripción
Se detectó una inconsistencia entre la forma en que el Backend (Django REST Framework) serializa los datos y cómo el Frontend (TypeScript) los tipa.

### Problema
- **Backend**: Envía valores `null` explícitamente para campos vacíos (ej. `foreign_key: null`).
- **Frontend**: Definía estos campos como opcionales (`?`), lo que resulta en `undefined` en lugar de `null` o en tipos que no contemplan explícitamente el `null`, generando riesgos de errores en tiempo de ejecución.

### Objetivo
Asegurar una sincronización robusta entre los Serializers de Backend y las Intefaces de Frontend, específicamente para modelos recursivos complejos como `FichaAmbulatoria`.

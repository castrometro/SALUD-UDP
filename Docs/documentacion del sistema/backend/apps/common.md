# Documentación del Módulo: Common (Backend)

## Propósito
Utilidades transversales y validaciones compartidas por todas las aplicaciones.

## Validadores (`validators.py`)
Centraliza la lógica de negocio para datos chilenos.
- `validate_rut(value)`: Algoritmo módulo 11 para verificar si un RUT es válido.
- `format_rut(value)`: Formatea el RUT (ej. `12.345.678-9`).
- Se usan en los modelos `User` y `Paciente`.

## Mixins y Abstract Models
*(Si existieran en el futuro)*
Aquí se alojarían modelos base como `TimeStampedModel` (created_at, updated_at) si se decide refactorizar para evitar repetición de código.

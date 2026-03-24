# Documentación del Módulo: Common (Backend)

## Propósito
Utilidades transversales y validaciones compartidas por todas las apps.

## Validadores (`validators.py`)

### `validate_rut(value)`
Valida un RUT chileno con el algoritmo módulo 11.
- Acepta formatos con o sin puntos y guión.
- Verifica largo (7-8 dígitos + dígito verificador).
- Calcula y compara el dígito verificador.
- Lanza `ValidationError` si es inválido.
- **⚠️ Deshabilitada para MVP** (función con `pass`). Permite RUTs ficticios como SIM-001.
- **Usado en**: `User.rut`, `Paciente.rut` (como validator en el campo, pero no ejecuta lógica actualmente).

### `format_rut(value)`
Formatea un RUT al estándar chileno: `XX.XXX.XXX-Y`
- Limpia puntos y guiones existentes.
- Agrega separadores de miles y guión.
- **Usado en**: `User.save()`, `Paciente.save()` — se formatea automáticamente al guardar.

## Nota
El frontend replica esta validación en `frontend/src/utils/rut.ts` con funciones `validateRut()`, `formatRut()` y `cleanRut()`.

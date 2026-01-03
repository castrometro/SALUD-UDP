# Documentación del Módulo: Pacientes (Backend)

## Propósito
Gestiona la base de datos de los pacientes que son atendidos en el contexto clínico. Es una información sensible y central para la creación de fichas.

## Modelos (`models.py`)

### `Paciente`
Representa al paciente clínico.
- **RUT**: Identificador único.
- **Datos Demográficos**: Nombre, Apellido, Fecha de Nacimiento, Domicilio.
- **Previsión**: Fonasa/Isapre/Particular.

Lógica importante:
- `edad`: Property calculada dinámicamente desde `fecha_nacimiento`.

## Vistas y API (`views.py`)
Utiliza `ModelViewSet` estándar de DRF.
- GET `/api/pacientes/`: Lista paginada de pacientes.
- GET `/api/pacientes/?search=...`: Búsqueda por RUT o nombre.
- POST `/api/pacientes/`: Creación de nuevo paciente.

## Permisos
- **Lectura**: Docentes y Estudiantes.
- **Escritura (Crear/Editar)**: Generalmente restringido a Docentes o Administrativos (verificar `permissions.py` en implementación final).

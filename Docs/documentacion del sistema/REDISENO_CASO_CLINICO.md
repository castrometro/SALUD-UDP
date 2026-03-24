# Rediseño Conceptual: Caso Clínico como entidad central

## Problema actual

Los nombres de los modelos confunden tres conceptos distintos del dominio clínico:

| Modelo actual | Qué nombre sugiere | Qué hace realmente |
|---|---|---|
| `Plantilla` | Estructura vacía reutilizable | Contiene título, descripción **y 8 campos clínicos llenos** (el caso + las respuestas) |
| `CasoClinico` | El escenario que la profesora presenta | Solo es una tabla intermedia que vincula Plantilla↔Paciente |
| `FichaEstudiante` | El trabajo del alumno | Arranca **copiando** el contenido de la Plantilla (el alumno recibe las respuestas) |

### El efecto torpedo

Cuando la profesora crea una "Plantilla" y llena los campos clínicos (diagnóstico, intervenciones, etc.), el estudiante al crear su ficha recibe **una copia de todo ese contenido**. En la práctica, la profesora le está entregando la ficha resuelta.

---

## Los conceptos reales del dominio

### Caso Clínico (el escenario)
Lo que la profesora construye y presenta a los estudiantes. Es una narrativa:
> "Paciente de 65 años llega a urgencias con dolor torácico irradiado al brazo izquierdo. Antecedentes de HTA y diabetes tipo 2. Signos vitales: PA 160/100, FC 95, T° 37.2°C..."

No tiene formato de ficha. Es una historia clínica que describe la situación que el estudiante debe resolver.

### Ficha Clínica (el trabajo del estudiante)
El documento estructurado que el profesional (o estudiante) llena al atender al paciente. Tiene campos definidos: motivo de consulta, anamnesis, examen físico, diagnóstico, intervenciones, etc.

Esto es **lo que se evalúa**. El estudiante lo llena desde cero, basándose en la información del caso clínico.

### Plantilla (la estructura de campos)
Define **qué campos** tiene una ficha, no el contenido. En el MVP existe una sola plantilla (ambulatoria, con los 8 campos de `CAMPOS_CLINICOS_DEFAULT`). En el futuro podrían existir otras (intrahospitalaria, urgencia, etc.).

---

## Arquitectura propuesta

### Modelo conceptual

```
CasoClinico (lo que la profesora crea)
├── titulo
├── descripcion (narrativa del escenario, texto libre o enriquecido)
├── paciente (FK) ← paciente simulado con datos demográficos
├── creado_por (FK) ← la profesora
└── metadatos (fecha, etc.)

FichaEstudiante (lo que el alumno llena)
├── caso_clinico (FK) ← sabe a qué caso pertenece
├── estudiante (FK) ← quién la llena
├── contenido (JSON) ← los 8 campos clínicos, ARRANCA VACÍO
├── creado_por / modificado_por
└── versiones (FichaVersion via FK)
```

### Qué desaparece

El modelo `Plantilla` deja de ser una entidad con contenido clínico. La definición de qué campos tiene una ficha se mantiene como constante (`CAMPOS_CLINICOS_DEFAULT`) o, en el futuro, como un modelo `TipoFicha` si se necesitan múltiples estructuras.

### Qué cambia en `CasoClinico`

El `CasoClinico` actual es solo un link `Plantilla↔Paciente`. En la propuesta, se convierte en la **entidad principal** que la profesora crea:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | CharField | Nombre descriptivo del caso ("Consulta por cefalea tensional") |
| `descripcion` | TextField | Narrativa completa del escenario clínico |
| `paciente` | FK → Paciente | Paciente simulado asociado |
| `creado_por` | FK → User | La profesora que creó el caso |
| `fecha_creacion` | DateTimeField | Auto |

### Qué cambia en `FichaEstudiante`

La ficha del estudiante **arranca vacía** (con `CAMPOS_CLINICOS_DEFAULT`, todos campos en blanco). El estudiante lee el caso clínico como referencia y llena su ficha por cuenta propia.

| Antes | Después |
|---|---|
| `contenido` se copia de `Plantilla.contenido` | `contenido` se inicializa vacío |
| El estudiante recibe respuestas pre-llenadas | El estudiante trabaja desde cero |

---

## Flujo de uso

### Profesora

1. **Crea un Caso Clínico**: Escribe el título, la narrativa del escenario y selecciona (o crea) un paciente simulado.
2. **Asigna estudiantes** (o los estudiantes se auto-asignan): Cada estudiante crea su ficha en el caso.
3. **Revisa fichas**: Ve las fichas de cada estudiante, compara respuestas, revisa historial de versiones.
4. **Puede editar fichas** de estudiantes simulando evolución del paciente (con `rol_autor=DOCENTE` en el historial).

### Estudiante

1. **Ve el caso clínico**: Lee la descripción del escenario (read-only).
2. **Crea su ficha**: Se inicializa vacía con los 8 campos clínicos.
3. **Llena la ficha**: Motivo de consulta, anamnesis, examen físico, diagnóstico, intervenciones, etc.
4. **Guarda**: Cada guardado genera una `FichaVersion` automática.
5. **Ve evoluciones**: Si la profesora editó su ficha (simulando evolución del paciente), ve los cambios en el historial.

---

## Valor pedagógico: Historial longitudinal del paciente

Un mismo paciente puede tener múltiples casos clínicos a lo largo del tiempo:

```
Paciente "María González" (RUT: 12.345.678-9)
│
├── Caso 1 (Marzo): "Consulta por cefalea tensional"
│   ├── Ficha Estudiante A  ← diagnosticó migraña, indicó paracetamol
│   └── Ficha Estudiante B  ← diagnosticó cefalea tensional, indicó ibuprofeno
│
├── Caso 2 (Mayo): "Control + nuevo síntoma: dolor abdominal"
│   ├── Ficha Estudiante A  ← ¿revisó el historial del caso 1?
│   └── Ficha Estudiante C  ← primera vez con esta paciente
│
└── Caso 3 (Julio): "Urgencia: síncope en domicilio"
    └── Ficha Estudiante A  ← ¿conectó los 3 episodios?
```

**Evaluación clave**: La profesora puede verificar si el estudiante:
- Revisó el historial médico previo del paciente antes de atender.
- Conectó síntomas entre casos (ej: cefalea + dolor abdominal + síncope → posible HTA no controlada).
- Consideró tratamientos previos para no duplicar o contraindecir.

Esto replica exactamente lo que ocurre en la práctica clínica real.

---

## Impacto técnico en el código actual

### Backend

| Componente | Cambio |
|---|---|
| `Plantilla` (modelo) | Se elimina o se renombra. Sus campos `titulo` y `descripcion` migran a `CasoClinico`. El campo `contenido` desaparece (ya no tiene sentido que el caso tenga campos clínicos). |
| `CasoClinico` (modelo) | Gana `titulo` y `descripcion`. Pierde FK a `Plantilla`. Se convierte en la entidad principal. |
| `FichaEstudiante` (modelo) | Sin cambios estructurales. Solo cambia la lógica de inicialización: `contenido` arranca vacío. |
| `FichaVersion` (modelo) | Sin cambios. |
| Serializers | Se simplifican. `PlantillaSerializer` desaparece. `CasoClinicoSerializer` gana los campos de la plantilla. |
| ViewSets | `PlantillaViewSet` desaparece. `CasoClinicoViewSet` asume el CRUD principal. |
| URLs | `/fichas/plantillas/` desaparece. `/fichas/casos-clinicos/` se convierte en el endpoint principal. |

### Frontend

| Componente | Cambio |
|---|---|
| Tipos | `Plantilla` desaparece. `CasoClinico` gana `titulo`, `descripcion`. |
| Servicios | `plantillaService` → `casoClinicoService`. |
| Páginas | `FichaListPage` lista casos clínicos (no plantillas). `FichaFormPage` crea/edita casos clínicos. `FichaDetailPage` muestra el caso con sus fichas de estudiantes. |
| Rutas | `/plantillas/*` → `/casos-clinicos/*` o `/casos/*`. |

### Migración de datos

Si ya existen Plantillas con datos reales:
1. Crear campos `titulo` y `descripcion` en `CasoClinico`.
2. Copiar `titulo` y `descripcion` de cada `Plantilla` a sus `CasoClinico` asociados.
3. Eliminar FK `CasoClinico.plantilla`.
4. Eliminar modelo `Plantilla`.

---

## Decisiones pendientes (para conversar con las profesoras)

1. **¿La descripción del caso es texto libre o tiene estructura?** ¿La profesora necesita campos separados (antecedentes, signos vitales, motivo de consulta) o basta con un textarea?

2. **¿El estudiante sabe que el paciente tiene historial previo?** ¿Se le dice "revisa el historial" o parte del ejercicio es que lo descubra solo?

3. **¿La profesora quiere una "pauta de corrección"?** Campos ocultos para el estudiante donde la profesora registra las respuestas esperadas (diagnóstico correcto, intervenciones esperadas) para comparar después.

4. **¿Tipos de ficha?** ¿Todas las fichas tienen los mismos 8 campos (ambulatoria) o en el futuro habrá fichas con estructura diferente (intrahospitalaria, urgencia)?

5. **¿Cómo presenta el caso en clase?** ¿Impreso, proyectado, verbal? Esto define si necesitamos exportación/visualización del caso antes de que el alumno lo vea en el sistema.

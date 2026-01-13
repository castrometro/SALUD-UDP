# Requerimientos - Sistema de Fichas para Hospital Simulado

## Contexto

En el contexto de un **hospital simulado** para formación de estudiantes, las fichas clínicas deben evolucionar dinámicamente simulando el paso del tiempo y las intervenciones de diferentes profesionales de salud.

---

## Flujo de Trabajo Actual

### Jornada Tipo

```
┌─────────────────────────────────────────────────────────────────┐
│                         DÍA 1                                   │
├─────────────────────────────────────────────────────────────────┤
│  MAÑANA (AM)                                                    │
│  ├── Estudiante llega                                           │
│  ├── Recibe ficha del paciente (estado inicial día 1)           │
│  ├── Trabaja sobre la información                               │
│  └── Registra sus intervenciones                                │
│                                                                 │
│  [ALMUERZO - Simulación de paso del tiempo]                     │
│                                                                 │
│  TARDE (PM)                                                     │
│  ├── Estudiante vuelve                                          │
│  ├── La ficha tiene NUEVOS DATOS (simulando que un médico pasó) │
│  ├── Nuevos signos vitales, indicaciones, evolución, etc.       │
│  └── Estudiante continúa trabajando con información actualizada │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DÍA 2                                   │
├─────────────────────────────────────────────────────────────────┤
│  MAÑANA (AM)                                                    │
│  ├── Ficha refleja evolución nocturna del paciente              │
│  ├── Nuevas indicaciones médicas                                │
│  └── Estudiante trabaja con el nuevo estado                     │
│                                                                 │
│  TARDE (PM)                                                     │
│  ├── Más actualizaciones simuladas                              │
│  └── Continúa la evolución del caso clínico                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requerimientos Funcionales

### RF-01: Evolución Temporal de Fichas

**Descripción:** El sistema debe permitir que una ficha clínica evolucione en el tiempo, simulando que diferentes profesionales (médicos, enfermeros, etc.) agregan información.

**Criterios de Aceptación:**
- [ ] Una ficha puede tener múltiples "estados" o "momentos" en el tiempo
- [ ] Cada estado tiene una fecha/hora asociada (Día 1 AM, Día 1 PM, Día 2 AM, etc.)
- [ ] El estudiante ve la ficha según el momento de la simulación
- [ ] Los datos anteriores se mantienen visibles como historial

### RF-02: Roles de Edición Simulados

**Descripción:** El sistema debe simular que diferentes profesionales agregan información a la ficha.

**Criterios de Aceptación:**
- [ ] Docente/Admin puede agregar datos simulando ser: Médico, Enfermero, Especialista, etc.
- [ ] Cada entrada tiene un "autor simulado" (ej: "Dr. García - Médico de turno")
- [ ] Se registra quién realmente hizo la modificación (el docente) vs. quién se simula

### RF-03: Jornadas de Simulación

**Descripción:** El sistema debe manejar el concepto de "jornadas" dentro de un caso clínico.

**Propuesta de Estructura:**
```
Caso Clínico (Paciente X - Diagnóstico Y)
├── Jornada 1 - Día 1 AM
│   ├── Datos iniciales del paciente
│   ├── Motivo de consulta
│   └── Primeros exámenes
├── Jornada 2 - Día 1 PM
│   ├── Resultados de exámenes
│   ├── Indicaciones médicas
│   └── Nueva medicación
├── Jornada 3 - Día 2 AM
│   ├── Evolución nocturna
│   ├── Nuevos signos vitales
│   └── Ajuste de tratamiento
└── ... (continúa)
```

### RF-04: Visibilidad Controlada por Tiempo

**Descripción:** El estudiante solo debe ver la información hasta la jornada actual de la simulación.

**Criterios de Aceptación:**
- [ ] Si estamos en "Día 1 PM", el estudiante ve Jornada 1 y 2, pero NO la 3
- [ ] El docente controla en qué jornada se encuentra cada estudiante/grupo
- [ ] Se puede "avanzar" o "retroceder" en el tiempo de simulación

### RF-05: Intervenciones del Estudiante

**Descripción:** El estudiante debe poder registrar sus propias intervenciones en cada jornada.

**Criterios de Aceptación:**
- [ ] El estudiante agrega notas, diagnósticos diferenciales, plan de trabajo
- [ ] Sus intervenciones se diferencian visualmente de los datos del caso
- [ ] El docente puede revisar y retroalimentar las intervenciones

---

## Modelo de Datos Propuesto

### Opción A: Jornadas como Entidades Separadas

```python
class CasoClinico(models.Model):
    paciente = models.ForeignKey(Paciente)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    activo = models.BooleanField(default=True)

class JornadaSimulacion(models.Model):
    caso = models.ForeignKey(CasoClinico, related_name='jornadas')
    numero = models.PositiveIntegerField()  # 1, 2, 3...
    nombre = models.CharField(max_length=100)  # "Día 1 AM", "Día 1 PM"
    fecha_simulada = models.DateTimeField()
    
    # Datos clínicos de esta jornada
    signos_vitales = models.JSONField(blank=True, null=True)
    indicaciones = models.TextField(blank=True)
    evolucion = models.TextField(blank=True)
    examenes = models.JSONField(blank=True, null=True)
    medicacion = models.JSONField(blank=True, null=True)
    
    # Metadatos
    autor_simulado = models.CharField(max_length=100)  # "Dr. García"
    creado_por = models.ForeignKey(User)  # Docente real
    visible_desde = models.DateTimeField()  # Cuándo se "libera" al estudiante

class IntervencionEstudiante(models.Model):
    jornada = models.ForeignKey(JornadaSimulacion)
    estudiante = models.ForeignKey(User)
    tipo = models.CharField(choices=[
        ('nota', 'Nota Clínica'),
        ('diagnostico', 'Diagnóstico Diferencial'),
        ('plan', 'Plan de Trabajo'),
        ('procedimiento', 'Procedimiento'),
    ])
    contenido = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
```

### Opción B: Historial en Ficha Existente (Extensión del modelo actual)

```python
# Agregar a Ficha existente
class EvolucionFicha(models.Model):
    ficha = models.ForeignKey(Ficha, related_name='evoluciones')
    jornada = models.CharField(max_length=50)  # "Día 1 AM"
    numero_orden = models.PositiveIntegerField()
    
    # Datos de esta evolución
    datos_clinicos = models.JSONField()
    autor_simulado = models.CharField(max_length=100)
    
    # Control
    creado_por = models.ForeignKey(User)
    visible = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
```

---

## Flujo de Usuario

### Para el Docente

1. **Crear Caso Clínico**
   - Define paciente y contexto general
   - Crea las jornadas con los datos de cada momento

2. **Asignar a Estudiantes**
   - Asigna el caso a un grupo o estudiantes individuales
   - Define la jornada inicial visible

3. **Controlar Avance**
   - "Libera" nuevas jornadas cuando corresponda
   - Puede hacerlo manualmente o programado

4. **Revisar Intervenciones**
   - Ve lo que cada estudiante registró
   - Puede agregar retroalimentación

### Para el Estudiante

1. **Acceder al Caso**
   - Ve la ficha del paciente asignado
   - Solo ve hasta la jornada actual

2. **Trabajar con la Información**
   - Lee los datos disponibles
   - Analiza la situación clínica

3. **Registrar Intervenciones**
   - Agrega sus notas y análisis
   - Propone diagnósticos y planes

4. **Recibir Actualizaciones**
   - Al avanzar la simulación, ve nuevos datos
   - Continúa el trabajo con información actualizada

---

## Interfaz de Usuario Propuesta

### Vista de Ficha con Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│  FICHA CLÍNICA - Juan Pérez (Caso: Neumonía Comunitaria)        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Timeline de Jornadas]                                         │
│  ● Día 1 AM ──── ● Día 1 PM ──── ○ Día 2 AM ──── ○ Día 2 PM    │
│    (actual)                        (bloqueado)                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 JORNADA ACTUAL: Día 1 PM                                    │
│  ─────────────────────────────────                              │
│                                                                 │
│  👨‍⚕️ Dr. Martínez (Médico de turno) - 14:30                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Evolución: Paciente con mejoría parcial. Saturación 94%.   ││
│  │ Indicaciones: Continuar esquema ATB. Control SV c/4h.      ││
│  │ Exámenes: Solicitar Rx control mañana.                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  📝 MIS INTERVENCIONES                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [+ Agregar Nota]  [+ Diagnóstico]  [+ Plan de Trabajo]     ││
│  │                                                             ││
│  │ • Nota (15:00): Evalué al paciente, presenta tos           ││
│  │   productiva con expectoración mucosa...                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  📜 HISTORIAL ANTERIOR                                          │
│  ▼ Día 1 AM - Ingreso                                          │
│    └─ Datos de ingreso, motivo consulta...                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requerimientos Adicionales - Gestión de Casos Reutilizables

### RF-06: Fichas Acumulativas por Atención

**Descripción:** La ficha debe acumular TODAS las atenciones realizadas, sin importar quién las haga (diferentes estudiantes, diferentes jornadas).

**Problema del sistema anterior:**
> *"Antes tenían que crear juanito1, juanito2, juanito3..."* para cada sección o semana.

**Solución propuesta:**
- Un paciente = Una ficha maestra
- Cada atención se registra como un "episodio" o "rotación"
- El docente puede "reiniciar" el caso SIN perder el historial

**Criterios de Aceptación:**
- [ ] Cada atención de estudiante se guarda con fecha, hora y autor
- [ ] La ficha muestra historial acumulado de todas las atenciones
- [ ] Se puede filtrar por: semana, sección, estudiante, fecha

### RF-07: Reinicio de Casos (Sin Pérdida de Datos)

**Descripción:** El docente debe poder "reiniciar" un caso clínico para usarlo con una nueva sección de estudiantes, manteniendo el historial completo.

```
┌─────────────────────────────────────────────────────────────────┐
│  PACIENTE: Juan Pérez (Simulado)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 ROTACIÓN ACTUAL (Sección 3 - Semana 12-18 Enero)           │
│  ├── Estado: ACTIVA                                             │
│  ├── Estudiantes asignados: 5                                   │
│  └── Atenciones registradas: 12                                 │
│                                                                 │
│  📦 ROTACIONES ANTERIORES (Archivadas)                          │
│  ├── Sección 2 - Semana 5-11 Enero (8 atenciones)              │
│  ├── Sección 1 - Semana 1-4 Enero (6 atenciones)               │
│  └── Sección 5 - Diciembre 2025 (10 atenciones)                │
│                                                                 │
│  [🔄 REINICIAR CASO]  [📊 Ver Todo el Historial]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Flujo de reinicio:**
1. Docente presiona "Reiniciar Caso"
2. Sistema archiva la rotación actual con todos sus registros
3. Se crea nueva rotación vacía para la nueva sección
4. La ficha "aparece limpia" para los nuevos estudiantes
5. El historial completo sigue accesible para el docente

**Criterios de Aceptación:**
- [ ] Botón "Reiniciar Caso" disponible para docentes
- [ ] Confirmación antes de reiniciar
- [ ] Opción de reinicio automático semanal (configurable)
- [ ] Historial completo accesible desde panel de administración
- [ ] Reportes comparativos entre secciones

### RF-08: Reinicio Automático Semanal (Opcional)

**Descripción:** El sistema puede reiniciar automáticamente los casos cada semana.

**Configuración propuesta:**
```
Configuración de Reinicio Automático:
├── Habilitado: [✓] Sí
├── Día de reinicio: Lunes
├── Hora: 00:00
├── Notificar al docente: [✓] Sí
└── Casos afectados: [Todos] / [Seleccionados]
```

**Criterios de Aceptación:**
- [ ] Configuración por caso o global
- [ ] Selección de día y hora de reinicio
- [ ] Notificación por email al docente
- [ ] Log de reinicios automáticos

### RF-09: RUT Simulado/Falso

**Descripción:** Los pacientes son simulados, por lo tanto el RUT debe poder ser ficticio.

**Criterios de Aceptación:**
- [ ] El campo RUT NO valida formato real obligatoriamente
- [ ] Opción de marcar paciente como "Simulado"
- [ ] RUTs pueden repetirse si se marca como simulado
- [ ] Sugerencia: usar formato `SIM-XXXXX` para RUTs simulados
- [ ] Validación opcional: si parece RUT real, advertir al usuario

**Formato sugerido para RUTs simulados:**
```
SIM-00001    (Paciente simulado #1)
SIM-00002    (Paciente simulado #2)
CASO-NEU-01  (Caso Neurología #1)
PRAC-2026-01 (Práctica 2026 #1)
```

### RF-10: Persistencia de Sesión del Estudiante

**Descripción:** En el sistema anterior, la sesión del estudiante se cerraba frecuentemente y no podían retomar desde donde habían quedado. Esto genera pérdida de trabajo y frustración.

**Problema identificado:**
> *"Al estudiante se le cerraba la sesión. No podían retomar desde donde habían quedado."*

**Causa probable:** 
- Token JWT con tiempo de expiración muy corto
- No se implementó refresh token
- El token no se persistía correctamente en el navegador

**Solución propuesta:**

```
┌─────────────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN DE SESIÓN RECOMENDADA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Access Token:                                                  │
│  ├── Duración: 60 minutos (actual)                             │
│  └── Uso: Autenticación de requests                            │
│                                                                 │
│  Refresh Token:                                                 │
│  ├── Duración: 7 días (o hasta fin de semana de práctica)      │
│  ├── Almacenamiento: HttpOnly Cookie (más seguro)              │
│  └── Uso: Renovar access token sin re-login                    │
│                                                                 │
│  Persistencia:                                                  │
│  ├── LocalStorage: Access token                                │
│  ├── Cookie HttpOnly: Refresh token                            │
│  └── "Recordarme": Extender refresh a 30 días                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Criterios de Aceptación:**
- [ ] La sesión del estudiante dura al menos 1 semana sin necesidad de re-login
- [ ] Si el access token expira, se renueva automáticamente con refresh token
- [ ] El estudiante puede cerrar el navegador y retomar donde quedó
- [ ] Opción "Recordarme" para sesiones más largas
- [ ] Al perder sesión, redirigir a login con mensaje claro (no error críptico)
- [ ] Guardar estado de trabajo en progreso (draft) cada X segundos

**Implementación técnica sugerida:**

```python
# settings.py - Configuración JWT extendida
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),      # 1 hora
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),         # 1 semana
    'ROTATE_REFRESH_TOKENS': True,                       # Nuevo refresh en cada uso
    'BLACKLIST_AFTER_ROTATION': True,                    # Invalidar refresh anterior
    'UPDATE_LAST_LOGIN': True,                           # Actualizar último login
    
    # Para "Recordarme"
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=60),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=30),
}
```

```typescript
// Frontend - Interceptor para renovar token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const newToken = await refreshAccessToken();
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return api(error.config);
      } catch (refreshError) {
        // Solo aquí redirigir a login
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);
```

**Guardado automático de borradores:**
```typescript
// Auto-save cada 30 segundos mientras el estudiante escribe
useEffect(() => {
  const interval = setInterval(() => {
    if (hasUnsavedChanges) {
      saveDraft(currentWork);
    }
  }, 30000);
  return () => clearInterval(interval);
}, [currentWork]);
```

---

## Modelo de Datos Actualizado

### Concepto de Rotaciones

```python
class Paciente(models.Model):
    # Datos básicos
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    rut = models.CharField(max_length=20)  # Puede ser simulado
    es_simulado = models.BooleanField(default=True)  # NUEVO
    
    # ... otros campos

class Rotacion(models.Model):
    """
    Representa un período de uso de un caso clínico.
    Cada vez que se "reinicia" un caso, se crea una nueva rotación.
    """
    caso = models.ForeignKey('CasoClinico', related_name='rotaciones')
    nombre = models.CharField(max_length=100)  # "Sección 3 - Enero 2026"
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    
    # Metadatos
    creada_por = models.ForeignKey(User)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Solo una rotación activa por caso
        constraints = [
            models.UniqueConstraint(
                fields=['caso'],
                condition=models.Q(activa=True),
                name='unique_rotacion_activa'
            )
        ]

class AtencionEstudiante(models.Model):
    """
    Cada intervención de un estudiante en una rotación específica.
    """
    rotacion = models.ForeignKey(Rotacion, related_name='atenciones')
    estudiante = models.ForeignKey(User)
    jornada = models.ForeignKey('JornadaSimulacion', null=True)
    
    # Contenido de la atención
    tipo = models.CharField(choices=[
        ('evaluacion', 'Evaluación'),
        ('nota', 'Nota de Evolución'),
        ('procedimiento', 'Procedimiento'),
        ('indicacion', 'Indicación'),
    ])
    contenido = models.TextField()
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
```

### Flujo de Reinicio en Código

```python
def reiniciar_caso(caso_id, docente, nombre_nueva_rotacion):
    """
    Reinicia un caso clínico para una nueva sección.
    """
    caso = CasoClinico.objects.get(id=caso_id)
    
    # 1. Cerrar rotación actual
    rotacion_actual = caso.rotaciones.filter(activa=True).first()
    if rotacion_actual:
        rotacion_actual.activa = False
        rotacion_actual.fecha_fin = timezone.now().date()
        rotacion_actual.save()
    
    # 2. Crear nueva rotación
    nueva_rotacion = Rotacion.objects.create(
        caso=caso,
        nombre=nombre_nueva_rotacion,
        fecha_inicio=timezone.now().date(),
        activa=True,
        creada_por=docente
    )
    
    # 3. Los registros anteriores se mantienen en la rotación archivada
    # ¡No se borra nada!
    
    return nueva_rotacion
```

---

## Vista de Historial Completo (Solo Docente)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 HISTORIAL COMPLETO - Juan Pérez (SIM-00042)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filtros: [Todas las rotaciones ▼] [2026 ▼] [Exportar PDF]     │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  📁 Sección 3 - Semana 12-18 Enero 2026 (ACTIVA)               │
│  ═══════════════════════════════════════════════════════════   │
│  │                                                              │
│  ├─ 13/01 09:15 - María González (Estudiante)                  │
│  │  └─ Evaluación inicial: Paciente refiere dolor...           │
│  │                                                              │
│  ├─ 13/01 11:30 - Pedro Soto (Estudiante)                      │
│  │  └─ Nota: Se realiza control de signos vitales...           │
│  │                                                              │
│  └─ 13/01 14:45 - Dr. Simulado (Evolución docente)             │
│     └─ Indicaciones: Aumentar dosis de...                      │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  📦 Sección 2 - Semana 5-11 Enero 2026 (Archivada)             │
│  ═══════════════════════════════════════════════════════════   │
│  │                                                              │
│  ├─ 08/01 10:00 - Ana Muñoz (Estudiante)                       │
│  │  └─ Evaluación inicial: ...                                 │
│  │                                                              │
│  └─ ... (8 atenciones más)                                     │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  📦 Sección 1 - Semana 1-4 Enero 2026 (Archivada)              │
│  ═══════════════════════════════════════════════════════════   │
│     ... (6 atenciones)                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comparativa: Sistema Anterior vs Nuevo

| Aspecto | Sistema Anterior | Sistema Nuevo |
|---------|------------------|---------------|
| Reutilizar paciente | Crear juanito1, juanito2... | Un paciente, múltiples rotaciones |
| Historial | Se pierde o mezcla | Organizado por rotación |
| Reinicio | Manual, crear nuevo registro | Un clic, mantiene historial |
| RUT | Debía ser "válido" | Acepta RUTs simulados |
| Comparar secciones | Imposible | Fácil con filtros |
| Reportes | No disponible | Por rotación, estudiante, fecha |

---

## Preguntas Pendientes

1. **¿Cada estudiante tiene su propia "copia" del caso o trabajan sobre el mismo?**
   - Si es individual: cada uno evoluciona independientemente
   - Si es compartido: ven las intervenciones de otros

2. **¿El avance de jornadas es manual o automático?**
   - Manual: el docente decide cuándo avanzar
   - Automático: basado en horario real

3. **¿Se permite editar intervenciones pasadas?**
   - Sí: el estudiante puede corregir
   - No: lo escrito queda como evidencia

4. **¿Cómo se maneja el trabajo en grupo?**
   - ¿Intervenciones individuales visibles para el grupo?
   - ¿Intervenciones grupales colaborativas?

---

## Próximos Pasos

1. [ ] Validar modelo de datos con equipo docente
2. [ ] Definir respuestas a preguntas pendientes
3. [ ] Diseñar mockups de interfaz
4. [ ] Implementar modelos y migraciones
5. [ ] Desarrollar endpoints de API
6. [ ] Implementar vistas de frontend

---

*Documento creado: Enero 2026*
*Última actualización: Por definir*

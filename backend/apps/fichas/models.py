from django.db import models
from django.conf import settings
from apps.pacientes.models import Paciente


# Campos clínicos por defecto para el MVP (ficha ambulatoria)
CAMPOS_CLINICOS_DEFAULT = {
    'motivo_consulta': '',
    'anamnesis': '',
    'examen_fisico': '',
    'diagnostico': '',
    'intervenciones': '',
    'factores': '',
    'rau_necesidades': '',
    'instrumentos_aplicados': '',
}


class CasoClinico(models.Model):
    """Escenario clínico genérico creado por el docente. Reutilizable con distintos pacientes."""
    titulo = models.CharField(max_length=255, help_text="Nombre descriptivo del caso clínico")
    tema = models.CharField(max_length=255, blank=True, default='', help_text="Unidad temática o curricular")
    descripcion = models.TextField(blank=True, default='', help_text="Narrativa completa del escenario clínico")

    # Trazabilidad
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="casos_creados"
    )
    modificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="casos_modificados"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Caso Clínico"
        verbose_name_plural = "Casos Clínicos"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"Caso {self.id} - {self.titulo}"


class AtencionClinica(models.Model):
    """Sesión clínica: une un caso con un paciente en una fecha específica."""
    caso_clinico = models.ForeignKey(
        CasoClinico, on_delete=models.PROTECT,
        related_name="atenciones"
    )
    paciente = models.ForeignKey(
        Paciente, on_delete=models.PROTECT,
        related_name="atenciones"
    )
    fecha_atencion = models.DateField(
        help_text="Fecha de la sesión clínica (visible para estudiantes)"
    )

    # Trazabilidad
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="atenciones_creadas"
    )
    modificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="atenciones_modificadas"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Atención Clínica"
        verbose_name_plural = "Atenciones Clínicas"
        ordering = ['-fecha_atencion']
        constraints = [
            models.UniqueConstraint(
                fields=['caso_clinico', 'paciente', 'fecha_atencion'],
                name='unique_caso_paciente_fecha'
            )
        ]

    def __str__(self):
        return f"Atención {self.id} - {self.caso_clinico.titulo} → {self.paciente} ({self.fecha_atencion})"


class AtencionEstudiante(models.Model):
    """Asignación de un estudiante a una atención clínica (hecha por el docente)."""
    atencion_clinica = models.ForeignKey(
        AtencionClinica, on_delete=models.PROTECT,
        related_name="asignaciones"
    )
    estudiante = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="atenciones_como_estudiante"
    )
    asignado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="asignaciones_realizadas"
    )
    fecha_asignacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Asignación de Estudiante"
        verbose_name_plural = "Asignaciones de Estudiantes"
        ordering = ['-fecha_asignacion']
        constraints = [
            models.UniqueConstraint(
                fields=['atencion_clinica', 'estudiante'],
                name='unique_estudiante_por_atencion',
                condition=models.Q(estudiante__isnull=False)
            )
        ]

    def __str__(self):
        return f"Asignación {self.id} - {self.estudiante} en Atención {self.atencion_clinica_id}"


class TipoAutor(models.TextChoices):
    ESTUDIANTE = 'ESTUDIANTE', 'Estudiante'
    DOCENTE = 'DOCENTE', 'Docente'


class Vineta(models.Model):
    """Inyección de contexto narrativo del docente para un estudiante específico."""
    atencion_estudiante = models.ForeignKey(
        AtencionEstudiante, on_delete=models.CASCADE,
        related_name="vinetas"
    )
    numero = models.PositiveIntegerField(
        help_text="Número secuencial de la viñeta dentro de esta asignación"
    )
    contenido = models.TextField(
        help_text="Texto narrativo de la viñeta (motivo de consulta, resultados, etc.)"
    )
    creada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="vinetas_creadas"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Viñeta"
        verbose_name_plural = "Viñetas"
        ordering = ['numero']
        constraints = [
            models.UniqueConstraint(
                fields=['atencion_estudiante', 'numero'],
                name='unique_numero_por_vineta'
            )
        ]

    def __str__(self):
        return f"Viñeta #{self.numero} - Asignación {self.atencion_estudiante_id}"


class Evolucion(models.Model):
    """Nota clínica en la cadena de evoluciones de una atención-estudiante."""
    atencion_estudiante = models.ForeignKey(
        AtencionEstudiante, on_delete=models.CASCADE,
        related_name="evoluciones"
    )
    vineta = models.ForeignKey(
        Vineta, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="evoluciones_asociadas",
        help_text="Viñeta a la que responde esta evolución (opcional)"
    )
    numero = models.PositiveIntegerField(
        help_text="Número secuencial de la evolución dentro de esta asignación"
    )
    contenido = models.JSONField(
        default=dict,
        blank=True,
        help_text="Campos clínicos de esta evolución"
    )
    tipo_autor = models.CharField(
        max_length=20,
        choices=TipoAutor.choices,
        help_text="Rol con el que se creó esta evolución"
    )
    nombre_autor = models.CharField(
        max_length=255,
        help_text="Nombre visible del autor (ej: 'Doctor Pérez' o nombre del estudiante)"
    )
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="evoluciones_creadas"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Evolución"
        verbose_name_plural = "Evoluciones"
        ordering = ['numero']
        constraints = [
            models.UniqueConstraint(
                fields=['atencion_estudiante', 'numero'],
                name='unique_numero_por_atencion_estudiante'
            )
        ]

    def __str__(self):
        return f"Evolución #{self.numero} - {self.nombre_autor} ({self.tipo_autor})"

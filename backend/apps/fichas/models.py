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


class Ficha(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, related_name="fichas")

    # Tipo de ficha y relaciones
    es_plantilla = models.BooleanField(default=False, help_text="True si es la ficha base creada por docente")
    ficha_base = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="fichas_estudiantes",
        help_text="Ficha plantilla de la cual se originó esta ficha de estudiante"
    )
    estudiante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="fichas_como_estudiante",
        help_text="Estudiante dueño de esta ficha (null si es plantilla)"
    )

    # Contenido clínico flexible
    contenido = models.JSONField(
        default=dict,
        blank=True,
        help_text="Campos clínicos de la ficha en formato JSON"
    )

    # Trazabilidad
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="fichas_creadas")
    modificado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="fichas_modificadas")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ficha"
        verbose_name_plural = "Fichas"
        ordering = ['-fecha_creacion']
        constraints = [
            models.UniqueConstraint(
                fields=['ficha_base', 'estudiante'],
                name='unique_estudiante_por_ficha_base',
                condition=models.Q(estudiante__isnull=False)
            )
        ]

    def __str__(self):
        if self.es_plantilla:
            return f"Ficha Base {self.id} - {self.paciente}"
        elif self.estudiante:
            return f"Ficha {self.id} - {self.paciente} (Est: {self.estudiante})"
        return f"Ficha {self.id} - {self.paciente}"


class FichaVersion(models.Model):
    """Guarda el historial de versiones de cada ficha"""
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, related_name="versiones")
    version = models.PositiveIntegerField()
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    rol_autor = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text="Rol con el que actuó el autor (ESTUDIANTE, DOCENTE, etc.)"
    )
    fecha = models.DateTimeField(auto_now_add=True)
    contenido = models.JSONField(
        default=dict,
        blank=True,
        help_text="Snapshot del contenido clínico en esta versión"
    )

    class Meta:
        verbose_name = "Versión de Ficha"
        verbose_name_plural = "Versiones de Fichas"
        ordering = ['-version']
        constraints = [
            models.UniqueConstraint(
                fields=['ficha', 'version'],
                name='unique_version_por_ficha'
            )
        ]

    def __str__(self):
        return f"Ficha {self.ficha_id} - Versión {self.version}"

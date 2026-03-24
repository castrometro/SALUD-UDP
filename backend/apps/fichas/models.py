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


class Plantilla(models.Model):
    """Contenido clínico reutilizable, sin paciente. Creada por docentes."""
    titulo = models.CharField(max_length=255, help_text="Nombre descriptivo del caso clínico")
    descripcion = models.TextField(blank=True, default='', help_text="Descripción breve del caso")
    contenido = models.JSONField(
        default=dict,
        blank=True,
        help_text="Campos clínicos de la plantilla en formato JSON"
    )

    # Trazabilidad
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="plantillas_creadas"
    )
    modificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="plantillas_modificadas"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Plantilla"
        verbose_name_plural = "Plantillas"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"Plantilla {self.id} - {self.titulo}"


class CasoClinico(models.Model):
    """Instancia de trabajo: una plantilla asignada a un paciente."""
    plantilla = models.ForeignKey(
        Plantilla, on_delete=models.PROTECT,
        related_name="casos_clinicos"
    )
    paciente = models.ForeignKey(
        Paciente, on_delete=models.PROTECT,
        related_name="casos_clinicos"
    )

    # Trazabilidad
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="casos_creados"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Caso Clínico"
        verbose_name_plural = "Casos Clínicos"
        ordering = ['-fecha_creacion']
        constraints = [
            models.UniqueConstraint(
                fields=['plantilla', 'paciente'],
                name='unique_paciente_por_plantilla'
            )
        ]

    def __str__(self):
        return f"Caso {self.id} - {self.plantilla.titulo} → {self.paciente}"


class FichaEstudiante(models.Model):
    """Copia de trabajo de un estudiante dentro de un caso clínico."""
    caso_clinico = models.ForeignKey(
        CasoClinico, on_delete=models.PROTECT,
        related_name="fichas_estudiantes"
    )
    estudiante = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="fichas_como_estudiante"
    )
    contenido = models.JSONField(
        default=dict,
        blank=True,
        help_text="Campos clínicos de la ficha del estudiante"
    )

    # Trazabilidad
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="fichas_estudiante_creadas"
    )
    modificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="fichas_estudiante_modificadas"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ficha de Estudiante"
        verbose_name_plural = "Fichas de Estudiantes"
        ordering = ['-fecha_creacion']
        constraints = [
            models.UniqueConstraint(
                fields=['caso_clinico', 'estudiante'],
                name='unique_estudiante_por_caso',
                condition=models.Q(estudiante__isnull=False)
            )
        ]

    def __str__(self):
        return f"Ficha {self.id} - Caso {self.caso_clinico_id} (Est: {self.estudiante})"


class FichaVersion(models.Model):
    """Guarda el historial de versiones de cada ficha de estudiante"""
    ficha = models.ForeignKey(FichaEstudiante, on_delete=models.CASCADE, related_name="versiones")
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

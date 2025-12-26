from django.db import models
from django.conf import settings
from apps.pacientes.models import Paciente

class FichaAmbulatoria(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="fichas_ambulatorias")
    
    # Tipo de ficha y relaciones
    es_plantilla = models.BooleanField(default=False, help_text="True si es la ficha base creada por docente")
    ficha_base = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="fichas_estudiantes",
        help_text="Ficha plantilla de la cual se originó esta ficha de estudiante"
    )
    estudiante = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="fichas_como_estudiante",
        help_text="Estudiante dueño de esta ficha (null si es plantilla)"
    )
    
    # Trazabilidad
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="fichas_creadas")
    modificado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="fichas_modificadas")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    # Campos Clínicos (Fieles al original)
    motivo_consulta = models.TextField(blank=True)
    anamnesis = models.TextField(blank=True)
    examen_fisico = models.TextField(blank=True)
    diagnostico = models.TextField(blank=True)
    intervenciones = models.TextField(blank=True)
    factores = models.TextField(blank=True)
    rau_necesidades = models.TextField(blank=True)
    instrumentos_aplicados = models.TextField(blank=True)

    class Meta:
        verbose_name = "Ficha Ambulatoria"
        verbose_name_plural = "Fichas Ambulatorias"
        ordering = ['-fecha_creacion']
        # Un estudiante solo puede tener una ficha por ficha_base
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


class FichaHistorial(models.Model):
    """Guarda el historial de versiones de cada ficha"""
    ficha = models.ForeignKey(FichaAmbulatoria, on_delete=models.CASCADE, related_name="historial")
    version = models.PositiveIntegerField()
    modificado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    
    # Snapshot de los campos clínicos en esa versión
    motivo_consulta = models.TextField(blank=True)
    anamnesis = models.TextField(blank=True)
    examen_fisico = models.TextField(blank=True)
    diagnostico = models.TextField(blank=True)
    intervenciones = models.TextField(blank=True)
    factores = models.TextField(blank=True)
    rau_necesidades = models.TextField(blank=True)
    instrumentos_aplicados = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Historial de Ficha"
        verbose_name_plural = "Historial de Fichas"
        ordering = ['-version']
        unique_together = ['ficha', 'version']
    
    def __str__(self):
        return f"Ficha {self.ficha_id} - Versión {self.version}"

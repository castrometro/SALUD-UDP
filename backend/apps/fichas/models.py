from django.db import models
from django.conf import settings
from apps.pacientes.models import Paciente

class FichaAmbulatoria(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="fichas_ambulatorias")
    
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

    def __str__(self):
        return f"Ficha {self.id} - {self.paciente}"

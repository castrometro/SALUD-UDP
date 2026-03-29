from django.db import models
from datetime import date
from apps.common.validators import validate_rut, format_rut


class Sexo(models.TextChoices):
    MASCULINO = 'MASCULINO', 'Masculino'
    FEMENINO = 'FEMENINO', 'Femenino'
    OTRO = 'OTRO', 'Otro'
    NO_INFORMA = 'NO_INFORMA', 'No informa'


class Prevision(models.TextChoices):
    FONASA = 'FONASA', 'FONASA'
    ISAPRE = 'ISAPRE', 'ISAPRE'
    PARTICULAR = 'PARTICULAR', 'PARTICULAR'


class Paciente(models.Model):
    rut = models.CharField(max_length=20, unique=True, verbose_name="RUT", validators=[validate_rut])
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    prevision = models.CharField(max_length=20, choices=Prevision.choices)
    correo = models.EmailField(blank=True, null=True)
    numero_telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_nacimiento = models.DateField()
    sexo = models.CharField(max_length=20, choices=Sexo.choices, default=Sexo.NO_INFORMA)
    domicilio = models.CharField(max_length=200, blank=True, null=True)
    antecedentes_personales = models.TextField(blank=True, default='', help_text="Antecedentes médicos del paciente")
    medicamentos_habituales = models.TextField(blank=True, default='', help_text="Medicamentos de uso habitual")
    alergias = models.TextField(blank=True, default='', help_text="Alergias conocidas")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.rut:
            self.rut = format_rut(self.rut)
        super().save(*args, **kwargs)

    @property
    def edad(self):
        today = date.today()
        return today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.rut})"

from django.contrib import admin
from .models import Paciente

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('rut', 'nombre', 'apellido', 'sexo', 'edad', 'prevision')
    search_fields = ('rut', 'nombre', 'apellido')
    list_filter = ('sexo', 'prevision')

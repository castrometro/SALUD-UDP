from django.contrib import admin
from .models import FichaAmbulatoria

@admin.register(FichaAmbulatoria)
class FichaAmbulatoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente', 'fecha_creacion', 'creado_por')
    list_filter = ('fecha_creacion', 'creado_por')
    search_fields = ('paciente__rut', 'paciente__nombre')

from django.contrib import admin
from .models import FichaAmbulatoria, FichaHistorial

@admin.register(FichaAmbulatoria)
class FichaAmbulatoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente', 'es_plantilla', 'estudiante', 'fecha_creacion', 'creado_por')
    list_filter = ('es_plantilla', 'fecha_creacion', 'creado_por')
    search_fields = ('paciente__rut', 'paciente__nombre', 'estudiante__email')
    raw_id_fields = ('paciente', 'estudiante', 'ficha_base', 'creado_por', 'modificado_por')


@admin.register(FichaHistorial)
class FichaHistorialAdmin(admin.ModelAdmin):
    list_display = ('id', 'ficha', 'version', 'modificado_por', 'fecha')
    list_filter = ('fecha', 'modificado_por')
    search_fields = ('ficha__id',)
    raw_id_fields = ('ficha', 'modificado_por')

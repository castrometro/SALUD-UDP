from django.contrib import admin
from .models import Ficha, FichaVersion

@admin.register(Ficha)
class FichaAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente', 'es_plantilla', 'estudiante', 'fecha_creacion', 'creado_por')
    list_filter = ('es_plantilla', 'fecha_creacion', 'creado_por')
    search_fields = ('paciente__rut', 'paciente__nombre', 'estudiante__email')
    raw_id_fields = ('paciente', 'estudiante', 'ficha_base', 'creado_por', 'modificado_por')


@admin.register(FichaVersion)
class FichaVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'ficha', 'version', 'autor', 'rol_autor', 'fecha')
    list_filter = ('fecha', 'rol_autor', 'autor')
    search_fields = ('ficha__id',)
    raw_id_fields = ('ficha', 'autor')

from django.contrib import admin
from .models import CasoClinico, FichaEstudiante, FichaVersion


@admin.register(CasoClinico)
class CasoClinicoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'paciente', 'creado_por', 'fecha_creacion')
    list_filter = ('fecha_creacion', 'creado_por')
    search_fields = ('titulo', 'descripcion', 'paciente__rut', 'paciente__nombre')
    raw_id_fields = ('paciente', 'creado_por', 'modificado_por')


@admin.register(FichaEstudiante)
class FichaEstudianteAdmin(admin.ModelAdmin):
    list_display = ('id', 'caso_clinico', 'estudiante', 'fecha_creacion', 'modificado_por')
    list_filter = ('fecha_creacion',)
    search_fields = ('estudiante__email', 'caso_clinico__titulo')
    raw_id_fields = ('caso_clinico', 'estudiante', 'creado_por', 'modificado_por')


@admin.register(FichaVersion)
class FichaVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'ficha', 'version', 'autor', 'rol_autor', 'fecha')
    list_filter = ('fecha', 'rol_autor', 'autor')
    search_fields = ('ficha__id',)
    raw_id_fields = ('ficha', 'autor')

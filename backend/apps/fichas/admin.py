from django.contrib import admin
from .models import CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion, Vineta


@admin.register(CasoClinico)
class CasoClinicoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'creado_por', 'fecha_creacion')
    list_filter = ('fecha_creacion', 'creado_por')
    search_fields = ('titulo', 'descripcion')
    raw_id_fields = ('creado_por', 'modificado_por')


@admin.register(AtencionClinica)
class AtencionClinicaAdmin(admin.ModelAdmin):
    list_display = ('id', 'caso_clinico', 'paciente', 'fecha_atencion', 'creado_por', 'fecha_creacion')
    list_filter = ('fecha_atencion', 'creado_por')
    search_fields = ('caso_clinico__titulo', 'paciente__nombre', 'paciente__rut')
    raw_id_fields = ('caso_clinico', 'paciente', 'creado_por', 'modificado_por')


@admin.register(AtencionEstudiante)
class AtencionEstudianteAdmin(admin.ModelAdmin):
    list_display = ('id', 'atencion_clinica', 'estudiante', 'asignado_por', 'fecha_asignacion')
    list_filter = ('fecha_asignacion',)
    search_fields = ('estudiante__email', 'atencion_clinica__caso_clinico__titulo')
    raw_id_fields = ('atencion_clinica', 'estudiante', 'asignado_por')


@admin.register(Evolucion)
class EvolucionAdmin(admin.ModelAdmin):
    list_display = ('id', 'atencion_estudiante', 'numero', 'tipo_autor', 'nombre_autor', 'fecha_creacion')
    list_filter = ('tipo_autor', 'fecha_creacion')
    search_fields = ('nombre_autor',)
    raw_id_fields = ('atencion_estudiante', 'creado_por', 'vineta')


@admin.register(Vineta)
class VinetaAdmin(admin.ModelAdmin):
    list_display = ('id', 'atencion_estudiante', 'numero', 'creada_por', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('contenido',)
    raw_id_fields = ('atencion_estudiante', 'creada_por')

from rest_framework import serializers
from .models import FichaAmbulatoria, FichaHistorial
from apps.pacientes.serializers import PacienteSerializer


class FichaHistorialSerializer(serializers.ModelSerializer):
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    
    class Meta:
        model = FichaHistorial
        fields = '__all__'


class FichaAmbulatoriaSerializer(serializers.ModelSerializer):
    paciente_detail = PacienteSerializer(source='paciente', read_only=True)
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.get_full_name')
    # Información de la ficha base si existe
    ficha_base_info = serializers.SerializerMethodField()
    # Número de versiones en historial
    total_versiones = serializers.SerializerMethodField()

    class Meta:
        model = FichaAmbulatoria
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Hacer campos opcionales
        if 'estudiante' in self.fields:
            self.fields['estudiante'].required = False
            self.fields['estudiante'].allow_null = True
        if 'ficha_base' in self.fields:
            self.fields['ficha_base'].required = False
            self.fields['ficha_base'].allow_null = True

    def get_ficha_base_info(self, obj):
        if obj.ficha_base:
            return {
                'id': obj.ficha_base.id,
                'fecha_modificacion': obj.ficha_base.fecha_modificacion,
                'modificado_por_nombre': obj.ficha_base.modificado_por.get_full_name() if obj.ficha_base.modificado_por else None
            }
        return None
    
    def get_total_versiones(self, obj):
        return obj.historial.count()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creado_por'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Guardar versión anterior en historial antes de actualizar
        self._guardar_historial(instance, user)
        
        if user:
            validated_data['modificado_por'] = user
        return super().update(instance, validated_data)
    
    def _guardar_historial(self, ficha, usuario):
        """Guarda una versión del estado actual de la ficha antes de modificarla"""
        ultima_version = ficha.historial.first()
        nueva_version = (ultima_version.version + 1) if ultima_version else 1
        
        FichaHistorial.objects.create(
            ficha=ficha,
            version=nueva_version,
            modificado_por=usuario,
            motivo_consulta=ficha.motivo_consulta,
            anamnesis=ficha.anamnesis,
            examen_fisico=ficha.examen_fisico,
            diagnostico=ficha.diagnostico,
            intervenciones=ficha.intervenciones,
            factores=ficha.factores,
            rau_necesidades=ficha.rau_necesidades,
            instrumentos_aplicados=ficha.instrumentos_aplicados,
        )


class CrearFichaEstudianteSerializer(serializers.Serializer):
    """Serializer para crear una ficha de estudiante basada en una plantilla"""
    ficha_base_id = serializers.IntegerField()
    
    def validate_ficha_base_id(self, value):
        try:
            ficha_base = FichaAmbulatoria.objects.get(id=value, es_plantilla=True)
        except FichaAmbulatoria.DoesNotExist:
            raise serializers.ValidationError("La ficha base no existe o no es una plantilla")
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        ficha_base = FichaAmbulatoria.objects.get(id=validated_data['ficha_base_id'])
        
        # Verificar si ya existe una ficha para este estudiante
        existing = FichaAmbulatoria.objects.filter(
            ficha_base=ficha_base,
            estudiante=user
        ).first()
        
        if existing:
            raise serializers.ValidationError("Ya tienes una ficha para este caso")
        
        # Crear copia de la ficha base para el estudiante
        ficha_estudiante = FichaAmbulatoria.objects.create(
            paciente=ficha_base.paciente,
            es_plantilla=False,
            ficha_base=ficha_base,
            estudiante=user,
            creado_por=user,
            # Copiar campos clínicos de la ficha base
            motivo_consulta=ficha_base.motivo_consulta,
            anamnesis=ficha_base.anamnesis,
            examen_fisico=ficha_base.examen_fisico,
            diagnostico=ficha_base.diagnostico,
            intervenciones=ficha_base.intervenciones,
            factores=ficha_base.factores,
            rau_necesidades=ficha_base.rau_necesidades,
            instrumentos_aplicados=ficha_base.instrumentos_aplicados,
        )
        
        return ficha_estudiante

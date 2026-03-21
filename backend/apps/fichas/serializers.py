from rest_framework import serializers
from .models import Ficha, FichaVersion, CAMPOS_CLINICOS_DEFAULT
from apps.pacientes.serializers import PacienteSerializer


class FichaVersionSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.ReadOnlyField(source='autor.get_full_name')

    class Meta:
        model = FichaVersion
        fields = '__all__'


class FichaSerializer(serializers.ModelSerializer):
    paciente_detail = PacienteSerializer(source='paciente', read_only=True)
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.get_full_name')
    ficha_base_info = serializers.SerializerMethodField()
    total_versiones = serializers.SerializerMethodField()

    class Meta:
        model = Ficha
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
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
        return obj.versiones.count()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creado_por'] = request.user
        if not validated_data.get('contenido'):
            validated_data['contenido'] = CAMPOS_CLINICOS_DEFAULT.copy()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        # Guardar versión anterior antes de actualizar
        self._guardar_version(instance, user)

        if user:
            validated_data['modificado_por'] = user
        return super().update(instance, validated_data)

    def _guardar_version(self, ficha, usuario):
        """Guarda una versión del estado actual de la ficha antes de modificarla"""
        ultima_version = ficha.versiones.first()
        nueva_version = (ultima_version.version + 1) if ultima_version else 1

        FichaVersion.objects.create(
            ficha=ficha,
            version=nueva_version,
            autor=usuario,
            rol_autor=usuario.role if usuario else '',
            contenido=ficha.contenido,
        )


class CrearFichaEstudianteSerializer(serializers.Serializer):
    """Serializer para crear una ficha de estudiante basada en una plantilla"""
    ficha_base_id = serializers.IntegerField()

    def validate_ficha_base_id(self, value):
        try:
            Ficha.objects.get(id=value, es_plantilla=True)
        except Ficha.DoesNotExist:
            raise serializers.ValidationError("La ficha base no existe o no es una plantilla")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        ficha_base = Ficha.objects.get(id=validated_data['ficha_base_id'])

        existing = Ficha.objects.filter(
            ficha_base=ficha_base,
            estudiante=user
        ).first()

        if existing:
            raise serializers.ValidationError("Ya tienes una ficha para este caso")

        ficha_estudiante = Ficha.objects.create(
            paciente=ficha_base.paciente,
            es_plantilla=False,
            ficha_base=ficha_base,
            estudiante=user,
            creado_por=user,
            contenido=ficha_base.contenido.copy() if ficha_base.contenido else CAMPOS_CLINICOS_DEFAULT.copy(),
        )

        return ficha_estudiante

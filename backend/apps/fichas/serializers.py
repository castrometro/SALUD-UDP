from rest_framework import serializers
from .models import CasoClinico, FichaEstudiante, FichaVersion, CAMPOS_CLINICOS_DEFAULT
from apps.pacientes.serializers import PacienteSerializer


# ──────────────────────────────────────────────
# Caso Clínico
# ──────────────────────────────────────────────

class CasoClinicoSerializer(serializers.ModelSerializer):
    paciente_detail = PacienteSerializer(source='paciente', read_only=True)
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    total_estudiantes = serializers.SerializerMethodField()

    class Meta:
        model = CasoClinico
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

    def get_total_estudiantes(self, obj):
        # Prefer annotation set by ViewSet to avoid N+1 in list views
        if hasattr(obj, 'total_estudiantes'):
            return obj.total_estudiantes
        return obj.fichas_estudiantes.count()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creado_por'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['modificado_por'] = request.user
        return super().update(instance, validated_data)


# ──────────────────────────────────────────────
# Ficha de Estudiante
# ──────────────────────────────────────────────

class FichaEstudianteSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.get_full_name')
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    caso_clinico_detail = CasoClinicoSerializer(source='caso_clinico', read_only=True)
    total_versiones = serializers.SerializerMethodField()

    class Meta:
        model = FichaEstudiante
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

    def get_total_versiones(self, obj):
        # Prefer annotation set by ViewSet to avoid N+1 in list views
        if hasattr(obj, 'total_versiones'):
            return obj.total_versiones
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


# ──────────────────────────────────────────────
# Ficha Version (historial)
# ──────────────────────────────────────────────

class FichaVersionSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.ReadOnlyField(source='autor.get_full_name')

    class Meta:
        model = FichaVersion
        fields = '__all__'


# ──────────────────────────────────────────────
# Crear ficha de estudiante (endpoint especial)
# ──────────────────────────────────────────────

class CrearFichaEstudianteSerializer(serializers.Serializer):
    """Serializer para que un estudiante cree su ficha en un caso clínico."""
    caso_clinico_id = serializers.IntegerField()

    def validate_caso_clinico_id(self, value):
        try:
            CasoClinico.objects.get(id=value)
        except CasoClinico.DoesNotExist:
            raise serializers.ValidationError("El caso clínico no existe")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        caso = CasoClinico.objects.get(id=validated_data['caso_clinico_id'])

        existing = FichaEstudiante.objects.filter(
            caso_clinico=caso,
            estudiante=user
        ).first()

        if existing:
            raise serializers.ValidationError("Ya tienes una ficha para este caso clínico")

        ficha_estudiante = FichaEstudiante.objects.create(
            caso_clinico=caso,
            estudiante=user,
            creado_por=user,
            contenido=CAMPOS_CLINICOS_DEFAULT.copy(),
        )

        return ficha_estudiante

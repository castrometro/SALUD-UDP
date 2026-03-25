from rest_framework import serializers
from .models import (
    CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion,
    CAMPOS_CLINICOS_DEFAULT,
)
from apps.pacientes.serializers import PacienteSerializer


# ──────────────────────────────────────────────
# Caso Clínico
# ──────────────────────────────────────────────

class CasoClinicoSerializer(serializers.ModelSerializer):
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    total_atenciones = serializers.SerializerMethodField()

    class Meta:
        model = CasoClinico
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

    def get_total_atenciones(self, obj):
        if hasattr(obj, 'total_atenciones'):
            return obj.total_atenciones
        return obj.atenciones.count()

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
# Atención Clínica
# ──────────────────────────────────────────────

class AtencionClinicaSerializer(serializers.ModelSerializer):
    caso_clinico_detail = CasoClinicoSerializer(source='caso_clinico', read_only=True)
    paciente_detail = PacienteSerializer(source='paciente', read_only=True)
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')
    modificado_por_nombre = serializers.ReadOnlyField(source='modificado_por.get_full_name')
    total_estudiantes = serializers.SerializerMethodField()

    class Meta:
        model = AtencionClinica
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

    def get_total_estudiantes(self, obj):
        if hasattr(obj, 'total_estudiantes'):
            return obj.total_estudiantes
        return obj.asignaciones.count()

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
# Atención Estudiante (asignación)
# ──────────────────────────────────────────────

class AtencionEstudianteSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.get_full_name')
    asignado_por_nombre = serializers.ReadOnlyField(source='asignado_por.get_full_name')
    total_evoluciones = serializers.SerializerMethodField()
    atencion_clinica_detail = AtencionClinicaSerializer(source='atencion_clinica', read_only=True)

    class Meta:
        model = AtencionEstudiante
        fields = '__all__'
        read_only_fields = ('asignado_por', 'fecha_asignacion')

    def get_total_evoluciones(self, obj):
        if hasattr(obj, 'total_evoluciones'):
            return obj.total_evoluciones
        return obj.evoluciones.count()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['asignado_por'] = request.user
        return super().create(validated_data)


# ──────────────────────────────────────────────
# Evolución
# ──────────────────────────────────────────────

class EvolucionSerializer(serializers.ModelSerializer):
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')

    class Meta:
        model = Evolucion
        fields = '__all__'
        read_only_fields = ('numero', 'creado_por', 'fecha_creacion')

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        # Auto-calcular número secuencial
        atencion_est = validated_data['atencion_estudiante']
        ultimo = atencion_est.evoluciones.order_by('-numero').first()
        validated_data['numero'] = (ultimo.numero + 1) if ultimo else 1

        # Asignar creado_por
        if user:
            validated_data['creado_por'] = user

        # Auto-rellenar nombre_autor si no se proporcionó
        if not validated_data.get('nombre_autor') and user:
            validated_data['nombre_autor'] = user.get_full_name()

        # Inicializar contenido vacío si no se proporcionó
        if not validated_data.get('contenido'):
            validated_data['contenido'] = CAMPOS_CLINICOS_DEFAULT.copy()

        return super().create(validated_data)


# ──────────────────────────────────────────────
# Serializers para endpoints especiales
# ──────────────────────────────────────────────

class AsignarEstudianteSerializer(serializers.Serializer):
    """Asignar un estudiante a una atención clínica."""
    estudiante_id = serializers.IntegerField()

    def validate_estudiante_id(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("El estudiante no existe")
        if user.role != 'ESTUDIANTE':
            raise serializers.ValidationError("El usuario no tiene rol de estudiante")
        return value


class CrearEvolucionSerializer(serializers.Serializer):
    """Crear una evolución en una atención-estudiante."""
    contenido = serializers.JSONField(required=False, default=dict)
    tipo_autor = serializers.ChoiceField(choices=[('ESTUDIANTE', 'Estudiante'), ('DOCENTE', 'Docente')])
    nombre_autor = serializers.CharField(max_length=255, required=False, allow_blank=True)

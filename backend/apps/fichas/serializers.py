from rest_framework import serializers
from .models import FichaAmbulatoria
from apps.pacientes.serializers import PacienteSerializer

class FichaAmbulatoriaSerializer(serializers.ModelSerializer):
    paciente_detail = PacienteSerializer(source='paciente', read_only=True)
    creado_por_nombre = serializers.ReadOnlyField(source='creado_por.get_full_name')

    class Meta:
        model = FichaAmbulatoria
        fields = '__all__'
        read_only_fields = ('creado_por', 'modificado_por', 'fecha_creacion', 'fecha_modificacion')

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

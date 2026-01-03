import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from apps.fichas.models import FichaAmbulatoria
from apps.pacientes.tests.factories import PacienteFactory

class FichaAmbulatoriaFactory(DjangoModelFactory):
    class Meta:
        model = FichaAmbulatoria
    
    paciente = factory.SubFactory(PacienteFactory)
    motivo_consulta = "Dolor de cabeza"
    es_plantilla = True

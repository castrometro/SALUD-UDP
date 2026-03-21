import factory
from factory.django import DjangoModelFactory
from apps.fichas.models import Ficha, CAMPOS_CLINICOS_DEFAULT
from apps.pacientes.tests.factories import PacienteFactory

class FichaFactory(DjangoModelFactory):
    class Meta:
        model = Ficha

    paciente = factory.SubFactory(PacienteFactory)
    contenido = factory.LazyFunction(lambda: CAMPOS_CLINICOS_DEFAULT.copy())
    es_plantilla = True

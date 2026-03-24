import factory
from factory.django import DjangoModelFactory
from apps.fichas.models import Plantilla, CasoClinico, FichaEstudiante, CAMPOS_CLINICOS_DEFAULT
from apps.pacientes.tests.factories import PacienteFactory
from apps.users.tests.factories import UserFactory


class PlantillaFactory(DjangoModelFactory):
    class Meta:
        model = Plantilla

    titulo = factory.Sequence(lambda n: f"Caso clínico {n}")
    contenido = factory.LazyFunction(lambda: CAMPOS_CLINICOS_DEFAULT.copy())
    creado_por = factory.SubFactory(UserFactory, role='DOCENTE')


class CasoClinicoFactory(DjangoModelFactory):
    class Meta:
        model = CasoClinico

    plantilla = factory.SubFactory(PlantillaFactory)
    paciente = factory.SubFactory(PacienteFactory)
    creado_por = factory.SubFactory(UserFactory, role='DOCENTE')


class FichaEstudianteFactory(DjangoModelFactory):
    class Meta:
        model = FichaEstudiante

    caso_clinico = factory.SubFactory(CasoClinicoFactory)
    estudiante = factory.SubFactory(UserFactory, role='ESTUDIANTE')
    contenido = factory.LazyFunction(lambda: CAMPOS_CLINICOS_DEFAULT.copy())
    creado_por = factory.LazyAttribute(lambda o: o.estudiante)

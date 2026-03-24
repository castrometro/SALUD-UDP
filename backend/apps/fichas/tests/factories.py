import factory
from factory.django import DjangoModelFactory
from apps.fichas.models import CasoClinico, FichaEstudiante, CAMPOS_CLINICOS_DEFAULT
from apps.pacientes.tests.factories import PacienteFactory
from apps.users.tests.factories import UserFactory


class CasoClinicoFactory(DjangoModelFactory):
    class Meta:
        model = CasoClinico

    titulo = factory.Sequence(lambda n: f"Caso clínico {n}")
    descripcion = factory.Faker('paragraph', nb_sentences=3, locale='es_CL')
    paciente = factory.SubFactory(PacienteFactory)
    creado_por = factory.SubFactory(UserFactory, role='DOCENTE')


class FichaEstudianteFactory(DjangoModelFactory):
    class Meta:
        model = FichaEstudiante

    caso_clinico = factory.SubFactory(CasoClinicoFactory)
    estudiante = factory.SubFactory(UserFactory, role='ESTUDIANTE')
    contenido = factory.LazyFunction(lambda: CAMPOS_CLINICOS_DEFAULT.copy())
    creado_por = factory.LazyAttribute(lambda o: o.estudiante)

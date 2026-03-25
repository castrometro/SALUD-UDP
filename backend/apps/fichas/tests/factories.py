import factory
from factory.django import DjangoModelFactory
from apps.fichas.models import CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion, CAMPOS_CLINICOS_DEFAULT
from apps.pacientes.tests.factories import PacienteFactory
from apps.users.tests.factories import UserFactory


class CasoClinicoFactory(DjangoModelFactory):
    class Meta:
        model = CasoClinico

    titulo = factory.Sequence(lambda n: f"Caso clínico {n}")
    descripcion = factory.Faker('paragraph', nb_sentences=3, locale='es_CL')
    creado_por = factory.SubFactory(UserFactory, role='DOCENTE')


class AtencionClinicaFactory(DjangoModelFactory):
    class Meta:
        model = AtencionClinica

    caso_clinico = factory.SubFactory(CasoClinicoFactory)
    paciente = factory.SubFactory(PacienteFactory)
    fecha_atencion = factory.Faker('date_this_year')
    creado_por = factory.LazyAttribute(lambda o: o.caso_clinico.creado_por)


class AtencionEstudianteFactory(DjangoModelFactory):
    class Meta:
        model = AtencionEstudiante

    atencion_clinica = factory.SubFactory(AtencionClinicaFactory)
    estudiante = factory.SubFactory(UserFactory, role='ESTUDIANTE')
    asignado_por = factory.LazyAttribute(lambda o: o.atencion_clinica.creado_por)


class EvolucionFactory(DjangoModelFactory):
    class Meta:
        model = Evolucion

    atencion_estudiante = factory.SubFactory(AtencionEstudianteFactory)
    numero = factory.Sequence(lambda n: n + 1)
    contenido = factory.LazyFunction(lambda: CAMPOS_CLINICOS_DEFAULT.copy())
    tipo_autor = 'ESTUDIANTE'
    nombre_autor = factory.LazyAttribute(lambda o: o.atencion_estudiante.estudiante.get_full_name())
    creado_por = factory.LazyAttribute(lambda o: o.atencion_estudiante.estudiante)

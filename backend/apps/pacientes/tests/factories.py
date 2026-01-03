import factory
from factory.django import DjangoModelFactory
from apps.pacientes.models import Paciente
import datetime

class PacienteFactory(DjangoModelFactory):
    class Meta:
        model = Paciente
    
    rut = factory.Sequence(lambda n: f'12.345.67{n}-9')
    nombre = factory.Faker('first_name')
    apellido = factory.Faker('last_name')
    fecha_nacimiento = datetime.date(1990, 1, 1)
    prevision = 'FONASA'

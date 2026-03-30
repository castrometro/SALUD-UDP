import pytest
import datetime
from .factories import PacienteFactory

@pytest.mark.django_db
class TestPacienteModel:
    def test_create_paciente(self):
        paciente = PacienteFactory(nombre="Juan", apellido="Perez")
        assert paciente.nombre == "Juan"
        assert str(paciente).startswith("Juan Perez")

    def test_calculo_edad(self):
        today = datetime.date.today()
        # Nació hace exactamente 20 años
        birth_date = today.replace(year=today.year - 20)
        paciente = PacienteFactory(fecha_nacimiento=birth_date)
        assert paciente.edad == 20

        # Nació mañana hace 20 años (todavía tiene 19)
        birth_date_tomorrow = today.replace(year=today.year - 20) + datetime.timedelta(days=1)
        paciente_joven = PacienteFactory(fecha_nacimiento=birth_date_tomorrow)
        assert paciente_joven.edad == 19

    def test_campos_clinicos_paciente(self):
        """El paciente puede tener sexo, antecedentes, medicamentos y alergias"""
        paciente = PacienteFactory(
            sexo='FEMENINO',
            antecedentes_personales='DM2, HTA',
            medicamentos_habituales='Metformina 850mg',
            alergias='Penicilina',
        )
        assert paciente.sexo == 'FEMENINO'
        assert paciente.antecedentes_personales == 'DM2, HTA'
        assert paciente.medicamentos_habituales == 'Metformina 850mg'
        assert paciente.alergias == 'Penicilina'

    def test_campos_clinicos_opcionales(self):
        """Los campos clínicos son opcionales (blank por defecto)"""
        paciente = PacienteFactory()
        assert paciente.antecedentes_personales == ''
        assert paciente.medicamentos_habituales == ''
        assert paciente.alergias == ''

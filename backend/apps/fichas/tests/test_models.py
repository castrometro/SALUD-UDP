import pytest
from apps.fichas.models import Plantilla, CasoClinico, FichaEstudiante
from .factories import PlantillaFactory, CasoClinicoFactory, FichaEstudianteFactory
from apps.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestPlantillaModel:
    def test_crear_plantilla(self):
        """Prueba básica: Crear una plantilla"""
        plantilla = PlantillaFactory(titulo="Diabetes + cocaína")
        assert plantilla.titulo == "Diabetes + cocaína"
        assert Plantilla.objects.count() == 1

    def test_plantilla_contenido_default(self):
        """La plantilla tiene contenido JSON por defecto"""
        plantilla = PlantillaFactory()
        assert 'motivo_consulta' in plantilla.contenido


@pytest.mark.django_db
class TestCasoClinicoModel:
    def test_crear_caso_clinico(self):
        """Crear un caso clínico asignando plantilla a paciente"""
        caso = CasoClinicoFactory()
        assert caso.plantilla is not None
        assert caso.paciente is not None
        assert CasoClinico.objects.count() == 1

    def test_unique_paciente_por_plantilla(self):
        """No se puede asignar el mismo paciente a la misma plantilla dos veces"""
        caso = CasoClinicoFactory()
        with pytest.raises(Exception):
            CasoClinico.objects.create(
                plantilla=caso.plantilla,
                paciente=caso.paciente,
                creado_por=caso.creado_por,
            )


@pytest.mark.django_db
class TestFichaEstudianteModel:
    def test_crear_ficha_estudiante(self):
        """Un estudiante crea su ficha en un caso clínico"""
        ficha = FichaEstudianteFactory()
        assert ficha.estudiante is not None
        assert ficha.caso_clinico is not None
        assert FichaEstudiante.objects.count() == 1

    def test_contenido_hereda_plantilla(self):
        """El contenido de la ficha del estudiante copia el de la plantilla"""
        plantilla = PlantillaFactory(contenido={
            'motivo_consulta': 'Dolor de cabeza',
            'anamnesis': 'Paciente refiere...',
        })
        caso = CasoClinicoFactory(plantilla=plantilla)
        ficha = FichaEstudiante.objects.create(
            caso_clinico=caso,
            estudiante=UserFactory(role='ESTUDIANTE'),
            contenido=caso.plantilla.contenido.copy(),
        )
        assert ficha.contenido['motivo_consulta'] == 'Dolor de cabeza'

    def test_unique_estudiante_por_caso(self):
        """Un estudiante no puede tener dos fichas en el mismo caso"""
        ficha = FichaEstudianteFactory()
        with pytest.raises(Exception):
            FichaEstudiante.objects.create(
                caso_clinico=ficha.caso_clinico,
                estudiante=ficha.estudiante,
                contenido={},
            )

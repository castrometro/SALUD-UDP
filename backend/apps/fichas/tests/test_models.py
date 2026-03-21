import pytest
from apps.fichas.models import Ficha
from .factories import FichaFactory
from apps.users.tests.factories import UserFactory

@pytest.mark.django_db
class TestFichaModel:
    def test_crear_plantilla(self):
        """Prueba básica: Crear una ficha plantilla"""
        ficha = FichaFactory(es_plantilla=True)
        assert ficha.es_plantilla is True
        assert ficha.estudiante is None
        assert Ficha.objects.count() == 1

    def test_crear_ficha_estudiante(self):
        """Prueba básica: Asignar una ficha a un estudiante"""
        estudiante = UserFactory(role='ESTUDIANTE')
        plantilla = FichaFactory(es_plantilla=True, contenido={
            'motivo_consulta': 'Dolor de cabeza',
            'anamnesis': 'Paciente refiere...',
        })

        ficha_copia = Ficha.objects.create(
            paciente=plantilla.paciente,
            es_plantilla=False,
            ficha_base=plantilla,
            estudiante=estudiante,
            contenido=plantilla.contenido.copy()
        )

        assert ficha_copia.ficha_base == plantilla
        assert ficha_copia.estudiante == estudiante
        assert ficha_copia.es_plantilla is False
        assert ficha_copia.contenido['motivo_consulta'] == 'Dolor de cabeza'

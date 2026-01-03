import pytest
from apps.fichas.models import FichaAmbulatoria
from .factories import FichaAmbulatoriaFactory
from apps.users.tests.factories import UserFactory

@pytest.mark.django_db
class TestFichaModel:
    def test_crear_plantilla(self):
        """Prueba básica: Crear una ficha plantilla"""
        ficha = FichaAmbulatoriaFactory(es_plantilla=True)
        assert ficha.es_plantilla is True
        assert ficha.estudiante is None
        assert FichaAmbulatoria.objects.count() == 1

    def test_crear_ficha_estudiante(self):
        """Prueba básica: Asignar una ficha a un estudiante"""
        estudiante = UserFactory(role='ESTUDIANTE')
        plantilla = FichaAmbulatoriaFactory(es_plantilla=True)
        
        ficha_copia = FichaAmbulatoria.objects.create(
            paciente=plantilla.paciente,
            es_plantilla=False,
            ficha_base=plantilla,
            estudiante=estudiante,
            motivo_consulta="Copia del estudiante"
        )
        
        assert ficha_copia.ficha_base == plantilla
        assert ficha_copia.estudiante == estudiante
        assert ficha_copia.es_plantilla is False

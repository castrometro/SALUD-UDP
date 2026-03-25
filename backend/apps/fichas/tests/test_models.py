import pytest
from apps.fichas.models import CasoClinico, FichaEstudiante, CAMPOS_CLINICOS_DEFAULT
from .factories import CasoClinicoFactory, FichaEstudianteFactory
from apps.users.tests.factories import UserFactory
import datetime


@pytest.mark.django_db
class TestCasoClinicoModel:
    def test_crear_caso_clinico(self):
        """Crear un caso clínico con titulo, descripcion y paciente"""
        caso = CasoClinicoFactory(titulo="Consulta por cefalea tensional")
        assert caso.titulo == "Consulta por cefalea tensional"
        assert caso.paciente is not None
        assert CasoClinico.objects.count() == 1

    def test_caso_clinico_descripcion(self):
        """El caso clínico puede tener una narrativa descriptiva"""
        caso = CasoClinicoFactory(descripcion="Paciente de 65 años con dolor torácico")
        assert "dolor torácico" in caso.descripcion


@pytest.mark.django_db
class TestFichaEstudianteModel:
    def test_crear_ficha_estudiante(self):
        """Un estudiante crea su ficha en un caso clínico"""
        ficha = FichaEstudianteFactory()
        assert ficha.estudiante is not None
        assert ficha.caso_clinico is not None
        assert FichaEstudiante.objects.count() == 1

    def test_contenido_arranca_vacio(self):
        """La ficha del estudiante arranca con campos clínicos vacíos"""
        ficha = FichaEstudianteFactory()
        assert ficha.contenido['motivo_consulta'] == ''
        assert ficha.contenido['diagnostico'] == ''
        assert set(ficha.contenido.keys()) == set(CAMPOS_CLINICOS_DEFAULT.keys())

    def test_unique_estudiante_por_caso(self):
        """Un estudiante no puede tener dos fichas en el mismo caso"""
        ficha = FichaEstudianteFactory()
        with pytest.raises(Exception):
            FichaEstudiante.objects.create(
                caso_clinico=ficha.caso_clinico,
                estudiante=ficha.estudiante,
                contenido={},
            )

    def test_fecha_atencion_nula_por_defecto(self):
        """La fecha de atención es nula por defecto al crear la ficha"""
        ficha = FichaEstudianteFactory()
        assert ficha.fecha_atencion is None

    def test_fecha_atencion_puede_asignarse(self):
        """El docente puede asignar una fecha de atención pública a la ficha"""
        fecha = datetime.date(2026, 3, 25)
        ficha = FichaEstudianteFactory(fecha_atencion=fecha)
        assert ficha.fecha_atencion == fecha

    def test_fecha_creacion_distinta_de_fecha_atencion(self):
        """fecha_creacion (registro real) y fecha_atencion (pública) son campos distintos"""
        fecha_publica = datetime.date(2026, 1, 1)
        ficha = FichaEstudianteFactory(fecha_atencion=fecha_publica)
        assert ficha.fecha_creacion is not None
        assert ficha.fecha_atencion == fecha_publica


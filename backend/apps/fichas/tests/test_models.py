import pytest
from apps.fichas.models import CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion, CAMPOS_CLINICOS_DEFAULT
from .factories import CasoClinicoFactory, AtencionClinicaFactory, AtencionEstudianteFactory, EvolucionFactory
from apps.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestCasoClinicoModel:
    def test_crear_caso_clinico(self):
        """Crear un caso clínico con titulo y descripcion (sin paciente)"""
        caso = CasoClinicoFactory(titulo="Consulta por cefalea tensional")
        assert caso.titulo == "Consulta por cefalea tensional"
        assert CasoClinico.objects.count() == 1

    def test_caso_clinico_descripcion(self):
        """El caso clínico puede tener una narrativa descriptiva"""
        caso = CasoClinicoFactory(descripcion="Paciente de 65 años con dolor torácico")
        assert "dolor torácico" in caso.descripcion


@pytest.mark.django_db
class TestAtencionClinicaModel:
    def test_crear_atencion_clinica(self):
        """Una atención vincula caso + paciente + fecha"""
        atencion = AtencionClinicaFactory()
        assert atencion.caso_clinico is not None
        assert atencion.paciente is not None
        assert atencion.fecha_atencion is not None
        assert AtencionClinica.objects.count() == 1

    def test_unique_caso_paciente_fecha(self):
        """No se puede duplicar la combinación caso+paciente+fecha"""
        atencion = AtencionClinicaFactory()
        with pytest.raises(Exception):
            AtencionClinica.objects.create(
                caso_clinico=atencion.caso_clinico,
                paciente=atencion.paciente,
                fecha_atencion=atencion.fecha_atencion,
                creado_por=atencion.creado_por,
            )


@pytest.mark.django_db
class TestAtencionEstudianteModel:
    def test_crear_asignacion(self):
        """Un docente asigna un estudiante a una atención"""
        asignacion = AtencionEstudianteFactory()
        assert asignacion.estudiante is not None
        assert asignacion.asignado_por is not None
        assert AtencionEstudiante.objects.count() == 1

    def test_unique_estudiante_por_atencion(self):
        """Un estudiante no puede estar asignado dos veces a la misma atención"""
        asignacion = AtencionEstudianteFactory()
        with pytest.raises(Exception):
            AtencionEstudiante.objects.create(
                atencion_clinica=asignacion.atencion_clinica,
                estudiante=asignacion.estudiante,
                asignado_por=asignacion.asignado_por,
            )


@pytest.mark.django_db
class TestEvolucionModel:
    def test_crear_evolucion(self):
        """Un estudiante crea una evolución en su asignación"""
        evolucion = EvolucionFactory(numero=1)
        assert evolucion.atencion_estudiante is not None
        assert evolucion.numero == 1
        assert Evolucion.objects.count() == 1

    def test_contenido_campos_clinicos(self):
        """La evolución arranca con los campos clínicos por defecto"""
        evolucion = EvolucionFactory(numero=1)
        assert evolucion.contenido['motivo_consulta'] == ''
        assert evolucion.contenido['diagnostico'] == ''
        assert set(evolucion.contenido.keys()) == set(CAMPOS_CLINICOS_DEFAULT.keys())

    def test_unique_numero_por_asignacion(self):
        """No se pueden duplicar números de evolución en la misma asignación"""
        evolucion = EvolucionFactory(numero=1)
        with pytest.raises(Exception):
            Evolucion.objects.create(
                atencion_estudiante=evolucion.atencion_estudiante,
                numero=1,
                contenido={},
                tipo_autor='ESTUDIANTE',
                nombre_autor='Test',
                creado_por=evolucion.creado_por,
            )


@pytest.mark.django_db
class TestFlujoCompleto:
    def test_flujo_caso_atencion_evolucion(self):
        """Flujo completo: caso → atención → asignación → evolución"""
        docente = UserFactory(role='DOCENTE')
        estudiante = UserFactory(role='ESTUDIANTE')

        caso = CasoClinicoFactory(creado_por=docente)
        atencion = AtencionClinicaFactory(caso_clinico=caso, creado_por=docente)
        asignacion = AtencionEstudianteFactory(
            atencion_clinica=atencion,
            estudiante=estudiante,
            asignado_por=docente,
        )
        evolucion = EvolucionFactory(
            atencion_estudiante=asignacion,
            numero=1,
            tipo_autor='ESTUDIANTE',
            creado_por=estudiante,
        )

        assert caso.atenciones.count() == 1
        assert atencion.asignaciones.count() == 1
        assert asignacion.evoluciones.count() == 1
        assert evolucion.numero == 1

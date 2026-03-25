from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CasoClinicoViewSet,
    AtencionClinicaViewSet,
    AtencionEstudianteViewSet,
    EvolucionViewSet,
)

router = DefaultRouter()
router.register(r'casos-clinicos', CasoClinicoViewSet, basename='caso-clinico')
router.register(r'atenciones-clinicas', AtencionClinicaViewSet, basename='atencion-clinica')
router.register(r'atenciones-estudiantes', AtencionEstudianteViewSet, basename='atencion-estudiante')
router.register(r'evoluciones', EvolucionViewSet, basename='evolucion')

urlpatterns = [
    path('', include(router.urls)),
]

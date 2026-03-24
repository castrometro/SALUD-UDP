from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CasoClinicoViewSet, FichaEstudianteViewSet

router = DefaultRouter()
router.register(r'casos-clinicos', CasoClinicoViewSet, basename='caso-clinico')
router.register(r'fichas-estudiantes', FichaEstudianteViewSet, basename='ficha-estudiante')

urlpatterns = [
    path('', include(router.urls)),
]

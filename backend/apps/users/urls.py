from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, EstudianteViewSet

router = DefaultRouter()
router.register(r'estudiantes', EstudianteViewSet, basename='estudiante')
router.register(r'', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FichaAmbulatoriaViewSet

router = DefaultRouter()
router.register(r'', FichaAmbulatoriaViewSet, basename='fichaambulatoria')

urlpatterns = [
    path('', include(router.urls)),
]

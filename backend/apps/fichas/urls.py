from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FichaViewSet

router = DefaultRouter()
router.register(r'', FichaViewSet, basename='ficha')

urlpatterns = [
    path('', include(router.urls)),
]

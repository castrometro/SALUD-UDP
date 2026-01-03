from rest_framework import viewsets, permissions, filters
from .models import Paciente
from .serializers import PacienteSerializer
from apps.users.permissions import IsDocenteOrAdmin

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all().order_by('apellido', 'nombre')
    serializer_class = PacienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'apellido', 'rut']
    
    def get_permissions(self):
        """
        - Listar/Ver: Todos los usuarios autenticados (Estudiantes necesitan ver pacientes para crear fichas)
        - Crear/Editar/Eliminar: Solo Docentes o Admins
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsDocenteOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

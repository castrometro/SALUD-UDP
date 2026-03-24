from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
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

    def destroy(self, request, *args, **kwargs):
        paciente = self.get_object()
        total_casos = paciente.casos_clinicos.count()
        if total_casos > 0:
            return Response(
                {'detail': f'No se puede eliminar el paciente porque tiene {total_casos} caso(s) clínico(s) asignado(s). Elimínalos primero.'},
                status=status.HTTP_409_CONFLICT
            )
        return super().destroy(request, *args, **kwargs)

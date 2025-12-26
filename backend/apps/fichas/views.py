from rest_framework import viewsets, permissions
from .models import FichaAmbulatoria
from .serializers import FichaAmbulatoriaSerializer
from apps.users.permissions import IsOwnerOrDocenteOrAdmin

class FichaAmbulatoriaViewSet(viewsets.ModelViewSet):
    serializer_class = FichaAmbulatoriaSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrDocenteOrAdmin]

    def get_queryset(self):
        """
        - Admin/Docente: Ven todas las fichas.
        - Estudiante: Ve solo sus propias fichas.
        """
        user = self.request.user
        queryset = FichaAmbulatoria.objects.all()
        
        if user.role not in ['ADMIN', 'DOCENTE']:
            queryset = queryset.filter(creado_por=user)

        # Filter by paciente (RUT)
        paciente_rut = self.request.query_params.get('paciente')
        if paciente_rut:
            queryset = queryset.filter(paciente_id=paciente_rut)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modificado_por=self.request.user)

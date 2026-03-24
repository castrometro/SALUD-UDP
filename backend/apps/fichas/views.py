from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import ProtectedError
from .models import Plantilla, CasoClinico, FichaEstudiante
from .serializers import (
    PlantillaSerializer,
    CasoClinicoSerializer,
    FichaEstudianteSerializer,
    FichaVersionSerializer,
    CrearFichaEstudianteSerializer,
)
from apps.users.permissions import IsOwnerOrDocenteOrAdmin


# ──────────────────────────────────────────────
# Plantilla ViewSet
# ──────────────────────────────────────────────

class PlantillaViewSet(viewsets.ModelViewSet):
    """CRUD de plantillas. Solo docentes/admin pueden crear y editar."""
    serializer_class = PlantillaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Plantilla.objects.select_related('creado_por', 'modificado_por')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrDocenteOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        plantilla = self.get_object()
        total_casos = plantilla.casos_clinicos.count()
        if total_casos > 0:
            return Response(
                {'detail': f'No se puede eliminar la plantilla porque tiene {total_casos} caso(s) clínico(s) asignado(s). Elimínalos primero.'},
                status=status.HTTP_409_CONFLICT
            )
        return super().destroy(request, *args, **kwargs)


# ──────────────────────────────────────────────
# Caso Clínico ViewSet
# ──────────────────────────────────────────────

class CasoClinicoViewSet(viewsets.ModelViewSet):
    """
    Gestión de casos clínicos (plantilla + paciente).
    - Docentes/admin: ven y crean todos.
    - Estudiantes: solo ven los que existen (para unirse).
    """
    serializer_class = CasoClinicoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CasoClinico.objects.select_related(
            'plantilla', 'paciente', 'creado_por'
        )

        # Filtrar por plantilla
        plantilla_id = self.request.query_params.get('plantilla')
        if plantilla_id:
            queryset = queryset.filter(plantilla_id=plantilla_id)

        # Filtrar por paciente
        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrDocenteOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        caso = self.get_object()
        total_fichas = caso.fichas_estudiantes.count()
        if total_fichas > 0:
            return Response(
                {'detail': f'No se puede eliminar el caso clínico porque tiene {total_fichas} ficha(s) de estudiante(s). Elimínalas primero.'},
                status=status.HTTP_409_CONFLICT
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def fichas_estudiantes(self, request, pk=None):
        """
        Lista las fichas de estudiantes de un caso clínico.
        GET /api/casos-clinicos/{id}/fichas_estudiantes/
        """
        caso = self.get_object()
        fichas = caso.fichas_estudiantes.select_related('estudiante').order_by('-fecha_creacion')

        page = self.paginate_queryset(fichas)
        if page is not None:
            serializer = FichaEstudianteSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = FichaEstudianteSerializer(fichas, many=True, context={'request': request})
        return Response(serializer.data)


# ──────────────────────────────────────────────
# Ficha Estudiante ViewSet
# ──────────────────────────────────────────────

class FichaEstudianteViewSet(viewsets.ModelViewSet):
    """
    Fichas de trabajo de estudiantes.
    - Estudiantes ven solo las suyas.
    - Docentes/admin ven todas.
    """
    serializer_class = FichaEstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = FichaEstudiante.objects.select_related(
            'caso_clinico', 'caso_clinico__plantilla', 'caso_clinico__paciente',
            'estudiante', 'creado_por', 'modificado_por'
        )

        if user.role not in ['ADMIN', 'DOCENTE']:
            queryset = queryset.filter(estudiante=user)

        # Filtrar por caso clínico
        caso_id = self.request.query_params.get('caso_clinico')
        if caso_id:
            queryset = queryset.filter(caso_clinico_id=caso_id)

        # Filtrar por estudiante (para docentes)
        estudiante_id = self.request.query_params.get('estudiante')
        if estudiante_id and user.role in ['ADMIN', 'DOCENTE']:
            queryset = queryset.filter(estudiante_id=estudiante_id)

        return queryset

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrDocenteOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def crear_mi_ficha(self, request):
        """
        Endpoint para que un estudiante cree su ficha en un caso clínico.
        POST /api/fichas-estudiantes/crear_mi_ficha/
        Body: { "caso_clinico_id": 123 }
        """
        if request.user.role in ['ADMIN', 'DOCENTE']:
            return Response(
                {"error": "Los docentes no necesitan crear fichas de estudiante"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CrearFichaEstudianteSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            ficha = serializer.save()
            return Response(
                FichaEstudianteSerializer(ficha, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """
        Obtiene el historial de versiones de una ficha.
        GET /api/fichas-estudiantes/{id}/historial/
        """
        ficha = self.get_object()
        versiones = ficha.versiones.all()
        serializer = FichaVersionSerializer(versiones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mi_ficha(self, request):
        """
        Obtiene la ficha del estudiante actual para un caso clínico.
        GET /api/fichas-estudiantes/mi_ficha/?caso_clinico=123
        """
        caso_id = request.query_params.get('caso_clinico')
        if not caso_id:
            return Response(
                {"error": "Debe especificar caso_clinico"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ficha = FichaEstudiante.objects.get(
                caso_clinico_id=caso_id,
                estudiante=request.user
            )
            serializer = FichaEstudianteSerializer(ficha, context={'request': request})
            return Response(serializer.data)
        except FichaEstudiante.DoesNotExist:
            return Response(
                {"existe": False, "message": "No has creado tu ficha para este caso"},
                status=status.HTTP_404_NOT_FOUND
            )

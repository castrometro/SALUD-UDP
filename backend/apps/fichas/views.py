from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Ficha, FichaVersion
from .serializers import (
    FichaSerializer,
    FichaVersionSerializer,
    CrearFichaEstudianteSerializer
)
from apps.users.permissions import IsOwnerOrDocenteOrAdmin


class FichaViewSet(viewsets.ModelViewSet):
    serializer_class = FichaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        - Admin/Docente: Ven todas las fichas (plantillas y de estudiantes).
        - Estudiante: Ve solo fichas plantilla + sus propias fichas.
        """
        user = self.request.user
        queryset = Ficha.objects.select_related(
            'paciente', 'creado_por', 'modificado_por', 'estudiante', 'ficha_base'
        )

        if user.role not in ['ADMIN', 'DOCENTE']:
            queryset = queryset.filter(
                Q(es_plantilla=True) | Q(estudiante=user)
            )

        # Filter by paciente
        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)

        # Filter solo plantillas
        solo_plantillas = self.request.query_params.get('plantillas')
        if solo_plantillas == 'true':
            queryset = queryset.filter(es_plantilla=True)

        # Filter fichas de un estudiante específico (solo para docentes)
        estudiante_id = self.request.query_params.get('estudiante')
        if estudiante_id and user.role in ['ADMIN', 'DOCENTE']:
            queryset = queryset.filter(estudiante_id=estudiante_id)

        return queryset.order_by('-fecha_creacion')

    def perform_create(self, serializer):
        """Al crear ficha, determinar si es plantilla o de estudiante"""
        user = self.request.user

        if user.role in ['ADMIN', 'DOCENTE']:
            es_plantilla = self.request.data.get('es_plantilla', True)
            serializer.save(creado_por=user, es_plantilla=es_plantilla)
        else:
            serializer.save(creado_por=user, estudiante=user, es_plantilla=False)

    def perform_update(self, serializer):
        serializer.save(modificado_por=self.request.user)

    def get_permissions(self):
        """
        Permisos específicos por acción:
        - list/retrieve: Autenticado (filtrado en queryset)
        - create: Docente/Admin para plantillas, Estudiante para sus fichas
        - update/delete: Dueño, Docente o Admin
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrDocenteOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def crear_mi_ficha(self, request):
        """
        Endpoint para que un estudiante cree su ficha basada en una plantilla.
        POST /api/fichas/crear_mi_ficha/
        Body: { "ficha_base_id": 123 }
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
                FichaSerializer(ficha, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """
        Obtiene el historial de versiones de una ficha.
        GET /api/fichas/{id}/historial/
        """
        ficha = self.get_object()
        versiones = ficha.versiones.all()
        serializer = FichaVersionSerializer(versiones, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def fichas_estudiantes(self, request, pk=None):
        """
        (Solo docentes) Obtiene todas las fichas de estudiantes basadas en esta plantilla.
        GET /api/fichas/{id}/fichas_estudiantes/
        """
        if request.user.role not in ['ADMIN', 'DOCENTE']:
            return Response(
                {"error": "No tiene permiso para ver fichas de estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )

        ficha_base = self.get_object()
        if not ficha_base.es_plantilla:
            return Response(
                {"error": "Esta no es una ficha plantilla"},
                status=status.HTTP_400_BAD_REQUEST
            )

        fichas = ficha_base.fichas_estudiantes.select_related('estudiante').order_by('-fecha_creacion')

        page = self.paginate_queryset(fichas)
        if page is not None:
            serializer = FichaSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = FichaSerializer(fichas, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def mi_ficha(self, request, pk=None):
        """
        (Estudiantes) Obtiene la ficha del estudiante actual para esta plantilla.
        GET /api/fichas/{id}/mi_ficha/
        """
        ficha_base = self.get_object()
        if not ficha_base.es_plantilla:
            return Response(
                {"error": "Esta no es una ficha plantilla"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            mi_ficha = Ficha.objects.get(
                ficha_base=ficha_base,
                estudiante=request.user
            )
            serializer = FichaSerializer(mi_ficha, context={'request': request})
            return Response(serializer.data)
        except Ficha.DoesNotExist:
            return Response(
                {"existe": False, "message": "No has creado tu ficha para este caso"},
                status=status.HTTP_404_NOT_FOUND
            )

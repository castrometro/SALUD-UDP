from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models as db_models
from django.db.models import Count
from django.contrib.auth import get_user_model

from .models import CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion, Vineta, CAMPOS_CLINICOS_DEFAULT
from .serializers import (
    CasoClinicoSerializer,
    AtencionClinicaSerializer,
    AtencionEstudianteSerializer,
    EvolucionSerializer,
    VinetaSerializer,
    AsignarEstudianteSerializer,
    CrearEvolucionSerializer,
    CrearVinetaSerializer,
)
from apps.common.permissions import IsOwnerOrDocenteOrAdmin

User = get_user_model()


# ──────────────────────────────────────────────
# Caso Clínico ViewSet
# ──────────────────────────────────────────────

class CasoClinicoViewSet(viewsets.ModelViewSet):
    """
    CRUD de casos clínicos (escenarios genéricos reutilizables).
    - Docentes/admin: crean, editan y eliminan.
    - Estudiantes: solo lectura.
    """
    serializer_class = CasoClinicoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CasoClinico.objects.select_related(
            'creado_por', 'modificado_por'
        ).annotate(
            total_atenciones=Count('atenciones')
        ).order_by('-fecha_creacion')

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                db_models.Q(titulo__icontains=search) |
                db_models.Q(descripcion__icontains=search)
            )
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrDocenteOrAdmin()]
        return [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        caso = self.get_object()
        total = caso.atenciones.count()
        if total > 0:
            return Response(
                {'detail': f'No se puede eliminar el caso clínico porque tiene {total} atención(es) clínica(s). Elimínalas primero.'},
                status=status.HTTP_409_CONFLICT
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def atenciones(self, request, pk=None):
        """Lista las atenciones clínicas de un caso."""
        caso = self.get_object()
        atenciones = caso.atenciones.select_related(
            'paciente', 'creado_por'
        ).annotate(
            total_estudiantes=Count('asignaciones')
        ).order_by('-fecha_atencion')

        page = self.paginate_queryset(atenciones)
        if page is not None:
            serializer = AtencionClinicaSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = AtencionClinicaSerializer(atenciones, many=True, context={'request': request})
        return Response(serializer.data)


# ──────────────────────────────────────────────
# Atención Clínica ViewSet
# ──────────────────────────────────────────────

class AtencionClinicaViewSet(viewsets.ModelViewSet):
    """
    CRUD de atenciones clínicas (caso + paciente + fecha).
    - Docentes/admin: crean, editan, eliminan, asignan estudiantes.
    - Estudiantes: ven solo las atenciones donde están asignados.
    """
    serializer_class = AtencionClinicaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = AtencionClinica.objects.select_related(
            'caso_clinico', 'paciente', 'creado_por', 'modificado_por'
        ).annotate(
            total_estudiantes=Count('asignaciones')
        )

        # Estudiantes solo ven atenciones donde están asignados
        if user.role not in (User.Role.ADMIN, User.Role.DOCENTE):
            queryset = queryset.filter(asignaciones__estudiante=user)

        caso_id = self.request.query_params.get('caso_clinico')
        if caso_id:
            queryset = queryset.filter(caso_clinico_id=caso_id)

        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)

        return queryset.order_by('-fecha_atencion')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrDocenteOrAdmin()]
        return [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        atencion = self.get_object()
        total = atencion.asignaciones.count()
        if total > 0:
            return Response(
                {'detail': f'No se puede eliminar la atención porque tiene {total} estudiante(s) asignado(s). Elimina las asignaciones primero.'},
                status=status.HTTP_409_CONFLICT
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def asignar_estudiante(self, request, pk=None):
        """
        POST /api/fichas/atenciones-clinicas/{id}/asignar_estudiante/
        Body: { "estudiante_id": 123 }
        """
        atencion = self.get_object()
        serializer = AsignarEstudianteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        estudiante_id = serializer.validated_data['estudiante_id']
        estudiante = User.objects.get(id=estudiante_id)

        if AtencionEstudiante.objects.filter(atencion_clinica=atencion, estudiante=estudiante).exists():
            return Response(
                {'detail': 'Este estudiante ya está asignado a esta atención.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        asignacion = AtencionEstudiante.objects.create(
            atencion_clinica=atencion,
            estudiante=estudiante,
            asignado_por=request.user,
        )
        return Response(
            AtencionEstudianteSerializer(asignacion, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def estudiantes(self, request, pk=None):
        """Lista los estudiantes asignados a una atención."""
        atencion = self.get_object()
        asignaciones = atencion.asignaciones.select_related('estudiante', 'asignado_por').annotate(
            total_evoluciones=Count('evoluciones')
        ).order_by('-fecha_asignacion')
        page = self.paginate_queryset(asignaciones)
        if page is not None:
            serializer = AtencionEstudianteSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = AtencionEstudianteSerializer(asignaciones, many=True, context={'request': request})
        return Response(serializer.data)


# ──────────────────────────────────────────────
# Atención Estudiante ViewSet
# ──────────────────────────────────────────────

class AtencionEstudianteViewSet(viewsets.ModelViewSet):
    """
    Asignaciones de estudiantes a atenciones clínicas.
    - Docentes/admin: ven todas, pueden crear/eliminar asignaciones.
    - Estudiantes: ven solo las suyas.
    """
    serializer_class = AtencionEstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = AtencionEstudiante.objects.select_related(
            'atencion_clinica', 'atencion_clinica__caso_clinico',
            'atencion_clinica__paciente', 'estudiante', 'asignado_por'
        ).annotate(
            total_evoluciones=Count('evoluciones')
        )

        if user.role not in (User.Role.ADMIN, User.Role.DOCENTE):
            queryset = queryset.filter(estudiante=user)

        atencion_id = self.request.query_params.get('atencion_clinica')
        if atencion_id:
            queryset = queryset.filter(atencion_clinica_id=atencion_id)

        estudiante_id = self.request.query_params.get('estudiante')
        if estudiante_id and user.role in (User.Role.ADMIN, User.Role.DOCENTE):
            queryset = queryset.filter(estudiante_id=estudiante_id)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrDocenteOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def crear_evolucion(self, request, pk=None):
        """
        POST /api/fichas/atenciones-estudiantes/{id}/crear_evolucion/
        Body: { "contenido": {...}, "tipo_autor": "ESTUDIANTE"|"DOCENTE", "nombre_autor": "..." }
        """
        asignacion = self.get_object()
        serializer = CrearEvolucionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = request.user

        # Validar permisos: estudiante solo puede crear como ESTUDIANTE en su propia asignación
        if user.role == User.Role.ESTUDIANTE:
            if data['tipo_autor'] != 'ESTUDIANTE':
                return Response(
                    {'detail': 'Un estudiante solo puede crear evoluciones de tipo ESTUDIANTE.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if asignacion.estudiante != user:
                return Response(
                    {'detail': 'No puedes crear evoluciones en una asignación que no es tuya.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Calcular número secuencial
        ultimo = asignacion.evoluciones.order_by('-numero').first()
        numero = (ultimo.numero + 1) if ultimo else 1

        # Nombre del autor por defecto si no se proporcionó
        nombre_autor = data.get('nombre_autor', '').strip()
        if not nombre_autor:
            nombre_autor = user.get_full_name()

        contenido = data.get('contenido') or CAMPOS_CLINICOS_DEFAULT.copy()

        evolucion = Evolucion.objects.create(
            atencion_estudiante=asignacion,
            numero=numero,
            contenido=contenido,
            tipo_autor=data['tipo_autor'],
            nombre_autor=nombre_autor,
            creado_por=user,
            vineta_id=data.get('vineta'),
        )
        return Response(
            EvolucionSerializer(evolucion, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def evoluciones(self, request, pk=None):
        """Lista las evoluciones de una asignación."""
        asignacion = self.get_object()
        evoluciones = asignacion.evoluciones.select_related('creado_por').order_by('numero')
        serializer = EvolucionSerializer(evoluciones, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def crear_vineta(self, request, pk=None):
        """
        POST /api/fichas/atenciones-estudiantes/{id}/crear_vineta/
        Body: { "contenido": "Paciente consulta por..." }
        """
        asignacion = self.get_object()
        serializer = CrearVinetaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Solo docentes/admin pueden crear viñetas
        if user.role not in (User.Role.ADMIN, User.Role.DOCENTE):
            return Response(
                {'detail': 'Solo docentes o administradores pueden crear viñetas.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Calcular número secuencial
        ultima = asignacion.vinetas.order_by('-numero').first()
        numero = (ultima.numero + 1) if ultima else 1

        vineta = Vineta.objects.create(
            atencion_estudiante=asignacion,
            numero=numero,
            contenido=serializer.validated_data['contenido'],
            creada_por=user,
        )
        return Response(
            VinetaSerializer(vineta, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def vinetas(self, request, pk=None):
        """Lista las viñetas de una asignación."""
        asignacion = self.get_object()
        vinetas = asignacion.vinetas.select_related('creada_por').order_by('numero')
        serializer = VinetaSerializer(vinetas, many=True, context={'request': request})
        return Response(serializer.data)


# ──────────────────────────────────────────────
# Evolución ViewSet (lectura + actualización)
# ──────────────────────────────────────────────

class EvolucionViewSet(viewsets.ModelViewSet):
    """
    Evoluciones (notas clínicas).
    - Lectura: cualquier autenticado que tenga acceso a la atención.
    - Creación: via AtencionEstudianteViewSet.crear_evolucion (preferred).
    - Actualización: solo el creador o docente/admin.
    """
    serializer_class = EvolucionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        queryset = Evolucion.objects.select_related(
            'atencion_estudiante', 'atencion_estudiante__atencion_clinica',
            'atencion_estudiante__atencion_clinica__caso_clinico',
            'atencion_estudiante__atencion_clinica__paciente',
            'atencion_estudiante__estudiante',
            'creado_por',
        )

        if user.role not in (User.Role.ADMIN, User.Role.DOCENTE):
            queryset = queryset.filter(atencion_estudiante__estudiante=user)

        atencion_estudiante_id = self.request.query_params.get('atencion_estudiante')
        if atencion_estudiante_id:
            queryset = queryset.filter(atencion_estudiante_id=atencion_estudiante_id)

        return queryset.order_by('numero')

    def get_permissions(self):
        if self.action in ['partial_update']:
            return [permissions.IsAuthenticated(), IsOwnerOrDocenteOrAdmin()]
        return [permissions.IsAuthenticated()]


# ──────────────────────────────────────────────
# Viñeta ViewSet (lectura + actualización)
# ──────────────────────────────────────────────

class VinetaViewSet(viewsets.ModelViewSet):
    """
    Viñetas (inyecciones de contexto narrativo).
    - Lectura: cualquier autenticado que tenga acceso a la asignación.
    - Creación: via AtencionEstudianteViewSet.crear_vineta (preferred).
    - Actualización: solo docente/admin.
    """
    serializer_class = VinetaSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        queryset = Vineta.objects.select_related(
            'atencion_estudiante', 'atencion_estudiante__atencion_clinica',
            'atencion_estudiante__estudiante',
            'creada_por',
        )

        if user.role not in (User.Role.ADMIN, User.Role.DOCENTE):
            queryset = queryset.filter(atencion_estudiante__estudiante=user)

        atencion_estudiante_id = self.request.query_params.get('atencion_estudiante')
        if atencion_estudiante_id:
            queryset = queryset.filter(atencion_estudiante_id=atencion_estudiante_id)

        return queryset.order_by('numero')

    def get_permissions(self):
        if self.action in ['partial_update']:
            return [permissions.IsAuthenticated(), IsOwnerOrDocenteOrAdmin()]
        return [permissions.IsAuthenticated()]

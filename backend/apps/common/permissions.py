from rest_framework import permissions
from django.contrib.auth import get_user_model


def _get_role():
    """Lazy access al enum Role para evitar import circular."""
    return get_user_model().Role


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        Role = _get_role()
        return request.user.is_authenticated and request.user.role == Role.ADMIN


class IsDocente(permissions.BasePermission):
    def has_permission(self, request, view):
        Role = _get_role()
        return request.user.is_authenticated and request.user.role == Role.DOCENTE


class IsDocenteOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        Role = _get_role()
        return request.user.is_authenticated and request.user.role in (Role.ADMIN, Role.DOCENTE)


class IsOwnerOrDocenteOrAdmin(permissions.BasePermission):
    """
    Permite acceso a:
    - El dueño del objeto (creado_por)
    - Docentes
    - Administradores
    """
    def has_object_permission(self, request, view, obj):
        Role = _get_role()
        if request.user.role in (Role.ADMIN, Role.DOCENTE):
            return True
        return obj.creado_por == request.user

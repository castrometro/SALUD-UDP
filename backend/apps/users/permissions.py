from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsDocente(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DOCENTE'

class IsDocenteOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.role == 'DOCENTE')

class IsOwnerOrDocenteOrAdmin(permissions.BasePermission):
    """
    Permite acceso a:
    - El dueño del objeto (creado_por)
    - Docentes
    - Administradores
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'DOCENTE']:
            return True
        # Asumiendo que el modelo tiene un campo 'creado_por'
        return obj.creado_por == request.user

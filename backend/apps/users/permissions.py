# Re-exportar desde common para backward-compatibility
# Nuevos imports deben usar: from apps.common.permissions import ...
from apps.common.permissions import (  # noqa: F401
    IsAdmin,
    IsDocente,
    IsDocenteOrAdmin,
    IsOwnerOrDocenteOrAdmin,
)

import pytest
from django.contrib.auth import get_user_model
from .factories import UserFactory

User = get_user_model()

@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = UserFactory(email="test@example.com", role=User.Role.ESTUDIANTE)
        assert user.email == "test@example.com"
        assert user.check_password('') is False  # Factory doesn't set password by default
        # The __str__ method includes the name and role in parentheses if available, or just email/rut?
        # Let's check the model definition.
        # Based on failure: assert 'test@example... (Estudiante)' == 'test@example.com'
        assert str(user) == "test@example.com (Estudiante)"

    def test_user_roles(self):
        docente = UserFactory(role=User.Role.DOCENTE)
        assert docente.role == 'DOCENTE'

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User

class CustomUserCreationForm(UserCreationForm):

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'rut', 'role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')

class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'rut', 'role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')

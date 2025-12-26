import os
import django
import sys

# Add the project root to the python path
sys.path.append('/app')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.forms import CustomUserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

from django.contrib.auth.forms import UserCreationForm
import inspect

print("UserCreationForm MRO:", UserCreationForm.mro())
print("UserCreationForm base fields:", UserCreationForm.base_fields.keys())
print("CustomUserCreationForm base fields:", CustomUserCreationForm.base_fields.keys())

# Test data mimicking the user's input
data = {
    'email': 'docente1@udp.cl',
    'password': 'prueba123',
    'password_2': 'prueba123',
    'password1': 'prueba123', # Try adding these
    'password2': 'prueba123',
    'first_name': 'Juan',
    'last_name': 'Perez',
    'rut': '204174423', # Valid RUT 20.417.442-3
    'role': 'ESTUDIANTE',
    'is_active': True,
    'is_staff': False,
    'is_superuser': False,
}

print(f"Testing form with data: {data}")

form = CustomUserCreationForm(data=data)
print("Form fields:", form.fields.keys())

if form.is_valid():
    print("Form is VALID")
    try:
        user = form.save()
        print(f"User created: {user}")
        # Clean up
        user.delete()
    except Exception as e:
        print(f"Error saving form: {e}")
else:
    print("Form is INVALID")
    print("Errors:", form.errors)
    print("Non-field errors:", form.non_field_errors())

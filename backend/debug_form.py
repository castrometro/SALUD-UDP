import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinicavirtualUDP.settings')
django.setup()

from apps.users.forms import CustomUserCreationForm

# Simular datos que el usuario podría estar enviando
data = {
    'email': 'test@example.com',
    'password': 'password123',
    'password_2': 'password123',
    'first_name': 'Test',
    'last_name': 'User',
    'rut': '196881476', # RUT válido sin formato
    'role': 'ESTUDIANTE',
    'is_active': True,
    'is_staff': False,
    'is_superuser': False,
}

form = CustomUserCreationForm(data=data)
if form.is_valid():
    print("Form is valid")
else:
    print("Form errors:")
    print(form.errors)
    print("Non field errors:")
    print(form.non_field_errors())

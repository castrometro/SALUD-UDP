#!/bin/sh
set -e

echo "==> Aplicando migraciones..."
python manage.py migrate --noinput

echo "==> Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "==> Verificando superusuario..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if email and password and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        email=email,
        password=password,
        first_name=os.environ.get('DJANGO_SUPERUSER_FIRST_NAME', 'Admin'),
        last_name=os.environ.get('DJANGO_SUPERUSER_LAST_NAME', 'Sistema'),
    )
    print(f'Superusuario {email} creado.')
else:
    print('Superusuario ya existe o no se configuraron las variables.')
"

echo "==> Iniciando Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -

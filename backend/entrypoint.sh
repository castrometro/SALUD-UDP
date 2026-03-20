#!/bin/sh
set -e

echo "==> Esperando que la BD esté lista..."
echo "==> Aplicando migraciones..."
python manage.py migrate --noinput

echo "==> Iniciando servidor de desarrollo..."
exec python manage.py runserver 0.0.0.0:8000

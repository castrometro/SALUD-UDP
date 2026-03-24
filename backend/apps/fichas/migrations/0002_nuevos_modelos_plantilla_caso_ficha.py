"""
Migración: Reemplaza el modelo único Ficha por la arquitectura de 3 modelos:
  - Plantilla (contenido clínico reutilizable)
  - CasoClinico (plantilla + paciente)
  - FichaEstudiante (copia de trabajo del estudiante)
  - FichaVersion ahora apunta a FichaEstudiante

Como es MVP sin datos de producción, se eliminan las tablas antiguas
y se crean las nuevas desde cero.
"""
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fichas', '0001_initial_ficha_jsonfield'),
        ('pacientes', '0003_prevision_choices'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # 1. Eliminar modelos antiguos (orden: constraints → hijos → padres)
        migrations.RemoveConstraint(
            model_name='fichaversion',
            name='unique_version_por_ficha',
        ),
        migrations.RemoveConstraint(
            model_name='ficha',
            name='unique_estudiante_por_ficha_base',
        ),
        migrations.DeleteModel(
            name='FichaVersion',
        ),
        migrations.DeleteModel(
            name='Ficha',
        ),

        # 2. Crear nuevos modelos
        migrations.CreateModel(
            name='Plantilla',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(help_text='Nombre descriptivo del caso clínico', max_length=255)),
                ('descripcion', models.TextField(blank=True, default='', help_text='Descripción breve del caso')),
                ('contenido', models.JSONField(blank=True, default=dict, help_text='Campos clínicos de la plantilla en formato JSON')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('creado_por', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='plantillas_creadas', to=settings.AUTH_USER_MODEL)),
                ('modificado_por', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='plantillas_modificadas', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Plantilla',
                'verbose_name_plural': 'Plantillas',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.CreateModel(
            name='CasoClinico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('plantilla', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='casos_clinicos', to='fichas.plantilla')),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='casos_clinicos', to='pacientes.paciente')),
                ('creado_por', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='casos_creados', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Caso Clínico',
                'verbose_name_plural': 'Casos Clínicos',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.CreateModel(
            name='FichaEstudiante',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contenido', models.JSONField(blank=True, default=dict, help_text='Campos clínicos de la ficha del estudiante')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('caso_clinico', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='fichas_estudiantes', to='fichas.casoclinico')),
                ('estudiante', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='fichas_como_estudiante', to=settings.AUTH_USER_MODEL)),
                ('creado_por', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='fichas_estudiante_creadas', to=settings.AUTH_USER_MODEL)),
                ('modificado_por', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='fichas_estudiante_modificadas', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Ficha de Estudiante',
                'verbose_name_plural': 'Fichas de Estudiantes',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.CreateModel(
            name='FichaVersion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version', models.PositiveIntegerField()),
                ('rol_autor', models.CharField(blank=True, default='', help_text='Rol con el que actuó el autor (ESTUDIANTE, DOCENTE, etc.)', max_length=20)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('contenido', models.JSONField(blank=True, default=dict, help_text='Snapshot del contenido clínico en esta versión')),
                ('ficha', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='versiones', to='fichas.fichaestudiante')),
                ('autor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Versión de Ficha',
                'verbose_name_plural': 'Versiones de Fichas',
                'ordering': ['-version'],
            },
        ),

        # 3. Constraints
        migrations.AddConstraint(
            model_name='casoclinico',
            constraint=models.UniqueConstraint(fields=('plantilla', 'paciente'), name='unique_paciente_por_plantilla'),
        ),
        migrations.AddConstraint(
            model_name='fichaestudiante',
            constraint=models.UniqueConstraint(condition=models.Q(('estudiante__isnull', False)), fields=('caso_clinico', 'estudiante'), name='unique_estudiante_por_caso'),
        ),
        migrations.AddConstraint(
            model_name='fichaversion',
            constraint=models.UniqueConstraint(fields=('ficha', 'version'), name='unique_version_por_ficha'),
        ),
    ]

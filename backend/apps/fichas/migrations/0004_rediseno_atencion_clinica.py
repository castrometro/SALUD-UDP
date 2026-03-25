"""
Migración: Rediseño Atención Clínica.

- CasoClinico pierde FK a Paciente (se vuelve genérico/reutilizable)
- Se crean: AtencionClinica, AtencionEstudiante, Evolucion
- Se eliminan: FichaEstudiante, FichaVersion

MVP sin datos de producción → migración nuclear (drop old + create new).
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('fichas', '0003_rediseno_caso_clinico'),
        ('pacientes', '0003_prevision_choices'),
    ]

    operations = [
        # ── 1. Eliminar modelos antiguos (constraints → hijos → padres) ──
        migrations.RemoveConstraint(
            model_name='fichaversion',
            name='unique_version_por_ficha',
        ),
        migrations.RemoveConstraint(
            model_name='fichaestudiante',
            name='unique_estudiante_por_caso',
        ),
        migrations.DeleteModel(
            name='FichaVersion',
        ),
        migrations.DeleteModel(
            name='FichaEstudiante',
        ),

        # ── 2. Quitar FK paciente de CasoClinico ──
        migrations.RemoveField(
            model_name='casoclinico',
            name='paciente',
        ),

        # ── 3. Crear AtencionClinica ──
        migrations.CreateModel(
            name='AtencionClinica',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_atencion', models.DateField(help_text='Fecha de la sesión clínica (visible para estudiantes)')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('caso_clinico', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='atenciones',
                    to='fichas.casoclinico',
                )),
                ('paciente', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='atenciones',
                    to='pacientes.paciente',
                )),
                ('creado_por', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='atenciones_creadas',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('modificado_por', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='atenciones_modificadas',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Atención Clínica',
                'verbose_name_plural': 'Atenciones Clínicas',
                'ordering': ['-fecha_atencion'],
            },
        ),

        # ── 4. Crear AtencionEstudiante ──
        migrations.CreateModel(
            name='AtencionEstudiante',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_asignacion', models.DateTimeField(auto_now_add=True)),
                ('atencion_clinica', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='asignaciones',
                    to='fichas.atencionclinica',
                )),
                ('estudiante', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='atenciones_como_estudiante',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('asignado_por', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='asignaciones_realizadas',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Asignación de Estudiante',
                'verbose_name_plural': 'Asignaciones de Estudiantes',
                'ordering': ['-fecha_asignacion'],
            },
        ),

        # ── 5. Crear Evolucion ──
        migrations.CreateModel(
            name='Evolucion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.PositiveIntegerField(help_text='Número secuencial de la evolución dentro de esta asignación')),
                ('contenido', models.JSONField(blank=True, default=dict, help_text='Campos clínicos de esta evolución')),
                ('tipo_autor', models.CharField(
                    choices=[('ESTUDIANTE', 'Estudiante'), ('DOCENTE', 'Docente')],
                    help_text='Rol con el que se creó esta evolución',
                    max_length=20,
                )),
                ('nombre_autor', models.CharField(
                    help_text="Nombre visible del autor (ej: 'Doctor Pérez' o nombre del estudiante)",
                    max_length=255,
                )),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('atencion_estudiante', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='evoluciones',
                    to='fichas.atencionestudiante',
                )),
                ('creado_por', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='evoluciones_creadas',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Evolución',
                'verbose_name_plural': 'Evoluciones',
                'ordering': ['numero'],
            },
        ),

        # ── 6. Constraints ──
        migrations.AddConstraint(
            model_name='atencionclinica',
            constraint=models.UniqueConstraint(
                fields=('caso_clinico', 'paciente', 'fecha_atencion'),
                name='unique_caso_paciente_fecha',
            ),
        ),
        migrations.AddConstraint(
            model_name='atencionestudiante',
            constraint=models.UniqueConstraint(
                condition=models.Q(('estudiante__isnull', False)),
                fields=('atencion_clinica', 'estudiante'),
                name='unique_estudiante_por_atencion',
            ),
        ),
        migrations.AddConstraint(
            model_name='evolucion',
            constraint=models.UniqueConstraint(
                fields=('atencion_estudiante', 'numero'),
                name='unique_numero_por_atencion_estudiante',
            ),
        ),
    ]

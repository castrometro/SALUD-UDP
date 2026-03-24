"""
Migración: Rediseño CasoClínico como entidad central.

- CasoClinico absorbe titulo y descripcion de Plantilla
- Se elimina FK CasoClinico.plantilla
- Se elimina modelo Plantilla
- CasoClinico gana campos modificado_por y fecha_modificacion
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def copiar_datos_plantilla_a_caso(apps, schema_editor):
    """Copia titulo y descripcion de cada Plantilla a sus CasoClinico hijos."""
    CasoClinico = apps.get_model('fichas', 'CasoClinico')
    for caso in CasoClinico.objects.select_related('plantilla').all():
        caso.titulo = caso.plantilla.titulo
        caso.descripcion = caso.plantilla.descripcion
        caso.save(update_fields=['titulo', 'descripcion'])


def noop(apps, schema_editor):
    """Operación inversa vacía (no reversible)."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('fichas', '0002_nuevos_modelos_plantilla_caso_ficha'),
    ]

    operations = [
        # 1. Agregar nuevos campos a CasoClinico
        migrations.AddField(
            model_name='casoclinico',
            name='titulo',
            field=models.CharField(default='', help_text='Nombre descriptivo del caso clínico', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='casoclinico',
            name='descripcion',
            field=models.TextField(blank=True, default='', help_text='Narrativa completa del escenario clínico'),
        ),
        migrations.AddField(
            model_name='casoclinico',
            name='modificado_por',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='casos_modificados',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='casoclinico',
            name='fecha_modificacion',
            field=models.DateTimeField(auto_now=True),
        ),

        # 2. Copiar datos de Plantilla a CasoClinico
        migrations.RunPython(copiar_datos_plantilla_a_caso, noop),

        # 3. Quitar constraint único que referencia plantilla
        migrations.RemoveConstraint(
            model_name='casoclinico',
            name='unique_paciente_por_plantilla',
        ),

        # 4. Eliminar FK a Plantilla
        migrations.RemoveField(
            model_name='casoclinico',
            name='plantilla',
        ),

        # 5. Eliminar modelo Plantilla
        migrations.DeleteModel(
            name='Plantilla',
        ),
    ]

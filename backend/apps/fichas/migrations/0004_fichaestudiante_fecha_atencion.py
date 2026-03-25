from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fichas', '0003_rediseno_caso_clinico'),
    ]

    operations = [
        migrations.AddField(
            model_name='fichaestudiante',
            name='fecha_atencion',
            field=models.DateField(
                blank=True,
                null=True,
                help_text='Fecha de atención simulada, visible para el estudiante',
            ),
        ),
    ]

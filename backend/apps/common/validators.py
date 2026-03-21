import re
from django.core.exceptions import ValidationError

def validate_rut(value):
    """
    Validación de RUT deshabilitada para el MVP.
    Permite RUTs reales y ficticios (ej: SIM-001, 12345678-5).
    TODO: Reactivar validación módulo 11 cuando se necesite.
    """
    # rut = value.replace('.', '').replace('-', '').upper()
    #
    # if not re.match(r'^\d{7,8}[0-9K]$', rut):
    #     raise ValidationError('Formato de RUT inválido. Debe ser XXXXXXXX-Y.')
    #
    # cuerpo = rut[:-1]
    # dv = rut[-1]
    #
    # suma = 0
    # multiplo = 2
    #
    # for c in reversed(cuerpo):
    #     suma += int(c) * multiplo
    #     multiplo += 1
    #     if multiplo == 8:
    #         multiplo = 2
    #
    # res = 11 - (suma % 11)
    #
    # if res == 11:
    #     dv_calc = '0'
    # elif res == 10:
    #     dv_calc = 'K'
    # else:
    #     dv_calc = str(res)
    #
    # if dv != dv_calc:
    #     raise ValidationError('RUT inválido (dígito verificador incorrecto).')
    pass

def format_rut(value):
    """
    Formatea el RUT con puntos y guión: XX.XXX.XXX-Y
    Solo formatea si el RUT es numérico (RUT real). Si es ficticio, lo retorna tal cual.
    """
    rut = value.replace('.', '').replace('-', '').upper()
    if len(rut) < 2:
        return value

    cuerpo = rut[:-1]
    dv = rut[-1]

    try:
        formatted_cuerpo = '{:,}'.format(int(cuerpo)).replace(',', '.')
        return f"{formatted_cuerpo}-{dv}"
    except ValueError:
        return value.strip().upper()

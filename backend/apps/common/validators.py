import re
from django.core.exceptions import ValidationError

def validate_rut(value):
    """
    Valida que el RUT sea válido según el algoritmo del módulo 11.
    El formato esperado puede contener puntos y guión, o solo el guión.
    """
    rut = value.replace('.', '').replace('-', '').upper()
    
    if not re.match(r'^\d{7,8}[0-9K]$', rut):
        raise ValidationError('Formato de RUT inválido. Debe ser XXXXXXXX-Y.')

    cuerpo = rut[:-1]
    dv = rut[-1]

    suma = 0
    multiplo = 2

    for c in reversed(cuerpo):
        suma += int(c) * multiplo
        multiplo += 1
        if multiplo == 8:
            multiplo = 2

    res = 11 - (suma % 11)
    
    if res == 11:
        dv_calc = '0'
    elif res == 10:
        dv_calc = 'K'
    else:
        dv_calc = str(res)

    if dv != dv_calc:
        raise ValidationError('RUT inválido (dígito verificador incorrecto).')

def format_rut(value):
    """
    Formatea el RUT con puntos y guión: XX.XXX.XXX-Y
    """
    rut = value.replace('.', '').replace('-', '').upper()
    if len(rut) < 2:
        return value
        
    cuerpo = rut[:-1]
    dv = rut[-1]
    
    formatted_cuerpo = '{:,}'.format(int(cuerpo)).replace(',', '.')
    return f"{formatted_cuerpo}-{dv}"

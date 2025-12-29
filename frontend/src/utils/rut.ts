export const cleanRut = (rut: string | null | undefined): string => {
  if (!rut) return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
};

export const formatRut = (rut: string | null | undefined): string => {
  if (!rut) return 'N/A';
  const clean = cleanRut(rut);
  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let formattedBody = '';
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    formattedBody = body.charAt(i) + (j > 0 && j % 3 === 0 ? '.' : '') + formattedBody;
  }

  return `${formattedBody}-${dv}`;
};

export const validateRut = (rut: string | null | undefined): boolean => {
  if (!rut) return false;
  const clean = cleanRut(rut);
  if (clean.length < 8) return false; // Minimum length for valid RUT

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const bodyNum = parseInt(body, 10);

  if (isNaN(bodyNum)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let calculatedDv = remainder.toString();

  if (remainder === 11) calculatedDv = '0';
  if (remainder === 10) calculatedDv = 'K';

  return dv === calculatedDv;
};

export interface Paciente {
    id: number;
    rut: string;
    nombre: string;
    apellido: string;
    prevision: string;
    correo?: string;
    numero_telefono?: string;
    fecha_nacimiento: string;
    domicilio?: string;
    edad?: number;
    created_at?: string;
    updated_at?: string;
}

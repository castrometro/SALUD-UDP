export interface Paciente {
    id: number;
    rut: string;
    nombre: string;
    apellido: string;
    sexo: string;
    prevision: string;
    correo?: string;
    numero_telefono?: string;
    fecha_nacimiento: string;
    domicilio?: string;
    antecedentes_personales: string;
    medicamentos_habituales: string;
    alergias: string;
    edad?: number;
    created_at?: string;
    updated_at?: string;
}

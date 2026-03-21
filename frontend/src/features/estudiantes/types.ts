export interface Estudiante {
    id: number;
    rut: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';
    is_active: boolean;
}

export interface EstudianteCreateData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    rut: string;
}

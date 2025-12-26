export interface Estudiante {
    id: number;
    rut: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';
}

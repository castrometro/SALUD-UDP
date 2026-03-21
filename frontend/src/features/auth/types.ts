export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    rut: string;
    role: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';
    is_active: boolean;
}

export interface AuthResponse {
    access: string;
    refresh: string;
}

import api from '../../../services/api';
import { Estudiante } from '../types';

export const getEstudiantes = async (): Promise<Estudiante[]> => {
    const response = await api.get<Estudiante[]>('/users/', {
        params: { role: 'ESTUDIANTE' }
    });
    return response.data;
};

export const getEstudiante = async (id: number): Promise<Estudiante> => {
    const response = await api.get<Estudiante>(`/users/${id}/`);
    return response.data;
};

export const createEstudiante = async (estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    const response = await api.post<Estudiante>('/users/', { ...estudiante, role: 'ESTUDIANTE' });
    return response.data;
};

export const updateEstudiante = async (id: number, estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    const response = await api.patch<Estudiante>(`/users/${id}/`, estudiante);
    return response.data;
};

export const deleteEstudiante = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
};

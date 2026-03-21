import api from '@/services/api';
import { PaginatedResponse } from '@/types/common';
import { Estudiante, EstudianteCreateData } from '../types';

export const getEstudiantes = async (page: number = 1, search: string = ''): Promise<PaginatedResponse<Estudiante>> => {
    const response = await api.get<PaginatedResponse<Estudiante>>(`/users/estudiantes/?page=${page}&search=${search}`);
    return response.data;
};

export const getEstudiante = async (id: number): Promise<Estudiante> => {
    const response = await api.get<Estudiante>(`/users/estudiantes/${id}/`);
    return response.data;
};

export const createEstudiante = async (estudiante: EstudianteCreateData): Promise<Estudiante> => {
    const response = await api.post<Estudiante>('/users/estudiantes/', estudiante);
    return response.data;
};

export const updateEstudiante = async (id: number, estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    const response = await api.patch<Estudiante>(`/users/estudiantes/${id}/`, estudiante);
    return response.data;
};

export const deleteEstudiante = async (id: number): Promise<void> => {
    await api.delete(`/users/estudiantes/${id}/`);
};

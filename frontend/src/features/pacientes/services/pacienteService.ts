import api from '@/services/api';
import { PaginatedResponse } from '@/types/common';
import { Paciente } from '../types';

export const getPacientes = async (page: number = 1, search: string = ''): Promise<PaginatedResponse<Paciente>> => {
    const response = await api.get<PaginatedResponse<Paciente>>(`/pacientes/?page=${page}&search=${search}`);
    return response.data;
};

export const getPaciente = async (id: number): Promise<Paciente> => {
    const response = await api.get<Paciente>(`/pacientes/${id}/`);
    return response.data;
};

export const createPaciente = async (paciente: Paciente): Promise<Paciente> => {
    const response = await api.post<Paciente>('/pacientes/', paciente);
    return response.data;
};

export const updatePaciente = async (id: number, paciente: Partial<Paciente>): Promise<Paciente> => {
    const response = await api.patch<Paciente>(`/pacientes/${id}/`, paciente);
    return response.data;
};

export const deletePaciente = async (id: number): Promise<void> => {
    await api.delete(`/pacientes/${id}/`);
};

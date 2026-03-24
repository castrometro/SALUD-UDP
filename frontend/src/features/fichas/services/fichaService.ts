import api from '@/services/api';
import { CasoClinico, FichaEstudiante, FichaHistorial } from '../types';
import { PaginatedResponse } from '@/types/common';

// ──────────────────────────────────────────────
// Casos Clínicos
// ──────────────────────────────────────────────

export const getCasosClinicos = async (page: number = 1, pageSize: number = 10, pacienteId?: number, search?: string): Promise<PaginatedResponse<CasoClinico>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (pacienteId) params.paciente = pacienteId;
    if (search) params.search = search;
    const response = await api.get<PaginatedResponse<CasoClinico>>('/fichas/casos-clinicos/', { params });
    return response.data;
};

export const getCasoClinico = async (id: number): Promise<CasoClinico> => {
    const response = await api.get<CasoClinico>(`/fichas/casos-clinicos/${id}/`);
    return response.data;
};

export const createCasoClinico = async (data: { titulo: string; descripcion?: string; paciente: number }): Promise<CasoClinico> => {
    const response = await api.post<CasoClinico>('/fichas/casos-clinicos/', data);
    return response.data;
};

export const updateCasoClinico = async (id: number, data: { titulo?: string; descripcion?: string; paciente?: number }): Promise<CasoClinico> => {
    const response = await api.patch<CasoClinico>(`/fichas/casos-clinicos/${id}/`, data);
    return response.data;
};

export const deleteCasoClinico = async (id: number): Promise<void> => {
    await api.delete(`/fichas/casos-clinicos/${id}/`);
};

export const getFichasEstudiantesDeCaso = async (casoId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<FichaEstudiante>> => {
    const response = await api.get<PaginatedResponse<FichaEstudiante>>(
        `/fichas/casos-clinicos/${casoId}/fichas_estudiantes/`,
        { params: { page, page_size: pageSize } }
    );
    return response.data;
};

// ──────────────────────────────────────────────
// Fichas de Estudiantes
// ──────────────────────────────────────────────

export const getFichasEstudiante = async (page: number = 1, pageSize: number = 10, estudianteId?: number): Promise<PaginatedResponse<FichaEstudiante>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (estudianteId) params.estudiante = estudianteId;
    const response = await api.get<PaginatedResponse<FichaEstudiante>>('/fichas/fichas-estudiantes/', { params });
    return response.data;
};

export const getFichaEstudiante = async (id: number): Promise<FichaEstudiante> => {
    const response = await api.get<FichaEstudiante>(`/fichas/fichas-estudiantes/${id}/`);
    return response.data;
};

export const updateFichaEstudiante = async (id: number, data: Partial<FichaEstudiante>): Promise<FichaEstudiante> => {
    const response = await api.patch<FichaEstudiante>(`/fichas/fichas-estudiantes/${id}/`, data);
    return response.data;
};

export const deleteFichaEstudiante = async (id: number): Promise<void> => {
    await api.delete(`/fichas/fichas-estudiantes/${id}/`);
};

export const crearMiFicha = async (casoClinicoId: number): Promise<FichaEstudiante> => {
    const response = await api.post<FichaEstudiante>('/fichas/fichas-estudiantes/crear_mi_ficha/', {
        caso_clinico_id: casoClinicoId
    });
    return response.data;
};

export const getMiFicha = async (casoClinicoId: number): Promise<FichaEstudiante | null> => {
    try {
        const response = await api.get<FichaEstudiante>('/fichas/fichas-estudiantes/mi_ficha/', {
            params: { caso_clinico: casoClinicoId }
        });
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const getFichaHistorial = async (fichaId: number): Promise<FichaHistorial[]> => {
    const response = await api.get<FichaHistorial[]>(`/fichas/fichas-estudiantes/${fichaId}/historial/`);
    return response.data;
};

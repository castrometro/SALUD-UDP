import api from '@/services/api';
import { CasoClinico, AtencionClinica, AtencionEstudiante, Evolucion } from '../types';
import { PaginatedResponse } from '@/types/common';

// ──────────────────────────────────────────────
// Casos Clínicos
// ──────────────────────────────────────────────

export const getCasosClinicos = async (page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedResponse<CasoClinico>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (search) params.search = search;
    const response = await api.get<PaginatedResponse<CasoClinico>>('/fichas/casos-clinicos/', { params });
    return response.data;
};

export const getCasoClinico = async (id: number): Promise<CasoClinico> => {
    const response = await api.get<CasoClinico>(`/fichas/casos-clinicos/${id}/`);
    return response.data;
};

export const createCasoClinico = async (data: { titulo: string; descripcion?: string }): Promise<CasoClinico> => {
    const response = await api.post<CasoClinico>('/fichas/casos-clinicos/', data);
    return response.data;
};

export const updateCasoClinico = async (id: number, data: { titulo?: string; descripcion?: string }): Promise<CasoClinico> => {
    const response = await api.patch<CasoClinico>(`/fichas/casos-clinicos/${id}/`, data);
    return response.data;
};

export const deleteCasoClinico = async (id: number): Promise<void> => {
    await api.delete(`/fichas/casos-clinicos/${id}/`);
};

export const getAtencionesDeCaso = async (casoId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<AtencionClinica>> => {
    const response = await api.get<PaginatedResponse<AtencionClinica>>(
        `/fichas/casos-clinicos/${casoId}/atenciones/`,
        { params: { page, page_size: pageSize } }
    );
    return response.data;
};

// ──────────────────────────────────────────────
// Atenciones Clínicas
// ──────────────────────────────────────────────

export const getAtencionesClinicas = async (page: number = 1, pageSize: number = 10, casoId?: number, pacienteId?: number): Promise<PaginatedResponse<AtencionClinica>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (casoId) params.caso_clinico = casoId;
    if (pacienteId) params.paciente = pacienteId;
    const response = await api.get<PaginatedResponse<AtencionClinica>>('/fichas/atenciones-clinicas/', { params });
    return response.data;
};

export const getAtencionClinica = async (id: number): Promise<AtencionClinica> => {
    const response = await api.get<AtencionClinica>(`/fichas/atenciones-clinicas/${id}/`);
    return response.data;
};

export const createAtencionClinica = async (data: { caso_clinico: number; paciente: number; fecha_atencion: string }): Promise<AtencionClinica> => {
    const response = await api.post<AtencionClinica>('/fichas/atenciones-clinicas/', data);
    return response.data;
};

export const updateAtencionClinica = async (id: number, data: Partial<AtencionClinica>): Promise<AtencionClinica> => {
    const response = await api.patch<AtencionClinica>(`/fichas/atenciones-clinicas/${id}/`, data);
    return response.data;
};

export const deleteAtencionClinica = async (id: number): Promise<void> => {
    await api.delete(`/fichas/atenciones-clinicas/${id}/`);
};

export const asignarEstudiante = async (atencionId: number, estudianteId: number): Promise<AtencionEstudiante> => {
    const response = await api.post<AtencionEstudiante>(
        `/fichas/atenciones-clinicas/${atencionId}/asignar_estudiante/`,
        { estudiante_id: estudianteId }
    );
    return response.data;
};

export const getEstudiantesDeAtencion = async (atencionId: number): Promise<AtencionEstudiante[]> => {
    const response = await api.get<{ results: AtencionEstudiante[] } | AtencionEstudiante[]>(
        `/fichas/atenciones-clinicas/${atencionId}/estudiantes/`
    );
    const data = response.data;
    return Array.isArray(data) ? data : data.results;
};

// ──────────────────────────────────────────────
// Atenciones Estudiante
// ──────────────────────────────────────────────

export const getAtencionesEstudiante = async (page: number = 1, pageSize: number = 10, estudianteId?: number, atencionClinicaId?: number): Promise<PaginatedResponse<AtencionEstudiante>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (estudianteId) params.estudiante = estudianteId;
    if (atencionClinicaId) params.atencion_clinica = atencionClinicaId;
    const response = await api.get<PaginatedResponse<AtencionEstudiante>>('/fichas/atenciones-estudiantes/', { params });
    return response.data;
};

export const getAtencionEstudiante = async (id: number): Promise<AtencionEstudiante> => {
    const response = await api.get<AtencionEstudiante>(`/fichas/atenciones-estudiantes/${id}/`);
    return response.data;
};

export const crearEvolucion = async (asignacionId: number, data: { contenido?: Record<string, string>; tipo_autor: string; nombre_autor?: string }): Promise<Evolucion> => {
    const response = await api.post<Evolucion>(
        `/fichas/atenciones-estudiantes/${asignacionId}/crear_evolucion/`,
        data
    );
    return response.data;
};

export const getEvolucionesDeAsignacion = async (asignacionId: number): Promise<Evolucion[]> => {
    const response = await api.get<Evolucion[]>(
        `/fichas/atenciones-estudiantes/${asignacionId}/evoluciones/`
    );
    return response.data;
};

// ──────────────────────────────────────────────
// Evoluciones
// ──────────────────────────────────────────────

export const getEvoluciones = async (page: number = 1, pageSize: number = 10, atencionEstudianteId?: number): Promise<PaginatedResponse<Evolucion>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (atencionEstudianteId) params.atencion_estudiante = atencionEstudianteId;
    const response = await api.get<PaginatedResponse<Evolucion>>('/fichas/evoluciones/', { params });
    return response.data;
};

export const getEvolucion = async (id: number): Promise<Evolucion> => {
    const response = await api.get<Evolucion>(`/fichas/evoluciones/${id}/`);
    return response.data;
};

export const updateEvolucion = async (id: number, data: { contenido: Record<string, string> }): Promise<Evolucion> => {
    const response = await api.patch<Evolucion>(`/fichas/evoluciones/${id}/`, data);
    return response.data;
};

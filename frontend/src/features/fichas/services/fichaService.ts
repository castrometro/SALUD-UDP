import api from '../../../services/api';
import { FichaAmbulatoria, FichaHistorial } from '../types';

export const getFichas = async (): Promise<FichaAmbulatoria[]> => {
    const response = await api.get<FichaAmbulatoria[]>('/fichas/');
    return response.data;
};

export const getFichasPlantillas = async (): Promise<FichaAmbulatoria[]> => {
    const response = await api.get<FichaAmbulatoria[]>('/fichas/', {
        params: { plantillas: 'true' }
    });
    return response.data;
};

export const getFichasByPaciente = async (pacienteId: number): Promise<FichaAmbulatoria[]> => {
    const response = await api.get<FichaAmbulatoria[]>('/fichas/', {
        params: { paciente: pacienteId }
    });
    return response.data;
};

export const getFicha = async (id: number): Promise<FichaAmbulatoria> => {
    const response = await api.get<FichaAmbulatoria>(`/fichas/${id}/`);
    return response.data;
};

export const createFicha = async (ficha: Partial<FichaAmbulatoria>): Promise<FichaAmbulatoria> => {
    // Asegurar que estudiante y ficha_base se envíen como null si no están definidos
    const dataToSend = {
        ...ficha,
        estudiante: ficha.estudiante ?? null,
        ficha_base: ficha.ficha_base ?? null,
    };
    const response = await api.post<FichaAmbulatoria>('/fichas/', dataToSend);
    return response.data;
};

export const updateFicha = async (id: number, ficha: Partial<FichaAmbulatoria>): Promise<FichaAmbulatoria> => {
    const response = await api.patch<FichaAmbulatoria>(`/fichas/${id}/`, ficha);
    return response.data;
};

export const deleteFicha = async (id: number): Promise<void> => {
    await api.delete(`/fichas/${id}/`);
};

// Crear ficha de estudiante basada en plantilla
export const crearMiFicha = async (fichaBaseId: number): Promise<FichaAmbulatoria> => {
    const response = await api.post<FichaAmbulatoria>('/fichas/crear_mi_ficha/', {
        ficha_base_id: fichaBaseId
    });
    return response.data;
};

// Obtener mi ficha para una plantilla específica
export const getMiFicha = async (fichaBaseId: number): Promise<FichaAmbulatoria | null> => {
    try {
        const response = await api.get<FichaAmbulatoria>(`/fichas/${fichaBaseId}/mi_ficha/`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

// Obtener fichas de estudiantes para una plantilla (solo docentes)
export const getFichasEstudiantes = async (fichaBaseId: number): Promise<FichaAmbulatoria[]> => {
    const response = await api.get<FichaAmbulatoria[]>(`/fichas/${fichaBaseId}/fichas_estudiantes/`);
    return response.data;
};

// Obtener historial de versiones de una ficha
export const getFichaHistorial = async (fichaId: number): Promise<FichaHistorial[]> => {
    const response = await api.get<FichaHistorial[]>(`/fichas/${fichaId}/historial/`);
    return response.data;
};

import api from '../../../services/api';
import { FichaAmbulatoria } from '../types';

export const getFichas = async (): Promise<FichaAmbulatoria[]> => {
    const response = await api.get<FichaAmbulatoria[]>('/fichas/');
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
    const response = await api.post<FichaAmbulatoria>('/fichas/', ficha);
    return response.data;
};

export const updateFicha = async (id: number, ficha: Partial<FichaAmbulatoria>): Promise<FichaAmbulatoria> => {
    const response = await api.patch<FichaAmbulatoria>(`/fichas/${id}/`, ficha);
    return response.data;
};

export const deleteFicha = async (id: number): Promise<void> => {
    await api.delete(`/fichas/${id}/`);
};

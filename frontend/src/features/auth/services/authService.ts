import api from '../../../services/api';
import { AuthResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/token/', { email, password });
    return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    return response.data;
};

import client from '../../api/client';
import type { LoginRequest, LoginResponse } from './types'; // Definiremos estos tipos abajo

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    // Axios ya sabe que la URL base es localhost:8080/api/v1
    // Así que solo ponemos la parte final:
    const response = await client.post<LoginResponse>('/auth/login', data);
    return response.data;
};
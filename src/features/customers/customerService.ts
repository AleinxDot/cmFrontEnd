import client from '../../api/client';
import type { Customer } from './types'; // Asegúrate de tener la interfaz Customer en types.ts
import type { CreateCustomerRequest } from './types'; // O defínela aquí
import type { ExternalCustomer } from './types';
// Listado paginado
export const getCustomersList = async (page: number, size: number, search: string = '') => {
    const response = await client.get(`/customers?page=${page}&size=${size}&search=${search}`);
    return response.data;
};

// Búsqueda simple (para el módulo de ventas)
export const searchCustomers = async (query: string) => {
    const response = await client.get<Customer[]>(`/customers/search?query=${query}`);
    return response.data;
};

export const createCustomer = async (data: CreateCustomerRequest) => {
    const response = await client.post<Customer>('/customers', data);
    return response.data;
};

// NUEVO: Actualizar
export const updateCustomer = async (id: number, data: CreateCustomerRequest) => {
    const response = await client.put<Customer>(`/customers/${id}`, data);
    return response.data;
};
export const consultExternalCustomer = async (docNumber: string) => {
    const response = await client.get<ExternalCustomer>(`/customers/consult-external/${docNumber}`);
    return response.data;
};
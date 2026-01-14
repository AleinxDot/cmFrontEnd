import client from '../../api/client';
import type { Customer, CreateCustomerRequest } from './types';

export const searchCustomers = async (query: string): Promise<Customer[]> => {
    if (!query) return [];
    const response = await client.get<Customer[]>(`/customers?query=${query}`);
    return response.data;
};

export const createCustomer = async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await client.post('/customers', data);
    return response.data as Customer;
};
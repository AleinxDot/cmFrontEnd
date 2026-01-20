import client from '../../api/client';
import type { ExternalSupplier, Supplier } from './types';

export const getSuppliers = async () => (await client.get<Supplier[]>('/suppliers/all')).data;

export const createSupplier = async (data: Omit<Supplier, 'id'>) => {
    return (await client.post<Supplier>('/suppliers', data)).data;
};

// --- NUEVA FUNCIÓN ---
export const consultExternalSupplier = async (docNumber: string) => {
    const response = await client.get<ExternalSupplier>(`/suppliers/consult-external/${docNumber}`);
    return response.data;
};
import client from '../../api/client';
import type { StockEntryRequest } from './types';

// Reusamos la búsqueda (Podríamos mover esto a un servicio 'catalog' compartido)
export const searchProducts = async (query: string) => {
    const response = await client.get<any>(`/products?search=${query}&size=5`);
    return response.data.content;
};

export const createStockEntry = async (data: StockEntryRequest) => {
    const response = await client.post('/inventory/entry', data);
    return response.data;
};
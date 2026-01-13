import client from '../../api/client';
import type { Product, SaleRequest } from './types';

// Buscar productos (por nombre o código de barras)
// Usamos el endpoint paginado pero pedimos solo los primeros 5 resultados para ser rápidos
export const searchProducts = async (query: string): Promise<Product[]> => {
    const response = await client.get<any>(`/products?search=${query}&size=5`);
    // El backend devuelve una estructura Page, necesitamos la lista 'content'
    // Mapeamos para adaptar los nombres de campos si el DTO del backend difiere
    return response.data.content.map((p: any) => ({
        id: p.id,
        barcode: p.barcode,
        name: p.name,
        price: p.price,
        stock: p.stock
    }));
};

// Enviar la venta al backend
export const createSale = async (sale: SaleRequest) => {
    const response = await client.post('/sales', sale);
    return response.data;
};
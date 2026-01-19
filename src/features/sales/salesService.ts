import client from '../../api/client';
import type { Product, SaleRequest } from './types';
import type { SaleDetail } from './types'; // Importa los tipos


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

export const convertQuote = async (id: number, targetType: string) => {
    const response = await client.post(`/sales/${id}/convert?targetType=${targetType}`);
    return response.data;
};

export const downloadSalePdf = async (saleId: number) => {
    const response = await client.get(`/sales/${saleId}/pdf`, {
        responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `venta-${saleId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// Actualizamos getQuotes para aceptar el filtro
export const getQuotes = async (showArchived: boolean = false) => {
    const response = await client.get(`/sales/quotes?showArchived=${showArchived}`);
    return response.data;
};

// Obtener detalle
export const getSaleDetail = async (id: number) => {
    const response = await client.get<SaleDetail>(`/sales/${id}`);
    return response.data;
};

// Archivar
export const archiveQuote = async (id: number) => {
    return await client.put(`/sales/${id}/archive`);
};

// Historial
export const getSalesHistory = async () => {
    const response = await client.get<any[]>('/sales/history');
    return response.data;
};
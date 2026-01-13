import client from '../../api/client';
import type { DropdownItem, ProductPayload } from './types';

export const getBrands = async () => (await client.get<DropdownItem[]>('/catalog/brands')).data;
export const getCategories = async () => (await client.get<DropdownItem[]>('/catalog/categories')).data;

export const createBrand = async (name: string) => {
    return (await client.post<DropdownItem>('/catalog/brands', { name })).data;
};

export const createProduct = async (product: ProductPayload) => {
    return (await client.post('/catalog/products', product)).data;
};

export const createCategory = async (name: string) => {
    return (await client.post<DropdownItem>('/catalog/categories', { name })).data;
};
export const updateProduct = async (id: number, product: ProductPayload) => {
    return (await client.put(`/catalog/products/${id}`, product)).data;
};
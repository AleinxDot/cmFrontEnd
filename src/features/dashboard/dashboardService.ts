import client from '../../api/client';
import type { DashboardStats, LowStockProduct, PaginatedResponse } from './types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await client.get<DashboardStats>('/reports/dashboard/stats');
    return response.data;
};

export const getLowStockProducts = async (page: number, size: number): Promise<PaginatedResponse<LowStockProduct>> => {
    const response = await client.get<PaginatedResponse<LowStockProduct>>(`/reports/dashboard/low-stock?page=${page}&size=${size}`);
    return response.data;
};
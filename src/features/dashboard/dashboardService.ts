import client from '../../api/client';
import type { DashboardStats } from './types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await client.get<DashboardStats>('/reports/dashboard');
    return response.data;
};
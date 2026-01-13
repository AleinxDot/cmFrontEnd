export interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    minStock: number;
}

export interface DashboardStats {
    todaySalesAmount: number;
    todaySalesCount: number;
    lowStockCount: number;
    lowStockProducts: LowStockProduct[];
}
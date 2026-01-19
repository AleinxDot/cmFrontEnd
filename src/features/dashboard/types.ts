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
export interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    minStock: number;
}

export interface CategorySale {
    categoryName: string;
    totalAmount: number;
    percentage: number;
}

export interface DashboardStats {
    monthlySalesAmount: number;
    monthlySalesCount: number;
    lowStockTotalCount: number;
    salesByCategory: CategorySale[];
}

// Respuesta paginada genérica (o específica para productos)
export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // Página actual
}
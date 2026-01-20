export interface StockEntryItem {
    productId: number;
    productName: string; // Para mostrar en la tabla
    quantity: number;
    unitCost: number;
}

export interface StockEntryRequest {
    reference: string;
    comments: string;
    supplierId: number | null;
    items: {
        productId: number;
        quantity: number;
        unitCost: number;
    }[];
}
export interface Supplier {
    id: number;
    ruc: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface ExternalSupplier {
    docNumber: string;
    name: string;
    address?: string;
    status?: string;
    condition?: string;
}
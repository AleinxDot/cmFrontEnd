export interface StockEntryItem {
    productId: number;
    productName: string; // Para mostrar en la tabla
    quantity: number;
    unitCost: number;
}

export interface StockEntryRequest {
    reference: string;
    comments: string;
    items: {
        productId: number;
        quantity: number;
        unitCost: number;
    }[];
}
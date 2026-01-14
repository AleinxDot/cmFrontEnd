export interface Product {
    id: number;
    barcode: string;
    name: string;
    price: number;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
    subtotal: number;
}

export interface SaleRequest {
    clientId: number | null;
    type: 'BOLETA' | 'FACTURA' | 'COTIZACION';
    items: { productId: number; quantity: number }[];
}
export interface Quote {
    id: number;
    documentNumber: string;
    totalAmount: number;
    issueDate: string;
    customerName: string;
}
export interface SaleDetail {
    id: number;
    documentNumber: string;
    customerName: string;
    issueDate: string;
    totalAmount: number;
    status: string;
    items: {
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }[];
}
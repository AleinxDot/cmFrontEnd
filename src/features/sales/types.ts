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
    type: 'BOLETA' | 'FACTURA';
    items: { productId: number; quantity: number }[];
}
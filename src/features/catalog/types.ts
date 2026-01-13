export interface DropdownItem {
    id: number;
    name: string;
}

export interface ProductPayload {
    barcode: string;
    name: string;
    brandId: number;
    categoryId: number;
    price: number;
    minStock: number;
}
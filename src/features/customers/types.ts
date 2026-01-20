export interface Customer {
    id: number;
    name: string;
    docNumber: string; // DNI o RUC
    email?: string;
    phone?: string;
    address?: string;
}

export interface CreateCustomerRequest {
    name: string;
    docNumber: string;
    email?: string;
    phone?: string;
    address?: string;
}
export interface ExternalCustomer {
    docNumber: string;
    name: string;
    address?: string;
    status?: string;
    condition?: string;
}
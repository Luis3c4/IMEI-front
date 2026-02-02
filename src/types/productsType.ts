export interface Welcome {
    success: boolean;
    data:    Product[];
    count:   number;
    error:   null;
}

export interface Product {
    id:               number;
    name:             string;
    category:         string;
    created_at:       Date;
    updated_at:       Date;
    product_variants: ProductVariant[];
}

export interface    ProductVariant {
    id:             number;
    color:          string | null;
    price:          number;
    capacity:       string | null;
    product_number?: string;
    product_numbers?: string[];
    product_items:  ProductItem[];
    quantity:       number;
    serial_numbers: string[];
    model_description?: string;
}

export interface ProductItem {
    id:            number;
    status:        Status;
    serial_number: string;
    product_number?: string;
}

export const Status = {
    Available: "available",
    Sold: "sold",
} as const;

export type Status = typeof Status[keyof typeof Status];

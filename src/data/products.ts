// Interfaces para la estructura de la factura
export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  product_number: string;
  serial_number: string;
  item_price: number;
  quantity?: number;
  capacity?: string;
  color?: string;
  base_product_id: string;
  variant_id?: string;
  quantity_ordered?: number;
  quantity_fulfilled?: number;
  extended_price?: number;
  status?: string;
}

export interface Customer {
  name: string;
  customer_number: string;
}

export interface InvoiceInfo {
  invoice_number: string;
  invoice_date: string;
}

export interface Invoice {
  order_date: string;
  order_number: string;
  customer: Customer;
  products: Product[];
  invoice_info: InvoiceInfo;
}

// Datos estáticos para desarrollo/pruebas
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

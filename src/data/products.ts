// Interfaces para la estructura de la factura
export interface Product {
  id: string;
  name: string;
  product_number: string;
  serial_number: string;
  item_price: number;
  quantity?: number;
  capacity?: string;
  color?: string;
  description?: string;
  base_product_id?: string;
  variant_id?: string;
  quantity_ordered?: number;
  quantity_fulfilled?: number;
  extended_price?: number;
  category: string;
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
export const mockInvoice: Invoice = {
  order_date: "September 04, 2025",
  order_number: "W1351042737",
  customer: {
    name: "Geraldine Eva Flores Flores",
    customer_number: "900007"
  },
  products: [
    {
      id: "1",
      name: "IPAD MINI 8.3 WIFI 128GB PURPLE - USA",
      product_number: "MXN93LL/A",
      serial_number: "L9FHJMXD66",
      item_price: 499.0,
      quantity_ordered: 1,
      quantity_fulfilled: 1,
      extended_price: 499.0,
      category: "iPad"
    },
    {
      id: "2" ,
      name: "APPLE PENCIL PRO-AME",
      product_number: "MX2D3AM/A",
      serial_number: "D9D257714C",
      item_price: 129.0,
      quantity_ordered: 1,
      quantity_fulfilled: 1,
      extended_price: 129.0,
      category: "Accesorios"},
    {
      id: "3",
      name: "APPLE PENCIL PRO-AME",
      product_number: "MX2D3AM/A",
      serial_number: "D9D257714C",
      item_price: 129.0,
      quantity_ordered: 1,
      quantity_fulfilled: 1,
      extended_price: 129.0,
      category: "Accesorios"
    },
    {
      id: "4",
      name: "APPLE PENCIL PRO-AME",
      product_number: "MX2D3AM/A",
      serial_number: "D9D257714C",
      item_price: 129.0,
      quantity_ordered: 1,
      quantity_fulfilled: 1,
      extended_price: 129.0,
      category: "Accesorios"
    },
  ],
  invoice_info: {
    invoice_number: "MA85377130",
    invoice_date: "September 04, 2025"
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

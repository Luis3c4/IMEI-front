// Types for the Quantum (historial) table — one row per invoice_product

export interface HistorialProductItem {
  serial_number: string | null;
}

export interface HistorialProductVariant {
  color: string | null;
  capacity: string | null;
  chip: string | null;
}

export interface HistorialProduct {
  name: string;
  category: string;
}

export interface HistorialInvoiceProduct {
  id: number;
  unit_price: number | null;
  extended_price: number | null;
  products: HistorialProduct | null;
  product_variants: HistorialProductVariant | null;
  product_items: HistorialProductItem | null;
}

export interface HistorialCustomer {
  name: string | null;
  dni: string | null;
  phone: string | null;
}

export interface HistorialInvoice {
  id: number;
  invoice_date: string | null;
  shipping_agency: string | null;
  shipping_department: string | null;
  shipping_province: string | null;
  bank_name: string | null;
  payment_total: number | null;
  payment_holder: string | null;
  customers: HistorialCustomer | null;
  invoice_products: HistorialInvoiceProduct[];
}

/** Flat row for table rendering — one per invoice_product */
export interface QuantumRow {
  invoiceId: number;
  invoiceProductId: number;
  producto: string | null;   // products.category
  detalle: string | null;    // products.name
  color: string | null;
  gb: string | null;
  serie: string | null;
  dpto: string | null;
  provincia: string | null;
  agencia: string | null;
  dni: string | null;
  cliente: string | null;
  telefono: string | null;
  fechaVenta: string | null;
  banco: string | null;
  total: number | null;
  titular: string | null;
}

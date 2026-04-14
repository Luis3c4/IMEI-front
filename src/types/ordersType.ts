export type KanbanPhase = "pedido" | "reservado" | "entregado" | "completado";

export interface OrderProduct {
  id: number;
  product_id: number;
  label: string;
}

export interface Order {
  id: string;
  customer_id: number;
  customer_name?: string;
  customer_dni?: string;
  customer_phone?: string;
  phase: KanbanPhase;
  order_date: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  products: OrderProduct[];
}

export interface CreateOrderPayload {
  customer_dni: string;
  customer_name: string;
  customer_phone?: string;
  order_date: string;
  products: {
    product_id: number;
    label: string;
    unit_price?: number;
  }[];
}

export interface MacbookVariants {
  capacities: string[];
  chips_by_capacity: Record<string, string[]>;
}

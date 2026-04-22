// Servicio con TanStack Query para llamadas a API

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { API_URL } from "../utils/constants";
import type { Product, CreateProductRequest, CreateProductResponse } from "../types/productsType";
import type { LastOrderInfo, ServiceResponse, DeviceApiResponse } from "../types";
import type { Product as HierarchicalProduct, ProductHierarchyResponse } from "../types/mockProductsType";
import type { CustomerListResponse } from "../types/clientesType";
import { supabase } from "../lib/supabase";
import type { KanbanPhase, Order, OrderProduct, CreateOrderPayload, MacbookVariants } from "../types/ordersType";
import type { HistorialInvoice } from "../types/historyType";

export type { KanbanPhase, Order, OrderProduct, CreateOrderPayload, MacbookVariants };
// ============= Query Keys =============
export const queryKeys = {
  balance: ["balance"] as const,
  products: ["products"] as const,
  inventory: (category?: string) => ["inventory", category] as const,
  services: ["services"] as const,
  lastOrder: ["lastOrder"] as const,
  dni: (dniNumber: string) => ["dni", dniNumber] as const,
  customers: (userId?: string, search?: string, page?: number, pageSize?: number) => ["customers", userId, search, page, pageSize] as const,
  macbookVariants: (model: string) => ["macbookVariants", model] as const,
  customerInvoices: (customerId: number) => ["customerInvoices", customerId] as const,
  historial: ["historial"] as const,
};

export interface CustomerInvoice {
  id: number;
  invoice_number: string;
  order_number: string | null;
  invoice_date: string;
  customer_number: string;
  created_at: string;
}

// ============= Funciones de Fetch =============
class ApiServiceClass {
  async checkDevice(
    code: string,
    serviceId: string,
    productNumber?: string
  ): Promise<DeviceApiResponse> {
    const response = await fetch(`${API_URL}/api/devices/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input_value: code,
        service_id: serviceId,
        formato: "beta",
        ...(productNumber?.trim()
          ? { product_number: productNumber.trim() }
          : {}),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al consultar el dispositivo");
    }

    return response.json();
  }

  async getBalance(): Promise<number | null> {
    try {
      const response = await fetch(`${API_URL}/api/devices/balance`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.balance ?? null;
    } catch {
      return null;
    }
  }

  async getMacbookVariants(model: string): Promise<MacbookVariants> {
    const params = new URLSearchParams({ model });
    const response = await fetch(`${API_URL}/api/products/macbook-variants?${params}`);

    if (!response.ok) {
      throw new Error("Error al obtener variantes MacBook");
    }

    return response.json();
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products`);

    if (!response.ok) {
      throw new Error("Error al cargar productos");
    }

    const payload = await response.json();

    if (!payload?.success || !Array.isArray(payload?.data)) {
      throw new Error(payload?.error || "Error al cargar productos");
    }

    return payload.data as Product[];
  }

  async createProduct(payload: CreateProductRequest): Promise<CreateProductResponse> {
    const response = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = "Error al crear producto";
      try {
        const error = await response.json();
        message = error?.detail || error?.error || message;
      } catch {
        // Ignorar parse error y mantener mensaje por defecto
      }
      throw new Error(message);
    }

    const responsePayload: CreateProductResponse = await response.json();
    if (!responsePayload?.success) {
      throw new Error(responsePayload?.error || "Error al crear producto");
    }

    return responsePayload;
  }

  async getInventory(category?: string): Promise<HierarchicalProduct[]> {
    const url = category 
      ? `${API_URL}/api/products/inventory?category=${encodeURIComponent(category)}`
      : `${API_URL}/api/products/inventory`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error al cargar inventario");
    }

    const payload: ProductHierarchyResponse = await response.json();

    if (!payload?.success || !Array.isArray(payload?.data)) {
      throw new Error("Error al cargar inventario");
    }

    return payload.data;
  }

  async getServices(): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${API_URL}/api/devices/services`);
      if (!response.ok) return {
        error: "true",
        meessage: "error en la respuesta",
        services: [],
        success: false,
        total: 0,
      };
      return response.json();
    } catch {
      return {
        error: "true",
        meessage: "Error al cargar servicios",
        services: [],
        success: false,
        total: 0,
      };
    }
  }

  async getLastOrder(): Promise<LastOrderInfo | null> {
    try {
      const response = await fetch(`${API_URL}/api/devices/last-order`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  async getInvoiceTestPdfPreview(invoiceBody: unknown): Promise<Blob> {
    // Obtener el token JWT de la sesión actual de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error("No hay sesión activa. Por favor, inicia sesión.");
    }

    const response = await fetch(`${API_URL}/api/invoices/generate/pdf`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`  // Agregar JWT token
      },
      body: JSON.stringify(invoiceBody),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.detail || error.error || "Error al generar el PDF");
      }
      throw new Error("Error al generar el PDF");
    }

    return response.blob();
  }

  async searchDni(dniNumber: string): Promise<{
    first_name: string;
    first_last_name: string;
    second_last_name: string;
    full_name: string;
    document_number: string;
  }> {
    const response = await fetch(`${API_URL}/api/reniec/dni?numero=${dniNumber}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al consultar el DNI");
    }

    return response.json();
  }

  async getCustomers(search?: string, page = 1, pageSize = 20): Promise<CustomerListResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No hay sesión activa. Por favor, inicia sesión.");
    }

    const url = new URL(`${API_URL}/api/customers/`);
    if (search?.trim()) url.searchParams.set("search", search.trim());
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", String(pageSize));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || error?.error || "Error al cargar clientes");
    }

    const payload: CustomerListResponse = await response.json();
    if (!payload?.success) {
      throw new Error(payload?.error || "Error al cargar clientes");
    }
    return payload;
  }

  async getCustomerInvoices(customerId: number): Promise<CustomerInvoice[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("No hay sesión activa. Por favor, inicia sesión.");
    }
    const response = await fetch(`${API_URL}/api/invoices/customer/${customerId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Error al cargar facturas del cliente");
    }
    const payload = await response.json();
    return (payload.data ?? []) as CustomerInvoice[];
  }

  async getInvoicePdf(invoiceId: number): Promise<Blob> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("No hay sesión activa. Por favor, inicia sesión.");
    }
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.detail || "Error al regenerar el PDF");
      }
      throw new Error("Error al regenerar el PDF");
    }
    return response.blob();
  }

  async bulkToggleSoldItems(itemIds: number[]): Promise<void> {
    const response = await fetch(`${API_URL}/api/products/items/bulk-toggle-sold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_ids: itemIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar el estado de los productos");
    }

    return response.json();
  }

  async getHistorialInvoices(): Promise<HistorialInvoice[]> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_URL}/api/historial`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Error al obtener historial");
    }

    const payload = await response.json();
    return (payload.data ?? []) as HistorialInvoice[];
  }
}

const apiService = new ApiServiceClass();

// ============= Hooks con TanStack Query =============

/**
 * Hook para obtener el balance
 */
export function useBalance(options?: Omit<UseQueryOptions<number | null>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.balance,
    queryFn: () => apiService.getBalance(),
    ...options,
  });
}

/**
 * Hook para obtener las variantes v\u00e1lidas (capacidades + chips) de un modelo MacBook
 * desde la tabla de precios del backend.
 */
export function useMacbookVariants(
  model: string,
  options?: Omit<UseQueryOptions<MacbookVariants>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.macbookVariants(model),
    queryFn: () => apiService.getMacbookVariants(model),
    staleTime: 1000 * 60 * 60, // 1 hora — los modelos no cambian frecuentemente
    ...options,
  });
}

/**
 * Hook para obtener productos
 */
export function useProducts(options?: Omit<UseQueryOptions<Product[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => apiService.getProducts(),
    ...options,
  });
}

/**
 * Hook para obtener inventario jerárquico
 */
export function useInventory(
  category?: string,
  options?: Omit<UseQueryOptions<HierarchicalProduct[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.inventory(category),
    queryFn: () => apiService.getInventory(category),
    ...options,
  });
}

/**
 * Hook para obtener servicios
 */
export function useServices(options?: Omit<UseQueryOptions<ServiceResponse>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: () => apiService.getServices(),
    ...options,
  });
}

/**
 * Hook para obtener la última orden
 */
export function useLastOrder(options?: Omit<UseQueryOptions<LastOrderInfo | null>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.lastOrder,
    queryFn: () => apiService.getLastOrder(),
    ...options,
  });
}

/**
 * Hook para obtener la lista de clientes
 */
export function useCustomers(
  userId?: string,
  search?: string,
  page = 1,
  pageSize = 20,
  isAuthenticated = false,
  options?: Omit<UseQueryOptions<CustomerListResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.customers(userId, search, page, pageSize),
    queryFn: () => apiService.getCustomers(search, page, pageSize),
    enabled: isAuthenticated,
    ...options,
  });
}

/**
 * Hook para buscar DNI
 */
export function useDniSearch(
  dniNumber: string,
  options?: Omit<UseQueryOptions<{
    first_name: string;
    first_last_name: string;
    second_last_name: string;
    full_name: string;
    document_number: string;
    phone?: string;
  }>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.dni(dniNumber),
    queryFn: () => apiService.searchDni(dniNumber),
    enabled: dniNumber.length === 8, // Solo ejecutar si el DNI tiene 8 dígitos
    ...options,
  });
}

// ============= Mutations =============

/**
 * Hook para verificar dispositivo
 */
export function useCheckDevice(
  options?: UseMutationOptions<
    DeviceApiResponse,
    Error,
    { code: string; serviceId: string; productNumber?: string }
  >
) {
  return useMutation({
    mutationFn: ({ code, serviceId, productNumber }) =>
      apiService.checkDevice(code, serviceId, productNumber),
    ...options,
  });
}

/**
 * Hook para generar/preview de PDF de factura de prueba
 */
export function useInvoiceTestPdfPreview(
  options?: UseMutationOptions<Blob, Error, unknown>
) {
  return useMutation({
    mutationFn: (invoiceBody: unknown) => apiService.getInvoiceTestPdfPreview(invoiceBody),
    ...options,
  });
}

/**
 * Hook para obtener las facturas de un cliente (activado solo cuando el modal está abierto)
 */
export function useCustomerInvoices(
  customerId: number | null,
  options?: Omit<UseQueryOptions<CustomerInvoice[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.customerInvoices(customerId ?? 0),
    queryFn: () => apiService.getCustomerInvoices(customerId!),
    enabled: customerId !== null,
    ...options,
  });
}

/**
 * Hook para regenerar y abrir el PDF de una factura existente
 */
export function useOpenInvoicePdf(
  options?: UseMutationOptions<Blob, Error, number>
) {
  return useMutation({
    mutationFn: (invoiceId: number) => apiService.getInvoicePdf(invoiceId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    ...options,
  });
}

/**
 * Hook para cambiar el estado de múltiples items a "sold"
 */
export function useBulkToggleSoldItems(
  options?: UseMutationOptions<void, Error, number[]>
) {
  return useMutation({
    mutationFn: (itemIds: number[]) => apiService.bulkToggleSoldItems(itemIds),
    ...options,
  });
}

export function useCreateProduct(
  options?: UseMutationOptions<CreateProductResponse, Error, CreateProductRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (payload: CreateProductRequest) => apiService.createProduct(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      ]);

      if (options?.onSuccess) {
        await options.onSuccess(data, variables, onMutateResult, context);
      }
    },
  });
}

// ============= Orders (Kanban Board) =============

// Añadir query key
export const orderQueryKey = ["orders"] as const;

async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/api/orders/`);
  if (!response.ok) throw new Error("Error al obtener pedidos");
  return response.json();
}

async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await fetch(`${API_URL}/api/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || err?.error || "Error al crear pedido");
  }
  return response.json();
}

async function updateOrderPhase(orderId: string, phase: KanbanPhase): Promise<Order> {
  const response = await fetch(`${API_URL}/api/orders/${orderId}/phase`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phase }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || err?.error || "Error al actualizar fase");
  }
  return response.json();
}

async function deleteOrder(orderId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || err?.error || "Error al eliminar pedido");
  }
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: orderQueryKey,
    queryFn: getOrders,
    refetchInterval: 30_000, // sync compartido cada 30s
    staleTime: 10_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, CreateOrderPayload>({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKey });
    },
  });
}

export function useUpdateOrderPhase() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { orderId: string; phase: KanbanPhase }>({
    mutationFn: ({ orderId, phase }) => updateOrderPhase(orderId, phase),
    onMutate: async ({ orderId, phase }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: orderQueryKey });
      const previous = queryClient.getQueryData<Order[]>(orderQueryKey);
      queryClient.setQueryData<Order[]>(orderQueryKey, (old) =>
        old ? old.map((o) => (o.id === orderId ? { ...o, phase } : o)) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous?: Order[] } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(orderQueryKey, ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKey });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteOrder,
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: orderQueryKey });
      const previous = queryClient.getQueryData<Order[]>(orderQueryKey);
      queryClient.setQueryData<Order[]>(orderQueryKey, (old) =>
        old ? old.filter((o) => o.id !== orderId) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous?: Order[] } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(orderQueryKey, ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKey });
    },
  });
}

// Exportar también el servicio original por si se necesita
export { apiService as IMEIAPIService };

// ============= Historial (Quantum) =============

export function useHistorialInvoices(
  options?: Omit<UseQueryOptions<HistorialInvoice[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.historial,
    queryFn: () => apiService.getHistorialInvoices(),
    staleTime: 30_000,
    ...options,
  });
}

// Servicio con TanStack Query para llamadas a API

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { API_URL } from "../utils/constants";
import type { Product, CreateProductRequest, CreateProductResponse } from "../types/productsType";
import type { LastOrderInfo, ServiceResponse, DeviceApiResponse } from "../types";
import type { Product as HierarchicalProduct, ProductHierarchyResponse } from "../types/mockProductsType";
import { supabase } from "../lib/supabase";

// ============= Query Keys =============
export const queryKeys = {
  balance: ["balance"] as const,
  products: ["products"] as const,
  inventory: (category?: string) => ["inventory", category] as const,
  services: ["services"] as const,
  lastOrder: ["lastOrder"] as const,
  dni: (dniNumber: string) => ["dni", dniNumber] as const,
};

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

// Exportar también el servicio original por si se necesita
export { apiService as IMEIAPIService };

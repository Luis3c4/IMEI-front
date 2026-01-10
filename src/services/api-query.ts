// Servicio con TanStack Query para llamadas a API

import { useQuery, useMutation, type UseQueryOptions,type UseMutationOptions } from "@tanstack/react-query";
import { API_BASE } from "../utils/constants";
import type { Product } from "../types/productsType";
import type { Stats, LastOrderInfo, ServiceResponse, DeviceApiResponse } from "../types";

// ============= Query Keys =============
export const queryKeys = {
  stats: ["stats"] as const,
  balance: ["balance"] as const,
  products: ["products"] as const,
  services: ["services"] as const,
  lastOrder: ["lastOrder"] as const,
  dni: (dniNumber: string) => ["dni", dniNumber] as const,
};

// ============= Funciones de Fetch =============
class ApiServiceClass {
  async checkDevice(
    code: string,
    serviceId: string
  ): Promise<DeviceApiResponse> {
    const response = await fetch(`${API_BASE}/api/devices/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input_value: code,
        service_id: serviceId,
        formato: "beta",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al consultar el dispositivo");
    }

    return response.json();
  }

  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE}/api/sheets/stats`);
    if (!response.ok) throw new Error("Error al cargar estadísticas");
    return response.json();
  }

  async getBalance(): Promise<number | null> {
    try {
      const response = await fetch(`${API_BASE}/api/devices/balance`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.balance ?? null;
    } catch {
      return null;
    }
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/api/products`);

    if (!response.ok) {
      throw new Error("Error al cargar productos");
    }

    const payload = await response.json();

    if (!payload?.success || !Array.isArray(payload?.data)) {
      throw new Error(payload?.error || "Error al cargar productos");
    }

    if (payload.data.length === 0) {
      throw new Error("No se encontraron productos");
    }

    return payload.data as Product[];
  }

  async getServices(): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/devices/services`);
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
      const response = await fetch(`${API_BASE}/api/devices/last-order`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  async getInvoiceTestPdfPreview(invoiceBody: unknown): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/invoices/generate/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceBody),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "Error al generar el PDF");
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
    const response = await fetch(`${API_BASE}/api/reniec/dni?numero=${dniNumber}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al consultar el DNI");
    }

    return response.json();
  }

  async bulkToggleSoldItems(itemIds: number[]): Promise<void> {
    const response = await fetch(`${API_BASE}/api/products/items/bulk-toggle-sold`, {
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
 * Hook para obtener estadísticas
 */
export function useStats(options?: Omit<UseQueryOptions<Stats>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => apiService.getStats(),
    ...options,
  });
}

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
    { code: string; serviceId: string }
  >
) {
  return useMutation({
    mutationFn: ({ code, serviceId }) => apiService.checkDevice(code, serviceId),
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

// Exportar también el servicio original por si se necesita
export { apiService as IMEIAPIService };

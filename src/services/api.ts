// Servicio centralizado para llamadas a API

import { API_BASE } from "../utils/constants";
import type { Product } from "../data/products";
import type { DeviceInfo, Stats, Service, LastOrderInfo } from "../types";
import type { ProductAPIResponse } from "@/schemas/apiResponseType";

class IMEIAPIServiceClass {
  async checkDevice(
    code: string,
    serviceId: string
  ): Promise<DeviceInfo> {
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

    if (payload?.success === false) {
      throw new Error(payload?.error || "Error al cargar productos");
    }

    const rawProducts = Array.isArray(payload?.data) ? payload.data : [];

    return rawProducts.map((item: ProductAPIResponse) => ({
      id: item.id?.toString() ?? "",
      name: item.name ?? "Producto",
      product_number: item.product_number ?? "",
      serial_number: item.serial_number ?? "",
      item_price: Number(item.item_price ?? 0),
      quantity: item.quantity,
      category: item.category ?? "Sin categoría",
    })) as Product[];
  }

  async getServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE}/api/devices/services`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
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

  // Generar/preview de PDF de factura de prueba
  async getInvoiceTestPdfPreview(): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/invoices/test/pdf?preview=true`, {
      method: "GET",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      // Si devuelve JSON con error
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
}

export const IMEIAPIService = new IMEIAPIServiceClass();

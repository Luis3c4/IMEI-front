// Servicio centralizado para llamadas a API

import { API_BASE } from "../utils/constants";
import type { DeviceInfo, Stats, Service, LastOrderInfo } from "../types";

export class IMEIAPIService {
  static async checkDevice(
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

  static async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE}/api/sheets/stats`);
    if (!response.ok) throw new Error("Error al cargar estadísticas");
    return response.json();
  }

  static async getBalance(): Promise<number | null> {
    try {
      const response = await fetch(`${API_BASE}/api/devices/balance`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.balance ?? null;
    } catch {
      return null;
    }
  }

  static async getServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE}/api/devices/services`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async getLastOrder(): Promise<LastOrderInfo | null> {
    try {
      const response = await fetch(`${API_BASE}/api/devices/last-order`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
}

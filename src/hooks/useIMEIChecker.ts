// Hook personalizado para la lógica del verificador IMEI

import { useState } from "react";
import type { DeviceInfo } from "../types";
import { IMEIAPIService } from "../services/api";

export function useIMEIChecker(onShowToast: (message: string, type: string) => void) {
  const [serviceId, setServiceId] = useState("17");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDevice = async (code: string) => {
    if (!code.trim()) {
      setError("Por favor ingresa un código válido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const deviceInfo = await IMEIAPIService.checkDevice(code, serviceId);
      setResult(deviceInfo);
      onShowToast("✅ Dispositivo encontrado", "success");
    } catch (err: any) {
      const errorMessage =
        err.message || "Error al verificar el dispositivo";
      setError(errorMessage);
      onShowToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setInputValue("");
    setError(null);
  };

  return {
    serviceId,
    setServiceId,
    inputValue,
    setInputValue,
    loading,
    result,
    error,
    checkDevice,
    clearResult,
  };
}

// Hook personalizado para la lógica del verificador IMEI

import { useState } from "react";
import type { DeviceInfo } from "../types";
import { useCheckDevice } from "../services/api-query";

export function useIMEIChecker(onShowToast: (message: string, type: string) => void) {
  const [serviceId, setServiceId] = useState("17");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: runCheckDevice, isPending: loading } = useCheckDevice({
    onSuccess: (deviceInfo) => {
      setResult(deviceInfo);
      onShowToast("Dispositivo encontrado", "success");
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Error al verificar el dispositivo";
      setError(errorMessage);
      onShowToast(errorMessage, "error");
    },
  });

  const checkDevice = async (code: string) => {
    if (!code.trim()) {
      setError("Por favor ingresa un código válido");
      return;
    }

    setError(null);
    setResult(null);
    await runCheckDevice({ code, serviceId }).catch(() => {});
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

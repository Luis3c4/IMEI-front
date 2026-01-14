// Constantes de la aplicación

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const TOAST_DURATION = 4000; // 4 segundos

export const BARCODE_VALIDATION = {
  SERIAL_PATTERN: /^S[A-Z0-9]{8,}$/, // Serial que empieza con S
  IMEI_PATTERN: /^\d{15}$/, // IMEI con exactamente 15 dígitos
};

export const DEFAULT_SERVICE_ID = "17";

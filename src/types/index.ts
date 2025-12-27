// Tipos de datos principales de la aplicación

export interface DeviceInfo {
  Demo_Unit: string;
  Estimated_Purchase_Date: string;
  IMEI: string;
  IMEI2: string;
  Loaner_Device: string;
  Locked_Carrier: string;
  MEID: string;
  Model_Description: string;
  Purchase_Country: string;
  Refurbished_Device: string;
  Replaced_Device: string;
  Replacement_Device: string;
  Serial_Number: string;
  "Sim-Lock_Status": string;
  Warranty_Status: string;
  iCloud_Lock: string;
}

export interface Stats {
  total_consultas: number;
  sheet_existe: boolean;
  sheet_url: string;
  ultima_consulta?: string;
}

export interface Service {
  service: string;
  name: string;
  price: string;
}

export interface LastOrderInfo {
  precio: number;
  order_id: string;
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface ScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export interface InfoCardProps {
  label: string;
  value: string | undefined;
  highlight?: "green" | "yellow" | "red";
}

import { DollarSign, Loader2 } from "lucide-react";
import type { Service } from "../types";

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string;
  onServiceChange: (serviceId: string) => void;
  loading: boolean;
  balance: number | null;
}

export default function ServiceSelector({
  services,
  selectedServiceId,
  onServiceChange,
  loading,
  balance,
}: ServiceSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Seleccionar Servicio</h3>
        </div>
        {balance !== null && (
          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            Balance: ${balance}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Cargando servicios...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <button
              key={service.service}
              onClick={() => onServiceChange(service.service)}
              className={`p-3 rounded-lg border-2 transition text-left ${
                selectedServiceId === service.service
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-semibold text-sm">{service.name}</div>
              <div
                className={`text-xs mt-1 ${
                  selectedServiceId === service.service
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                ${service.price}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

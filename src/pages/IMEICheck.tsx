import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { ScanBarcode } from "lucide-react";
import Scanner from "../components/Scanner";
import Toast from "../components/Toast";
import InfoCard from "../components/InfoCard";
import type { ToastState, Service } from "../types";
import { TOAST_DURATION } from "../utils/constants";
import {
  useBalance,
  useServices,
} from "../services/api-query";
import { useIMEIChecker } from "../hooks/useIMEIChecker";

export default function IMEICheck() {
  // Estados UI
  const [toast, setToast] = useState<ToastState | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [partNumber, setPartNumber] = useState("");

  // Toast handler
  const showToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), TOAST_DURATION);
  };

  // Datos de la API
  const {
    data: balanceData,
    error: balanceError,
    refetch: refetchBalance,
  } = useBalance({ retry: 1 });

  const {
    data: servicesResponse,
    isLoading: servicesLoading,
    isFetching: servicesFetching,
    error: servicesError,
    refetch: refetchServices,
  } = useServices({ retry: 1 });

  const balance = balanceData ?? null;
  const services: Service[] = servicesResponse?.services ?? [];
  const loadingServices = servicesLoading || servicesFetching;

  const refreshData = () =>
    Promise.all([refetchBalance(), refetchServices()]);

  // Hook personalizado para la lógica IMEI
  const {
    serviceId,
    setServiceId,
    inputValue,
    setInputValue,
    loading: isChecking,
    result,
    error,
    checkDevice,
    clearResult,
  } = useIMEIChecker(showToast, refreshData);

  // Bloquear scroll cuando el scanner está abierto
  useEffect(() => {
    if (scannerOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [scannerOpen]);

  useEffect(() => {
    if (balanceError || servicesError) {
      showToast("Error al cargar datos", "error");
    }
  }, [balanceError, servicesError]);

  useEffect(() => {
    if (services.length > 0 && !services.some((svc) => svc.service === serviceId)) {
      setServiceId(services[0].service);
    }
  }, [services, serviceId]);

  const handleConsultar = async () => {
    await checkDevice(inputValue, partNumber);
  };

  const handleNuevaConsulta = () => {
    clearResult();
    setPartNumber("");
  };

  const handleScan = (value: string) => {
    setInputValue(value.toUpperCase());
    setScannerOpen(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50">
      <Toast toast={toast} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Balance Bar */}
        {balance !== null && (
          <div className="bg-linear-to-r from-green-600 to-blue-600 text-white rounded-lg shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={32} />
                <div>
                  <p className="text-sm font-medium opacity-90">
                    Balance DHRU Fusion
                  </p>
                  <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🔍 Consultar Dispositivo
              </h2>

              <div className="space-y-4">
                {/* Select de Servicios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicio DHRU
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    disabled={loadingServices}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  >
                    {loadingServices ? (
                      <option>Cargando servicios...</option>
                    ) : services.length > 0 ? (
                      services.map((svc) => (
                        <option key={svc.service} value={svc.service}>
                          {svc.name} (${svc.price})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="0">
                          APPLE SOLD BY & COVERAGE ($3.00)
                        </option>
                        <option value="1">SAMSUNG INFO - PRO ($0.07)</option>
                        <option value="3">iCLOUD ON/OFF ($0.01)</option>
                        <option value="30">APPLE GSX REPORT ($0.05)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Input IMEI/Serial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number o IMEI
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleConsultar()}
                    placeholder="Ej: MC7M6JRDQ7"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                  />
                </div>

                  {/* Input Part Number (Opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Part Number <span className="text-xs text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleConsultar()}
                      placeholder="Ingrese part number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                    />
                  </div>

                {/* Recordatorio para productos Apple */}
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Nota:</span> Para dispositivos <span className="font-semibold">MACBOOKS</span>, coloca el <span className="font-semibold">PART NUMBER</span> para precisión en la consulta.
                  </p>
                </div>

                {/* Botón Consultar */}
                <button
                  onClick={handleConsultar}
                  disabled={isChecking || !inputValue}
                  className="w-full bg-linear-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Consultar
                    </>
                  )}
                </button>

                {/* Botón Scanner */}
                <button
                  onClick={() => setScannerOpen(true)}
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  <ScanBarcode size={20} />
                  Abrir Scanner
                </button>

                {/* Botón Nueva Consulta */}
                {result && (
                  <button
                    onClick={handleNuevaConsulta}
                    className="w-full border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Nueva Consulta
                  </button>
                )}
              </div>

              {/* Info Cards */}
              <div className="mt-6 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    💡 Powered by DHRU Fusion API - Datos en tiempo real
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resultados */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 min-h-150">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📊 Resultados
              </h2>

              {/* Estado Vacío */}
              {!isChecking && !result && !error && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <Search size={64} className="mb-4 opacity-50" />
                  <p className="text-lg">No hay consultas realizadas aún</p>
                  <p className="text-sm mt-2">
                    Ingresa un Serial Number o IMEI para comenzar
                  </p>
                </div>
              )}

              {/* Estado Loading */}
              {isChecking && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2
                    className="animate-spin text-green-600 mb-4"
                    size={48}
                  />
                  <p className="text-lg font-medium text-gray-700">
                    Consultando en DHRU Fusion...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Esto puede tardar 20-30 segundos
                  </p>
                  <div className="mt-4 w-64 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full animate-pulse"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Estado Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-600 shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Error en la consulta
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Resultado Exitoso */}
              {result && (
                <div className="space-y-6">
                  {/* Header del Resultado */}
                  <div className="bg-linear-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">
                          {result.Model_Description ||
                            "Información del Dispositivo"}
                        </h3>
                        <p className="text-green-100 text-sm">
                          {result.Purchase_Country &&
                            `Comprado en: ${result.Purchase_Country}`}
                        </p>
                        <p className="text-green-100 text-xs mt-1">
                          {new Date().toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Información */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      label="Serial Number"
                      value={result.Serial_Number}
                    />
                    <InfoCard label="IMEI" value={result.IMEI} />
                    <InfoCard label="IMEI2" value={result.IMEI2 || "N/A"} />
                    <InfoCard label="MEID" value={result.MEID} />
                    <InfoCard
                      label="Warranty Status"
                      value={result.Warranty_Status}
                    />
                    <InfoCard
                      label="Purchase Date"
                      value={result.Estimated_Purchase_Date}
                    />
                    <InfoCard
                      label="Sim-Lock Status"
                      value={result["Sim-Lock_Status"]}
                      highlight={
                        result["Sim-Lock_Status"] === "Unlocked"
                          ? "green"
                          : "red"
                      }
                    />
                    <InfoCard
                      label="Locked Carrier"
                      value={result.Locked_Carrier}
                    />
                    <InfoCard
                      label="iCloud Lock"
                      value={result.iCloud_Lock}
                      highlight={result.iCloud_Lock === "OFF" ? "green" : "red"}
                    />
                    <InfoCard label="Demo Unit" value={result.Demo_Unit} />
                    <InfoCard
                      label="Loaner Device"
                      value={result.Loaner_Device}
                    />
                    <InfoCard
                      label="Refurbished"
                      value={result.Refurbished_Device}
                    />
                    <InfoCard
                      label="Replaced Device"
                      value={result.Replaced_Device}
                    />
                    <InfoCard
                      label="Replacement Device"
                      value={result.Replacement_Device}
                    />
                  </div>

                  {/* Botones de Acción */}
                  <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleNuevaConsulta}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Nueva Consulta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center overflow-hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-sm mx-4 sm:mx-0 max-h-[90vh] sm:max-h-[95vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-semibold text-center flex-1">
                📷 Escanear código
              </h3>
              <button
                onClick={() => setScannerOpen(false)}
                className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg shrink-0"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <Scanner
                onScan={handleScan}
                onClose={() => setScannerOpen(false)}
              />
            </div>

            <button
              onClick={() => setScannerOpen(false)}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition shrink-0"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

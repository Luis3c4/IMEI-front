import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sheet,
  DollarSign,
} from "lucide-react";
import { ScanBarcode } from "lucide-react";
import Scanner from "../components/Scanner";
import Toast from "../components/Toast";
import InfoCard from "../components/InfoCard";
import { IMEIAPIService } from "../services/api";
import type { ToastState, DeviceInfo, Stats, Service } from "../types";
import { TOAST_DURATION } from "../utils/constants";

export default function IMEICheck() {
  // Estados principales
  const [serviceId, setServiceId] = useState("17");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Estados de datos globales
  const [stats, setStats] = useState<Stats>({
    total_consultas: 0,
    sheet_existe: false,
    sheet_url: "",
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bloquear scroll cuando el scanner está abierto
  useEffect(() => {
    if (scannerOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [scannerOpen]);

  const showToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), TOAST_DURATION);
  };

  const loadInitialData = async () => {
    try {
      setLoadingServices(true);
      const [statsData, balanceData, servicesData] = await Promise.all([
        IMEIAPIService.getStats(),
        IMEIAPIService.getBalance(),
        IMEIAPIService.getServices(),
      ]);

      setStats(statsData);
      setBalance(balanceData);
      setServices(servicesData);
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      showToast("Error al cargar datos", "error");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleConsultar = async () => {
    if (!inputValue.trim()) {
      setError("Por favor ingresa un Serial Number o IMEI");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const deviceInfo = await IMEIAPIService.checkDevice(
        inputValue,
        serviceId
      );
      setResult(deviceInfo);
      setInputValue("");
      showToast("✅ Dispositivo encontrado", "success");

      // Recargar datos después de consulta
      await loadInitialData();
    } catch (err) {
      const errorMessage =
        (err as Error)?.message || "Error al verificar el dispositivo";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirSheet = () => {
    if (stats.sheet_url) {
      window.open(stats.sheet_url, "_blank");
      showToast("📊 Abriendo Google Sheet...", "success");
    }
  };

  const handleNuevaConsulta = () => {
    setInputValue("");
    setResult(null);
    setError(null);
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

        {/* Google Sheets Stats Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Sheet className="text-green-600" size={40} />
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Google Sheets - Actualización en tiempo real
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total de registros:{" "}
                  <span className="font-semibold text-green-600">
                    {stats.total_consultas}
                  </span>
                  {stats.ultima_consulta &&
                    ` • Última: ${new Date(
                      stats.ultima_consulta
                    ).toLocaleString("es-ES", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleAbrirSheet}
              disabled={!stats.sheet_existe}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
            >
              <ExternalLink size={18} />
              Abrir en Google Sheets
            </button>
          </div>
        </div>

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
                    onKeyPress={(e) => e.key === "Enter" && handleConsultar()}
                    placeholder="Ej: MC7M6JRDQ7"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                  />
                </div>

                {/* Botón Consultar */}
                <button
                  onClick={handleConsultar}
                  disabled={loading || !inputValue}
                  className="w-full bg-linear-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
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
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <Sheet
                      className="text-green-600 shrink-0 mt-0.5"
                      size={16}
                    />
                    <div>
                      <p className="text-xs font-semibold text-green-900">
                        Guardado automático en Google Sheets
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Historial completo con 21 campos de información
                      </p>
                    </div>
                  </div>
                </div>
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
              {!loading && !result && !error && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <Search size={64} className="mb-4 opacity-50" />
                  <p className="text-lg">No hay consultas realizadas aún</p>
                  <p className="text-sm mt-2">
                    Ingresa un Serial Number o IMEI para comenzar
                  </p>
                  {stats.total_consultas > 0 && (
                    <div className="mt-6 text-center">
                      <p className="text-sm text-green-600 font-medium mb-2">
                        📊 Tienes {stats.total_consultas} consultas en Google
                        Sheets
                      </p>
                      <button
                        onClick={handleAbrirSheet}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Ver historial completo →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Estado Loading */}
              {loading && (
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
                      <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-center shrink-0">
                        <Sheet className="mx-auto mb-1" size={24} />
                        <p className="text-xs text-green-100">Guardado</p>
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
                      onClick={handleAbrirSheet}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sheet size={20} />
                      Ver en Google Sheets
                    </button>
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

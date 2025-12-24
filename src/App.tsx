import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sheet,
  DollarSign,
} from "lucide-react";
import { ScanBarcode } from "lucide-react";
import Scanner from "./components/Scanner";

// CONFIGURAR ESTAS VARIABLES
const API_BASE = "http://localhost:5000"; // Cambiar a tu URL de Render en producción

// Interfaces para tipado
interface Stats {
  total_consultas: number;
  sheet_existe: boolean;
  sheet_url: string;
  ultima_consulta?: string;
}

interface DeviceInfo {
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

interface InfoCardProps {
  label: string;
  value: string | undefined;
  highlight?: "green" | "yellow" | "red";
}

interface Service {
  service: string;
  name: string;
  price: string;
}

export default function IMEIChecker() {
  const [serviceId, setServiceId] = useState("17");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );
  const [scannerOpen, setScannerOpen] = useState(false);

  const [stats, setStats] = useState<Stats>({
    total_consultas: 0,
    sheet_existe: false,
    sheet_url: "",
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [lastOrderInfo, setLastOrderInfo] = useState<{
    precio: number;
    order_id: string;
  } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
    cargarBalance();
    cargarServicios();
  }, []);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sheet-stats`);
      const data: Stats = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };
  const cargarBalance = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Error al cargar balance:", err);
    }
  };
  // Cargar servicios disponibles
  const cargarServicios = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch(`${API_BASE}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error("Error al cargar servicios:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleConsultar = async () => {
    if (!inputValue) {
      setError("Por favor ingresa un Serial Number o IMEI");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLastOrderInfo(null);

    try {
      const response = await fetch(`${API_BASE}/api/consultar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          input_value: inputValue,
          formato: "beta",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);

        // Guardar info de la orden
        if (data.precio && data.order_id) {
          setLastOrderInfo({
            precio: data.precio,
            order_id: data.order_id,
          });
        }

        // Actualizar balance
        if (data.balance_restante) {
          setBalance(parseFloat(data.balance_restante));
        }

        cargarEstadisticas();

        if (data.sheet_updated) {
          showToast(
            `Guardado en Google Sheets - Total: ${data.total_registros} registros`,
            "success"
          );
        } else {
          showToast(
            "Consulta exitosa pero no se pudo guardar en Sheets",
            "warning"
          );
        }

        setInputValue("");
      } else {
        setError(data.message || "Error en la consulta");
        showToast(` ${data.message}`, "error");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showToast(` ${err.message}`, "error");
      } else {
        setError("Error desconocido");
        showToast(" Error desconocido", "error");
      }
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

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "warning"
              ? "bg-yellow-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : toast.type === "warning" ? (
            <AlertCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📱 Consultor IMEI/Serial iPhone
          </h1>
          <p className="text-gray-600">
            Consulta información de dispositivos Apple con DHRU Fusion API
          </p>
        </div>

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
              {lastOrderInfo && (
                <div className="text-right">
                  <p className="text-xs opacity-75">Última consulta</p>
                  <p className="font-semibold">-${lastOrderInfo.precio}</p>
                  <p className="text-xs opacity-75">
                    Order #{lastOrderInfo.order_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Sheets Stats Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
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
                {/* Botón Camara */}
                <button
                  onClick={() => setScannerOpen(true)}
                  className="w-full bg-linear-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <ScanBarcode size={20} />
                      Scanner
                    </>
                  )}
                </button>
                {scannerOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-4 w-full max-w-sm mx-4">
                      <h3 className="text-lg font-semibold text-center mb-2">
                        📷 Escanear código
                      </h3>

                      <Scanner
                        onScan={(value) => {
                          setInputValue(value.toUpperCase());
                        }}
                        onClose={() => setScannerOpen(false)}
                      />

                      <button
                        onClick={() => setScannerOpen(false)}
                        className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
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
                    <div className="flex items-start justify-between">
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
                      <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-center">
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
                  <div className="pt-4 border-t flex gap-3">
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
    </div>
  );
}

function InfoCard({ label, value, highlight }: InfoCardProps) {
  const getHighlightClass = () => {
    if (!highlight) return "bg-gray-50 border-gray-200";
    if (highlight === "green") return "bg-green-50 border-green-300";
    if (highlight === "yellow") return "bg-yellow-50 border-yellow-300";
    if (highlight === "red") return "bg-red-50 border-red-300";
  };

  const getTextClass = () => {
    if (!highlight) return "text-gray-900";
    if (highlight === "green") return "text-green-900 font-semibold";
    if (highlight === "yellow") return "text-yellow-900 font-semibold";
    if (highlight === "red") return "text-red-900 font-semibold";
  };

  return (
    <div className={`p-4 rounded-lg border ${getHighlightClass()}`}>
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-lg font-mono ${getTextClass()}`}>{value || "N/A"}</p>
    </div>
  );
}

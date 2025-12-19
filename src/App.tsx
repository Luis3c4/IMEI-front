import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sheet,
} from "lucide-react";

// ⚠️ CONFIGURAR ESTAS VARIABLES
const API_KEY = "i10dJCd36NuUJPn0IXDtppP6pJ4QxceotdojqF957uAJ6LB6ElCCs8ebX0mm";
const API_BASE = "http://localhost:5000"; // Cambiar a tu URL de Render en producción

// Interfaces para tipado
interface Stats {
  total_consultas: number;
  sheet_existe: boolean;
  sheet_url: string;
  ultima_consulta?: string;
}

interface DeviceInfo {
  Model?: string;
  "Serial Number"?: string;
  IMEI?: string;
  "IMEI 2"?: string;
  IMEI2?: string;
  "Warranty Status"?: string;
  "Estimated Purchase Date"?: string;
  Simlock?: string;
  iCloud?: string;
  FMI?: string;
  Activated?: string;
  Carrier?: string;
  "Initial Carrier"?: string;
  "Blacklist Status"?: string;
}

interface ApiResponse {
  success: boolean;
  data?: DeviceInfo;
  message?: string;
  sheet_updated?: boolean;
  total_registros?: number;
}

interface InfoCardProps {
  label: string;
  value: string | undefined;
  highlight?: "green" | "yellow" | "red";
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
  const [stats, setStats] = useState<Stats>({
    total_consultas: 0,
    sheet_existe: false,
    sheet_url: "",
  });

  useEffect(() => {
    cargarEstadisticas();
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

  const handleConsultar = async () => {
    if (!inputValue) {
      setError("Por favor ingresa un Serial Number o IMEI");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/consultar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          service_id: serviceId,
          input_value: inputValue,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setResult(data.data!);
        cargarEstadisticas();

        if (data.sheet_updated) {
          showToast(
            `✅ Guardado en Google Sheets - Total: ${data.total_registros} registros`,
            "success"
          );
        } else {
          showToast(
            "⚠️ Consulta exitosa pero no se pudo guardar en Sheets",
            "warning"
          );
        }

        setInputValue("");
      } else {
        setError(data.message || "Error en la consulta");
        showToast(`❌ ${data.message}`, "error");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showToast(`❌ ${err.message}`, "error");
      } else {
        setError("Error desconocido");
        showToast("❌ Error desconocido", "error");
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
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
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
            Consulta información de dispositivos Apple - Historial en Google
            Sheets
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🔍 Consultar Dispositivo
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicio
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="17">Apple Carrier Check ($0.13)</option>
                    <option value="50">Apple Advanced Check ($0.24)</option>
                    <option value="3">Apple Basic Check ($0.11)</option>
                    <option value="16">Apple SIM-lock Status ($0.10)</option>
                  </select>
                </div>

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
                    placeholder="Ej: FFWZNVKSKXK1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                  />
                </div>

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

                {result && (
                  <button
                    onClick={handleNuevaConsulta}
                    className="w-full border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Nueva Consulta
                  </button>
                )}
              </div>

              {/* Info */}
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
                        Accede desde cualquier dispositivo con tu cuenta de
                        Google
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    💡 El Sheet se actualiza en tiempo real. No necesitas
                    descargar nada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 min-h-150">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📊 Resultados
              </h2>

              {/* Estado vacío */}
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

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2
                    className="animate-spin text-green-600 mb-4"
                    size={48}
                  />
                  <p className="text-lg font-medium text-gray-700">
                    Consultando dispositivo...
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

              {/* Error */}
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

              {/* Resultado */}
              {result && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {/* Header */}
                  <div className="bg-linear-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">
                          {result.Model || "Información del Dispositivo"}
                        </h3>
                        <p className="text-green-100">
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

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      label="Serial Number"
                      value={result["Serial Number"]}
                    />
                    <InfoCard label="IMEI" value={result.IMEI} />
                    <InfoCard
                      label="IMEI2"
                      value={result["IMEI 2"] || result.IMEI2 || "N/A"}
                    />
                    <InfoCard
                      label="Warranty Status"
                      value={result["Warranty Status"]}
                    />
                    <InfoCard
                      label="Purchase Date"
                      value={result["Estimated Purchase Date"]}
                    />
                    <InfoCard
                      label="Simlock"
                      value={result.Simlock}
                      highlight={
                        result.Simlock === "UNLOCKED" ? "green" : "yellow"
                      }
                    />
                    <InfoCard
                      label="iCloud Status"
                      value={result.iCloud}
                      highlight={result.iCloud === "Clean" ? "green" : "red"}
                    />
                    <InfoCard label="FMI" value={result.FMI} />
                    <InfoCard label="Activated" value={result.Activated} />
                    <InfoCard
                      label="Carrier"
                      value={
                        result.Carrier || result["Initial Carrier"] || "N/A"
                      }
                    />
                    <InfoCard
                      label="Blacklist"
                      value={result["Blacklist Status"] || "N/A"}
                    />
                  </div>

                  {/* Actions */}
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

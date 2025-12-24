import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Video } from "lucide-react";
import jsQR from "jsqr";

interface ScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");

  // Cargar cámaras disponibles
  useEffect(() => {
    loadCameras();
  }, []);

  // Iniciar escaneo cuando se selecciona una cámara
  useEffect(() => {
    if (selectedCamera) {
      startCamera(selectedCamera);
    }
    return () => {
      stopCamera();
    };
  }, [selectedCamera]);

  const loadCameras = async () => {
    try {
      // Solicitar permisos primero
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      ) as CameraDevice[];

      console.log("Cámaras disponibles:", videoDevices);
      setCameras(videoDevices);

      // Intentar identificar y seleccionar la cámara 1x por defecto
      const mainCamera = videoDevices.find(
        (cam) =>
          cam.label.toLowerCase().includes("back") ||
          cam.label.toLowerCase().includes("rear") ||
          cam.label.toLowerCase().includes("trasera") ||
          cam.label.toLowerCase().includes("main")
      );

      // Si no encuentra, usar la primera que no sea frontal
      const defaultCamera =
        mainCamera ||
        videoDevices.find(
          (cam) =>
            !cam.label.toLowerCase().includes("front") &&
            !cam.label.toLowerCase().includes("frontal")
        ) ||
        videoDevices[0];

      if (defaultCamera) {
        setSelectedCamera(defaultCamera.deviceId);
      }
    } catch (error) {
      console.error("Error al cargar cámaras:", error);
      alert("No se pudo acceder a las cámaras. Verifica los permisos.");
    }
  };

  const startCamera = async (deviceId: string) => {
    try {
      // Detener cámara anterior si existe
      stopCamera();

      // Configuración para solicitar la mejor calidad
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Obtener capacidades de la cámara
        const videoTrack = stream.getVideoTracks()[0];
        videoTrackRef.current = videoTrack;

        const capabilities = videoTrack.getCapabilities() as any;
        const settings = videoTrack.getSettings() as any;

        console.log("Capacidades de la cámara:", capabilities);
        console.log("Configuración actual:", settings);

        // Configurar zoom
        if (capabilities.zoom) {
          setZoomSupported(true);
          setMinZoom(capabilities.zoom.min);
          setMaxZoom(capabilities.zoom.max);
          setZoomLevel(settings.zoom || capabilities.zoom.min);
        } else {
          setZoomSupported(false);
        }

        // Iniciar escaneo
        setIsScanning(true);
        startScanning();
      }
    } catch (error) {
      console.error("Error al iniciar cámara:", error);
      alert("Error al iniciar la cámara seleccionada.");
    }
  };

  const stopCamera = () => {
    setIsScanning(false);

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    videoTrackRef.current = null;
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      // Ajustar canvas al tamaño del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar frame actual
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Obtener datos de imagen
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Intentar detectar código
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data && code.data !== lastScannedCode) {
        console.log("Código detectado:", code.data);
        setLastScannedCode(code.data);
        setIsScanning(false);
        stopCamera();
        onScan(code.data);
        onClose();
      }
    }, 100); // Escanear cada 100ms
  };

  const applyZoom = async (newZoom: number) => {
    if (!videoTrackRef.current || !zoomSupported) return;

    try {
      const clampedZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));

      await videoTrackRef.current.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any],
      });

      setZoomLevel(clampedZoom);
    } catch (error) {
      console.error("Error al aplicar zoom:", error);
    }
  };

  const handleZoomIn = () => {
    const increment = (maxZoom - minZoom) / 10;
    applyZoom(zoomLevel + increment);
  };

  const handleZoomOut = () => {
    const decrement = (maxZoom - minZoom) / 10;
    applyZoom(zoomLevel - decrement);
  };

  const handleMaxZoom = () => {
    applyZoom(maxZoom);
  };

  const handleResetZoom = () => {
    applyZoom(minZoom);
  };

  const getCameraLabel = (label: string) => {
    // Simplificar etiquetas de cámaras
    if (label.toLowerCase().includes("ultra") || label.includes("0.5")) {
      return "📐 Ultra Wide (0.5x)";
    }
    if (label.toLowerCase().includes("tele") || label.includes("2x")) {
      return "🔭 Telephoto (2x)";
    }
    if (label.toLowerCase().includes("back") || label.toLowerCase().includes("rear")) {
      return "📷 Principal (1x)";
    }
    if (label.toLowerCase().includes("front")) {
      return "🤳 Frontal";
    }
    return `📹 ${label.substring(0, 30)}`;
  };

  return (
    <div className="space-y-4">
      {/* Selector de Cámara */}
      {cameras.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Cámara
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {getCameraLabel(camera.label)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            💡 Para códigos pequeños, selecciona la cámara 2x (Telephoto)
          </p>
        </div>
      )}

      {/* Vista de Video */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay de guía */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-4 border-green-400 rounded-lg"
              style={{ width: "80%", height: "200px" }}
            >
              <div className="w-full h-full border-2 border-dashed border-green-300 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Indicador de estado */}
        {isScanning && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Escaneando...
          </div>
        )}
      </div>

      {/* Información de la cámara actual */}
      {selectedCamera && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Video className="w-4 h-4" />
            <span className="font-medium">
              {getCameraLabel(
                cameras.find((c) => c.deviceId === selectedCamera)?.label || ""
              )}
            </span>
          </div>
        </div>
      )}

      {/* Controles de Zoom */}
      {zoomSupported ? (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Zoom Digital
            </span>
            <span className="text-sm text-gray-600">
              {zoomLevel.toFixed(1)}x / {maxZoom.toFixed(1)}x
            </span>
          </div>

          {/* Slider de Zoom */}
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={(maxZoom - minZoom) / 100}
            value={zoomLevel}
            onChange={(e) => applyZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          {/* Botones de Control */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleResetZoom}
              disabled={zoomLevel <= minZoom}
              className="flex flex-col items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <ZoomOut className="w-4 h-4 mb-1" />
              Reset
            </button>

            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= minZoom}
              className="flex flex-col items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <ZoomOut className="w-4 h-4 mb-1" />
              -
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= maxZoom}
              className="flex flex-col items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <ZoomIn className="w-4 h-4 mb-1" />
              +
            </button>

            <button
              onClick={handleMaxZoom}
              className="flex flex-col items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
            >
              <Maximize2 className="w-4 h-4 mb-1" />
              Max
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-sm text-yellow-800">
            ℹ️ Esta cámara no soporta zoom digital
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            {cameras.length > 1
              ? "Prueba seleccionando la cámara Telephoto (2x)"
              : "Acerca físicamente el dispositivo al código"}
          </p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-800 font-medium text-center">
          💡 Consejos para códigos pequeños:
        </p>
        <ul className="text-xs text-green-700 mt-2 space-y-1">
          <li>• Si tienes múltiples cámaras, usa la 2x (Telephoto)</li>
          <li>• Buena iluminación es esencial</li>
          <li>• Mantén el código perpendicular a la cámara</li>
          <li>• Si no detecta, prueba con zoom máximo</li>
        </ul>
      </div>
    </div>
  );
}
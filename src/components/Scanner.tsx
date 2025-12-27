import { useEffect, useRef, useState } from "react";
import { Camera, ZoomIn, ZoomOut, Maximize2, Video, AlertCircle } from "lucide-react";
import Quagga from "@ericblade/quagga2";

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
  const [error, setError] = useState<string>("");
  const [isHttps, setIsHttps] = useState(true);

  // Verificar HTTPS
  useEffect(() => {
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';
    setIsHttps(isSecure);
    
    if (!isSecure) {
      setError('⚠️ Necesitas HTTPS para acceder a la cámara trasera. En desarrollo usa localhost.');
    }
  }, []);

  // Cargar cámaras disponibles
  useEffect(() => {
    if (isHttps) {
      loadCameras();
    }
  }, [isHttps]);

  // Iniciar escaneo cuando se selecciona una cámara
  useEffect(() => {
    if (selectedCamera && isHttps) {
      startCamera(selectedCamera);
    }
    return () => {
      stopCamera();
    };
  }, [selectedCamera]);

  const loadCameras = async () => {
    try {
      // IMPORTANTE: Primero solicitar permisos básicos
      const tempStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Detener el stream temporal
      tempStream.getTracks().forEach(track => track.stop());

      // Ahora sí, enumerar dispositivos
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      ) as CameraDevice[];

      console.log("Cámaras disponibles:", videoDevices);

      // Filtrar SOLO cámaras traseras (remover frontal)
      const backCameras = videoDevices.filter(cam => {
        const label = cam.label.toLowerCase();
        return (
          label.includes("back") ||
          label.includes("rear") ||
          label.includes("trasera") ||
          label.includes("environment") ||
          label.includes("main")
        ) && !label.includes("front") && !label.includes("user") && !label.includes("frontal");
      });

      console.log("Cámaras traseras filtradas:", backCameras);
      setCameras(backCameras);

      if (backCameras.length === 0) {
        setError(' No se encontraron cámaras traseras. Solo se soportan cámaras traseras.');
        return;
      }

      // Usar la primera cámara trasera
      const defaultCamera = backCameras[0];
      if (defaultCamera) {
        setSelectedCamera(defaultCamera.deviceId);
      }
    } catch (error: any) {
      console.error("Error al cargar cámaras:", error);
      if (error.name === 'NotAllowedError') {
        setError('Permisos de cámara denegados. Por favor, permite el acceso en la configuración del navegador.');
      } else if (error.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en el dispositivo.');
      } else if (error.name === 'NotReadableError') {
        setError('La cámara está siendo usada por otra aplicación.');
      } else {
        setError(`Error al acceder a la cámara: ${error.message}`);
      }
    }
  };

  const startCamera = async (deviceId: string) => {
    try {
      setError('');
      stopCamera();
      
      // Pequeño delay para asegurar que todo se limpia
      await new Promise(resolve => setTimeout(resolve, 200));

      // Configuración flexible para móviles
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { ideal: deviceId } : undefined,
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false
      };

      console.log('Intentando abrir cámara con:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperar a que el video esté listo
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
        
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
          setMinZoom(capabilities.zoom.min || 1);
          setMaxZoom(capabilities.zoom.max || 1);
          setZoomLevel(settings.zoom || capabilities.zoom.min || 1);
        } else {
          setZoomSupported(false);
        }

        // Iniciar escaneo
        setIsScanning(true);
        startScanning();
      }
    } catch (error: any) {
      console.error("Error al iniciar cámara:", error);
      
      if (error.name === 'NotAllowedError') {
        setError('Permisos denegados. Permite el acceso a la cámara en la configuración.');
      } else if (error.name === 'NotFoundError') {
        setError('Cámara no encontrada. Verifica que tu dispositivo tenga cámara trasera.');
      } else if (error.name === 'NotReadableError') {
        setError('La cámara está en uso. Cierra otras apps que usen la cámara y reintenta cambiar de cámara.');
      } else if (error.name === 'OverconstrainedError') {
        setError('No se pudo aplicar la configuración. Reintentando con configuración básica...');
        tryBasicCamera();
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  // Fallback con configuración mínima
  const tryBasicCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        startScanning();
        setError('');
      }
    } catch (err) {
      console.error('Falló también la configuración básica:', err);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Detener streams de cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    videoTrackRef.current = null;

    // Detener Quagga después de detener streams
    try {
      Quagga.stop();
    } catch (err) {
      // Ignorar errores si Quagga no está iniciado
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    startBarcodeScanning();
  };

  const startBarcodeScanning = () => {
    try {
      // Detener Quagga si está corriendo
      try {
        Quagga.stop();
      } catch (e) {
        // Ignorar si no está iniciado
      }

      // Pequeño delay para asegurar que Quagga se detiene completamente
      setTimeout(() => {
        Quagga.init(
          {
            inputStream: {
              type: "LiveStream",
              target: videoRef.current as any,
              constraints: {
                width: { min: 320, ideal: 1280 },
                height: { min: 240, ideal: 720 },
                facingMode: "environment",
                deviceId: selectedCamera ? { ideal: selectedCamera } : undefined,
              },
            },
            decoder: {
              readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_93_reader",
                "upc_reader",
                "upc_e_reader",
              ],
            },
            frequency: 10,
            multiple: false,
          } as any,
          (err: any) => {
            if (err) {
              console.error("Error inicializando Quagga:", err);
              setError("Error al inicializar escáner de códigos de barras. Intenta con otra cámara.");
              return;
            }
            Quagga.start();

            Quagga.onDetected((result: any) => {
              if (result.codeResult && result.codeResult.code) {
                const barcode = result.codeResult.code;
                // Filtrar: Serial Number (S + alfanumérico) o IMEI (15 dígitos)
                const isValidSerial = /^S[A-Z0-9]{8,}$/.test(barcode); // Serial que empieza con S
                const isValidIMEI = /^\d{15}$/.test(barcode); // IMEI con exactamente 15 dígitos
                if ((isValidSerial || isValidIMEI) && barcode !== lastScannedCode) {
                  console.log("Código de barras detectado:", barcode, isValidSerial ? "(Serial Number)" : "(IMEI)");
                  setLastScannedCode(barcode);
                  setIsScanning(false);
                  Quagga.stop();
                  stopCamera();
                  onScan(barcode);
                  onClose();
                } else if(barcode !== lastScannedCode) {
                  console.log("Código detectado pero no válido:", barcode);
                }
              }
            });
          }
        );
      }, 100);
    } catch (error: any) {
      console.error("Error en scanning de código de barras:", error);
      setError(`Error: ${error.message}`);
    }
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
    const increment = Math.max(0.1, (maxZoom - minZoom) / 10);
    applyZoom(zoomLevel + increment);
  };

  const handleZoomOut = () => {
    const decrement = Math.max(0.1, (maxZoom - minZoom) / 10);
    applyZoom(zoomLevel - decrement);
  };

  const handleMaxZoom = () => {
    applyZoom(maxZoom);
  };

  const handleResetZoom = () => {
    applyZoom(minZoom);
  };

  const getCameraLabel = (label: string) => {
    if (label.toLowerCase().includes("ultra") || label.includes("0.5")) {
      return "Ultra Wide (0.5x)";
    }
    if (label.toLowerCase().includes("tele") || label.includes("2x") || label.includes("telephoto")) {
      return "Telephoto (2x)";
    }
    if (label.toLowerCase().includes("back") || label.toLowerCase().includes("rear") || label.toLowerCase().includes("environment")) {
      return "📷 Principal (1x)";
    }
    if (label.toLowerCase().includes("front") || label.toLowerCase().includes("user")) {
      return "Frontal";
    }
    return `Cámara ${label.substring(0, 20)}`;
  };

  return (
    <div className="space-y-4">
      {/* Mensaje de Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

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
        </div>
      )}

      {/* Vista de Video */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
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
              style={{ width: "85%", height: "60%" }}
            >
              <div className="w-full h-full border-2 border-dashed border-green-300 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Indicador de estado */}
        {isScanning && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Leyendo código de barras...
          </div>
        )}

        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Iniciando cámara...</p>
            </div>
          </div>
        )}
      </div>

      {/* Información de la cámara actual */}
      {selectedCamera && isScanning && (
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
      {zoomSupported && isScanning && (
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
            step={0.1}
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
      )}
    </div>
  );
}
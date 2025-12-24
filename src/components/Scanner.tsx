import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Camera } from "lucide-react";

interface ScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const isScanningRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        // Primero obtener las cámaras disponibles
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error("No se encontraron cámaras");
        }

        // Buscar cámara trasera o usar la primera disponible
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('trasera')
        );
        const cameraId = backCamera?.id || devices[0].id;

        // Iniciar el escáner
        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 340, height: 250 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            if (!isScanningRef.current) return;

            isScanningRef.current = false;
            console.log("Código detectado:", decodedText);
            onScan(decodedText);

            try {
              await scanner.stop();
            } catch (err) {
              console.warn("Scanner ya estaba detenido", err);
            }
            
            onClose();
          },
          (errorMessage) => {
            // Errores de escaneo (normal cuando no hay código visible)
            console.debug(errorMessage);
          }
        );

        isScanningRef.current = true;
        setIsReady(true);

        // Obtener el video element y sus capacidades de zoom
        setTimeout(async () => {
          const videoElement = document.querySelector('#reader video') as HTMLVideoElement;
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const videoTrack = stream.getVideoTracks()[0];
            videoTrackRef.current = videoTrack;

            const capabilities = videoTrack.getCapabilities() as any;
            
            if (capabilities && capabilities.zoom) {
              setZoomSupported(true);
              setMinZoom(capabilities.zoom.min);
              setMaxZoom(capabilities.zoom.max);
              setZoomLevel(capabilities.zoom.min);
              console.log('Zoom disponible:', capabilities.zoom);
            } else {
              console.log('Zoom no soportado en esta cámara');
            }
          }
        }, 1000);

      } catch (err) {
        console.error("Error iniciando scanner:", err);
        alert("Error al iniciar la cámara. Verifica los permisos.");
        onClose();
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current
          .stop()
          .catch(() => console.warn("Scanner ya detenido"));
      }
    };
  }, [onScan, onClose]);

  const applyZoom = async (newZoom: number) => {
    if (!videoTrackRef.current || !zoomSupported) {
      console.log('Zoom no disponible');
      return;
    }

    try {
      const clampedZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
      
      await videoTrackRef.current.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any]
      });
      
      setZoomLevel(clampedZoom);
      console.log('Zoom aplicado:', clampedZoom);
    } catch (error) {
      console.error('Error al aplicar zoom:', error);
    }
  };

  const handleZoomIn = () => {
    const increment = (maxZoom - minZoom) / 10; // 10% del rango
    applyZoom(zoomLevel + increment);
  };                          

  const handleZoomOut = () => {
    const decrement = (maxZoom - minZoom) / 10; // 10% del rango
    applyZoom(zoomLevel - decrement);
  };

  const handleMaxZoom = () => {
    applyZoom(maxZoom);
  };

  const handleResetZoom = () => {
    applyZoom(minZoom);
  };

  return (
    <div className="space-y-4">
      {/* Área del Scanner */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <div id="reader" className="w-full" />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
              <p>Iniciando cámara...</p>
            </div>
          </div>
        )}

        {isReady && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              📷 Escaneando...
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 text-center">
          💡 Posiciona el código de barras frente a la cámara
        </p>
      </div>

      {/* Controles de Zoom */}
      {zoomSupported ? (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Control de Zoom
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

          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-xs text-yellow-800 text-center">
              ⚡ Para códigos pequeños: usa Zoom Max y acerca la caja lentamente
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            ℹ️ Esta cámara no soporta zoom digital
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Acerca físicamente el dispositivo al código de barras
          </p>
        </div>
      )}
    </div>
  );
}
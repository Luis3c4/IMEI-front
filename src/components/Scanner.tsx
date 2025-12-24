import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface ScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}
export default function Scanner({ onScan, onClose }: ScannerProps) {
  const isScanningRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 350, height: 100 } },
          async (decodedText) => {
            if (!isScanningRef.current) return;

            isScanningRef.current = false;
            console.log("IMEI detectado:", decodedText);

            try {
              await scanner.stop();
            } catch (err) {
              console.warn("Scanner ya estaba detenido", err);
            }
          },
          (errorMessage) => {
            console.debug(errorMessage);
          }
        );
        isScanningRef.current = true;
      } catch (err) {
        console.error("Error iniciando scanner", err);
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

  return <div id="reader" style={{ width: "100%" }} />;
}

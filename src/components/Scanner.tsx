import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface ScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const hasScannedRef = useRef(false);
  const isRunningRef = useRef(false);
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
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;
            console.log("IMEI detectado:", decodedText);

            if (isRunningRef.current) {
              isRunningRef.current = false;
              await scanner.stop().catch(() => {});
            }

            onScan(decodedText);
            onClose();
          },
          () => {}
        );

        isRunningRef.current = true;
      } catch (err) {
        console.error("Error iniciando scanner", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        isRunningRef.current = false;
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan, onClose]);

  return <div id="reader" style={{ width: "100%" }} />;
}

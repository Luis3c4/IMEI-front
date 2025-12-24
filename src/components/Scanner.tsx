import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";

interface ScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}
export default function Scanner({ onScan, onClose }: ScannerProps) {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop();
            onClose();
          },
          (errorMessage) => {
            console.debug(errorMessage);
          }
        );
      } catch (err) {
        console.error("Error iniciando scanner", err);
      }
    };

    startScanner();

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan, onClose]);

  return <div id="reader" style={{ width: "100%" }} />;
}

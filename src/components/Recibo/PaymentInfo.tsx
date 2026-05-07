import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { useTransferOCR } from "@/services/api-query";

export interface PaymentData {
    departamento: string;
    provincia: string;
    agencia: string;
    banco: string;
    total: string;
    titular: string;
    numero_operacion: string;
    fecha_transferencia: string;
}

interface PaymentInfoProps {
    data: PaymentData;
    onChange: (data: PaymentData) => void;
}

export const PaymentInfo = ({ data, onChange }: PaymentInfoProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync: scanTransfer, isPending: isScanning } = useTransferOCR();

    // Establecer agencia por defecto a "OFICINA" si está vacía
    useEffect(() => {
        if (!data.agencia) {
            onChange({ ...data, agencia: "OFICINA" });
        }
    }, []);

    const handleChange = (key: keyof PaymentData, value: string) => {
        onChange({ ...data, [key]: key !== "total" ? value.toUpperCase() : value });
    };

    const handleScanClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset para permitir seleccionar el mismo archivo dos veces
        e.target.value = "";

        try {
            const result = await scanTransfer(file);
            if (result.success && result.data) {
                const { monto, numero_operacion, banco, fecha_transferencia } = result.data;
                onChange({
                    ...data,
                    ...(banco ? { banco: banco.toUpperCase() } : {}),
                    ...(monto ? { total: monto } : {}),
                    ...(numero_operacion ? { numero_operacion: numero_operacion } : {}),
                    ...(fecha_transferencia ? { fecha_transferencia: fecha_transferencia } : {}),
                });
            }
        } catch {
            // El error se maneja silenciosamente; el usuario puede llenar los campos manualmente
        }
    };

    const isOlva = data.agencia === "OLVA";

    return (
        <div className="space-y-4">
            {/* Botón de escaneo OCR */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleScanClick}
                    disabled={isScanning}
                >
                    {isScanning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ScanLine className="w-4 h-4" />
                    )}
                    {isScanning ? "Procesando imagen..." : "Escanear transferencia"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                    Sube una captura de la transferencia para autocompletar los campos
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Agencia - Select */}
                <div className="space-y-1.5">
                    <Label htmlFor="agencia" className="text-xs text-muted-foreground">
                        Agencia
                    </Label>
                    <select
                        id="agencia"
                        value={data.agencia}
                        onChange={(e) => handleChange("agencia", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="OFICINA">OFICINA</option>
                        <option value="OLVA">OLVA</option>
                    </select>
                </div>

                {/* Banco */}
                <div className="space-y-1.5">
                    <Label htmlFor="banco" className="text-xs text-muted-foreground">
                        Banco
                    </Label>
                    <Input
                        id="banco"
                        type="text"
                        placeholder="Ej. BCP"
                        value={data.banco}
                        onChange={(e) => handleChange("banco", e.target.value)}
                    />
                </div>

                {/* Número de Operación */}
                <div className="space-y-1.5">
                    <Label htmlFor="numero_operacion" className="text-xs text-muted-foreground">
                        N° Operación
                    </Label>
                    <Input
                        id="numero_operacion"
                        type="text"
                        placeholder="Ej. 123456789"
                        value={data.numero_operacion}
                        onChange={(e) => handleChange("numero_operacion", e.target.value)}
                    />
                </div>

                {/* Fecha y hora de Transferencia */}
                <div className="space-y-1.5">
                    <Label htmlFor="fecha_transferencia" className="text-xs text-muted-foreground">
                        Fecha y hora de transferencia
                    </Label>
                    <Input
                        id="fecha_transferencia"
                        type="text"
                        placeholder="Ej. 04/05/2026"
                        value={data.fecha_transferencia}
                        onChange={(e) => handleChange("fecha_transferencia", e.target.value)}
                    />
                </div>

                {/* Departamento - Solo visible si es OLVA */}
                {isOlva && (
                    <div className="space-y-1.5">
                        <Label htmlFor="departamento" className="text-xs text-muted-foreground">
                            Departamento
                        </Label>
                        <Input
                            id="departamento"
                            type="text"
                            placeholder="Ej. Lima"
                            value={data.departamento}
                            onChange={(e) => handleChange("departamento", e.target.value)}
                        />
                    </div>
                )}

                {/* Provincia - Solo visible si es OLVA */}
                {isOlva && (
                    <div className="space-y-1.5">
                        <Label htmlFor="provincia" className="text-xs text-muted-foreground">
                            Provincia
                        </Label>
                        <Input
                            id="provincia"
                            type="text"
                            placeholder="Ej. Lima"
                            value={data.provincia}
                            onChange={(e) => handleChange("provincia", e.target.value)}
                        />
                    </div>
                )}

                {/* Total */}
                <div className="space-y-1.5">
                    <Label htmlFor="total" className="text-xs text-muted-foreground">
                        Total
                    </Label>
                    <Input
                        id="total"
                        type="number"
                        placeholder="0.00"
                        value={data.total}
                        onChange={(e) => handleChange("total", e.target.value)}
                    />
                </div>

                {/* Titular */}
                <div className="space-y-1.5">
                    <Label htmlFor="titular" className="text-xs text-muted-foreground">
                        Titular
                    </Label>
                    <Input
                        id="titular"
                        type="text"
                        placeholder="Nombre del titular"
                        value={data.titular}
                        onChange={(e) => handleChange("titular", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};


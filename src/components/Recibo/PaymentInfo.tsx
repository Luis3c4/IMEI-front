import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2 } from "lucide-react";
import { useTransferOCR } from "@/services/api-query";

export interface PaymentData {
    tipo: "FINAL" | "TIENDA";
    departamento: string;
    provincia: string;
    provinciaAdicional: string;
    agencia: string;
    olva: string;
    frank: string;
    vendedor: "" | "Javi" | "Roger";
    numero: string;
    precioFinal: string;
    envio: string;
    accesorio: string;
    banco: string;
    total: string;
    titular: string;
    numero_operacion: string;
    fecha_transferencia: string;
}

interface CustomerData {
    document_number: string;
    full_name: string;
    phone?: string;
}

interface PaymentInfoProps {
    data: PaymentData;
    onChange: (data: PaymentData) => void;
    customerData: CustomerData | null;
    invoiceDate: Date;
}

export const PaymentInfo = ({ data, onChange, customerData, invoiceDate }: PaymentInfoProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync: scanTransfer, isPending: isScanning } = useTransferOCR();

    const handleChange = (key: keyof PaymentData, value: string) => {
        const numericFields: (keyof PaymentData)[] = [
            "numero",
            "olva",
            "frank",
            "precioFinal",
            "envio",
            "accesorio",
            "total",
        ];
        const normalizedValue =
            numericFields.includes(key) || key === "vendedor" ? value : value.toUpperCase();
        onChange({ ...data, [key]: normalizedValue });
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
                {/* Tipo de atención */}
                <div className="space-y-1.5">
                    <Label htmlFor="tipo" className="text-xs text-muted-foreground">
                        FINAL / TIENDA
                    </Label>
                    <select
                        id="tipo"
                        value={data.tipo}
                        onChange={(e) => handleChange("tipo", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="FINAL">FINAL</option>
                        <option value="TIENDA">TIENDA</option>
                    </select>
                </div>

                {/* Vendedor */}
                <div className="space-y-1.5">
                    <Label htmlFor="vendedor" className="text-xs text-muted-foreground">
                        VEND.
                    </Label>
                    <select
                        id="vendedor"
                        value={data.vendedor}
                        onChange={(e) => handleChange("vendedor", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">Seleccionar vendedor</option>
                        <option value="Javi">Javi</option>
                        <option value="Roger">Roger</option>
                    </select>
                </div>

                {/* Datos obtenidos mediante la consulta por DNI */}
                <div className="space-y-1.5">
                    <Label htmlFor="cliente-dni" className="text-xs text-muted-foreground">
                        DNI
                    </Label>
                    <Input id="cliente-dni" value={customerData?.document_number ?? ""} readOnly />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="cliente-nombre" className="text-xs text-muted-foreground">
                        CLIENTE
                    </Label>
                    <Input id="cliente-nombre" value={customerData?.full_name ?? ""} readOnly />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="cliente-telefono" className="text-xs text-muted-foreground">
                        TELEFONO
                    </Label>
                    <Input id="cliente-telefono" value={customerData?.phone ?? ""} readOnly />
                </div>

                {/* Número y fecha de venta */}
                <div className="space-y-1.5">
                    <Label htmlFor="numero" className="text-xs text-muted-foreground">
                        N°
                    </Label>
                    <Input
                        id="numero"
                        type="number"
                        placeholder="0"
                        value={data.numero}
                        onChange={(e) => handleChange("numero", e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="fecha-venta" className="text-xs text-muted-foreground">
                        FECHA V.
                    </Label>
                    <Input
                        id="fecha-venta"
                        value={new Intl.DateTimeFormat("es-PE").format(invoiceDate)}
                        readOnly
                    />
                </div>

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
                            DPTO.
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
                            PROVI.
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

                {isOlva && (
                    <div className="space-y-1.5">
                        <Label htmlFor="provincia-adicional" className="text-xs text-muted-foreground">
                            PROVI. (segunda)
                        </Label>
                        <Input
                            id="provincia-adicional"
                            type="text"
                            placeholder="Ej. Lima"
                            value={data.provinciaAdicional}
                            onChange={(e) => handleChange("provinciaAdicional", e.target.value)}
                        />
                    </div>
                )}

                {isOlva && (
                    <div className="space-y-1.5">
                        <Label htmlFor="olva" className="text-xs text-muted-foreground">
                            OLVA
                        </Label>
                        <Input
                            id="olva"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data.olva}
                            onChange={(e) => handleChange("olva", e.target.value)}
                        />
                    </div>
                )}

                {isOlva && (
                    <div className="space-y-1.5">
                        <Label htmlFor="frank" className="text-xs text-muted-foreground">
                            FRANK
                        </Label>
                        <Input
                            id="frank"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data.frank}
                            onChange={(e) => handleChange("frank", e.target.value)}
                        />
                    </div>
                )}

                {/* Precio final */}
                <div className="space-y-1.5">
                    <Label htmlFor="precio-final" className="text-xs text-muted-foreground">
                        PRECIO F.
                    </Label>
                    <Input
                        id="precio-final"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={data.precioFinal}
                        onChange={(e) => handleChange("precioFinal", e.target.value)}
                    />
                </div>

                {isOlva && (
                    <div className="space-y-1.5">
                        <Label htmlFor="envio" className="text-xs text-muted-foreground">
                            ENVIO
                        </Label>
                        <Input
                            id="envio"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data.envio}
                            onChange={(e) => handleChange("envio", e.target.value)}
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="accesorio" className="text-xs text-muted-foreground">
                        ACCES.
                    </Label>
                    <Input
                        id="accesorio"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={data.accesorio}
                        onChange={(e) => handleChange("accesorio", e.target.value)}
                    />
                </div>

                {/* Total */}
                <div className="space-y-1.5">
                    <Label htmlFor="total" className="text-xs text-muted-foreground">
                        S/. TOTAL
                    </Label>
                    <Input
                        id="total"
                        type="number"
                        step="0.01"
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

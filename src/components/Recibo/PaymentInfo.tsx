import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

export interface PaymentData {
    departamento: string;
    provincia: string;
    agencia: string;
    banco: string;
    total: string;
    titular: string;
}

interface PaymentInfoProps {
    data: PaymentData;
    onChange: (data: PaymentData) => void;
}

export const PaymentInfo = ({ data, onChange }: PaymentInfoProps) => {
    // Establecer agencia por defecto a "OFICINA" si está vacía
    useEffect(() => {
        if (!data.agencia) {
            onChange({ ...data, agencia: "OFICINA" });
        }
    }, []);

    const handleChange = (key: keyof PaymentData, value: string) => {
        onChange({ ...data, [key]: key !== "total" ? value.toUpperCase() : value });
    };

    const isOlva = data.agencia === "OLVA";

    return (
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
    );
};

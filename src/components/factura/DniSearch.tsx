import { useState } from "react";
import { Search, User, IdCard, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDniSearch } from "@/services/api-query";

interface DniResult {
  full_name: string;
  document_number: string;
}

interface DniSearchProps {
  onCustomerDataChange?: (data: DniResult | null) => void;
}

export const DniSearch = ({ onCustomerDataChange }: DniSearchProps) => {
  const [dni, setDni] = useState("");
  const [result, setResult] = useState<DniResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { refetch, isFetching } = useDniSearch(dni, {
    enabled: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const handleSearch = async () => {
    if (dni.length !== 8) return;
    
    setError(null);
    
    try {
      const response = await refetch();
      if (response.data) {
        // Construir el nombre completo en formato: Nombres + Apellido Paterno + Apellido Materno
        const fullName = `${response.data.first_name} ${response.data.first_last_name} ${response.data.second_last_name}`.trim();
        
        const customerData = {
          full_name: fullName,
          document_number: response.data.document_number,
        };
        setResult(customerData);
        onCustomerDataChange?.(customerData);
      } else if (response.error) {
        const message = response.error instanceof Error ? response.error.message : "Error al consultar el DNI";
        setError(message);
        setResult(null);
        onCustomerDataChange?.(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al consultar el DNI";
      setError(message);
      setResult(null);
      onCustomerDataChange?.(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setDni(value);
    if (value.length !== 8) {
      setResult(null);
      onCustomerDataChange?.(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && dni.length === 8) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ingresa el DNI (8 dígitos)"
            value={dni}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={dni.length !== 8 || isFetching}
          className="h-11 px-6"
        >
          <Search className="w-4 h-4 mr-2" />
          {isFetching ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 rounded-xl border border-destructive/20 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="w-4 h-4" />
            Error en la búsqueda
          </div>
          <p className="text-sm text-destructive/80">
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-background/50 rounded-xl border border-border/50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <User className="w-4 h-4" />
            Resultado de búsqueda
          </div>
          
          <div className="grid gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide min-w-25">
                Nombre completo
              </span>
              <span className="text-sm font-medium text-foreground">
                {result.full_name}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide min-w-25">
                DNI
              </span>
              <span className="text-sm font-medium text-foreground font-mono">
                {result.document_number}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

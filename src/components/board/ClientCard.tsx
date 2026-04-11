import { Calendar, CreditCard, Phone, ChevronRight, Trash2, User } from "lucide-react";
import type { KanbanPhase } from "../../pages/Board";

export interface ClientData {
  id: string;
  dni: string;
  fullName: string;
  telefono: string;
  fecha: string;
  products: string[];
  phase: KanbanPhase;
}

const nextPhase: Record<KanbanPhase, KanbanPhase | null> = {
  pedido: "reservado",
  reservado: "entregado",
  entregado: "completado",
  completado: null,
};

interface ClientCardProps {
  data: ClientData;
  onMove: (id: string, phase: KanbanPhase) => void;
  onDelete: (id: string) => void;
}

export const ClientCard = ({ data, onMove, onDelete }: ClientCardProps) => {
  const next = nextPhase[data.phase];

  return (
    <div className="rounded-lg bg-card border border-border p-3.5 shadow-sm animate-slide-in space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <User className="w-4 h-4 text-muted-foreground" />
        <span>{data.fullName}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CreditCard className="w-4 h-4" />
        <span>DNI: {data.dni}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="w-4 h-4" />
        <span>{data.telefono || "Sin teléfono"}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="w-3.5 h-3.5" />
        <span>{data.fecha}</span>
      </div>
      {data.products.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.products.map((p, i) => (
            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        {next && (
          <button
            onClick={() => onMove(data.id, next)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-70 transition-opacity"
          >
            Mover a {next} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(data.id)}
          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

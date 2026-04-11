import type { KanbanPhase } from "../../pages/Board";
import type { ReactNode } from "react";

const phaseColors: Record<KanbanPhase, string> = {
  pedido: "bg-kanban-pedido",
  reservado: "bg-kanban-reservado",
  entregado: "bg-kanban-entregado",
  completado: "bg-kanban-completado",
};

interface KanbanColumnProps {
  phase: KanbanPhase;
  label: string;
  count: number;
  children: ReactNode;
}

export const KanbanColumn = ({ phase, label, count, children }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col rounded-xl bg-secondary/50 border border-border min-h-100">
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
        <span className={`w-2.5 h-2.5 rounded-full ${phaseColors[phase]}`} />
        <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-3 flex-1">
        {children}
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const DatePickerCard = ({ date, onDateChange }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-3 relative">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-foreground">
          Fecha de la cotización
        </h3>
      </div>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors px-4 py-2.5 text-sm"
      >
        <span className="font-medium text-foreground">
          {format(date, "dd/MM/yyyy")}
        </span>
        <span className="text-xs text-muted-foreground">
          {open ? "Cerrar" : "Cambiar fecha"}
        </span>
      </button>
      {/* Calendar dropdown */}
      {open && (
        <div className="absolute left-6 z-50 mt-1 bg-popover border border-border rounded-2xl shadow-lg p-4">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (selected) {
                onDateChange(selected);
                setOpen(false);
              }
            }}
            locale={es}
            captionLayout="dropdown"
            className="p-0!"
            classNames={{ caption_label: "hidden" }}
          />
        </div>
      )}
    </div>
  );
};

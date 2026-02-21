import { useState } from "react";
import { type ProductVariant } from "@/examples/data";
import { Check, Smartphone, Laptop, Watch, Headphones, Tv, MapPin, Speaker, Tablet } from "lucide-react";

const getCategoryIcon = (name: string) => {
  if (name.includes("iPhone")) return Smartphone;
  if (name.includes("iPad")) return Tablet;
  if (name.includes("Mac")) return Laptop;
  if (name.includes("Watch")) return Watch;
  if (name.includes("AirPods") || name.includes("AirTag")) return Headphones;
  if (name.includes("TV")) return Tv;
  if (name.includes("HomePod")) return Speaker;
  return MapPin;
};

interface ProductFormProps {
  product: ProductVariant;
  onRegister: (data: { product: string; color: string; capacity: string }) => void;
}

const ProductForm = ({ product, onRegister }: ProductFormProps) => {
  const [color, setColor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [registered, setRegistered] = useState(false);

  const Icon = getCategoryIcon(product.name);

  const capacityLabel = product.capacities[0]?.includes("mm")
    ? "Tamaño"
    : product.capacities[0]?.includes("Pack") || product.capacities[0]?.includes("Unidad")
    ? "Presentación"
    : "Capacidad";

  const handleSubmit = () => {
    if (!color || !capacity) return;
    onRegister({ product: product.name, color, capacity });
    setRegistered(true);
    setTimeout(() => {
      setRegistered(false);
      setColor("");
      setCapacity("");
    }, 2000);
  };

  const canSubmit = color && capacity && !registered;

  return (
    <div className="animate-scale-in space-y-6 rounded-2xl glass-card p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-card-foreground leading-tight">{product.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Completa los detalles para registrar</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Color */}
      <div className="space-y-2.5">
        <label className="text-[0.6875rem] font-bold uppercase tracking-widest text-category-label">
          Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {product.colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                color === c ? "chip-active" : "chip-idle"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div className="space-y-2.5">
        <label className="text-[0.6875rem] font-bold uppercase tracking-widest text-category-label">
          {capacityLabel}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {product.capacities.map((cap) => (
            <button
              key={cap}
              onClick={() => setCapacity(cap)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                capacity === cap ? "chip-active" : "chip-idle"
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {(color || capacity) && (
        <div className="animate-fade-in rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          {color && <span className="font-medium text-foreground">{color}</span>}
          {color && capacity && <span className="mx-1.5">·</span>}
          {capacity && <span className="font-medium text-foreground">{capacity}</span>}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
          registered ? "btn-success" : canSubmit ? "btn-register" : "btn-disabled"
        }`}
      >
        {registered ? (
          <>
            <Check className="h-4 w-4" /> Registrado exitosamente
          </>
        ) : (
          "Registrar Producto"
        )}
      </button>
    </div>
  );
};

export default ProductForm;

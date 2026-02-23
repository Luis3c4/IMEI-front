import { useRef, useState } from "react";
import { Check, Smartphone, Laptop, Watch, Headphones, Tv, MapPin, Speaker, Tablet, Info, Plus, X } from "lucide-react";

export const NO_COLOR_LABEL = "SIN COLOR";
export const NO_CAPACITY_LABEL = "SIN CAPACIDAD";

export interface RegistroProductVariant {
  name: string;
  colors: string[];
  capacities: string[];
}

export interface RegistroFormData {
  product: string;
  color: string | null;
  capacity: string | null;
  serialNumber: string;
  partNumber: string;
}

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
  product: RegistroProductVariant;
  onRegister: (data: RegistroFormData) => Promise<boolean>;
  onSuccess?: () => void;
  isSubmitting?: boolean;
}

const ProductForm = ({ product, onRegister, onSuccess, isSubmitting = false }: ProductFormProps) => {
  const [color, setColor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [registered, setRegistered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Extra variants added inline
  const [extraColors, setExtraColors] = useState<string[]>([]);
  const [addingColor, setAddingColor] = useState(false);
  const [colorInput, setColorInput] = useState("");

  const [extraCapacities, setExtraCapacities] = useState<string[]>([]);
  const [addingCapacity, setAddingCapacity] = useState(false);
  const [capacityInput, setCapacityInput] = useState("");

  const colorInputRef = useRef<HTMLInputElement>(null);
  const capacityInputRef = useRef<HTMLInputElement>(null);

  const allColors = [...product.colors, ...extraColors];
  const allCapacities = [...product.capacities, ...extraCapacities];

  const confirmAddColor = () => {
    const val = colorInput.trim().toUpperCase();
    if (val && !allColors.includes(val)) {
      setExtraColors((prev) => [...prev, val]);
      setColor(val);
    }
    setColorInput("");
    setAddingColor(false);
  };

  const confirmAddCapacity = () => {
    const val = capacityInput.trim().toUpperCase();
    if (val && !allCapacities.includes(val)) {
      setExtraCapacities((prev) => [...prev, val]);
      setCapacity(val);
    }
    setCapacityInput("");
    setAddingCapacity(false);
  };

  const Icon = getCategoryIcon(product.name);

  const capacityLabel = product.capacities[0]?.includes("mm")
    ? "Tamaño"
    : product.capacities[0]?.includes("Pack") || product.capacities[0]?.includes("Unidad")
    ? "Presentación"
    : "Capacidad";

  const fallbackColor = product.colors.length === 1 ? product.colors[0] : "";
  const fallbackCapacity = product.capacities.length === 1 ? product.capacities[0] : "";
  const selectedColor = color || fallbackColor;
  const selectedCapacity = capacity || fallbackCapacity;

  const normalizedColor = selectedColor === NO_COLOR_LABEL ? null : selectedColor || null;
  const normalizedCapacity = selectedCapacity === NO_CAPACITY_LABEL ? null : selectedCapacity || null;

  const handleSubmit = async () => {
    if (!selectedColor || !selectedCapacity || !serialNumber || !partNumber) return;

    setSubmitError(null);
    const fullPartNumber = partNumber.endsWith("/A") ? partNumber : `${partNumber}/A`;
    const success = await onRegister({
      product: product.name,
      color: normalizedColor,
      capacity: normalizedCapacity,
      serialNumber,
      partNumber: fullPartNumber,
    });

    if (!success) {
      setSubmitError("No se pudo registrar el producto. Verifica los datos e inténtalo otra vez.");
      return;
    }

    setRegistered(true);
    setTimeout(() => {
      setRegistered(false);
      setColor("");
      setCapacity("");
      setSerialNumber("");
      setPartNumber("");
      setExtraColors([]);
      setExtraCapacities([]);
      onSuccess?.();
    }, 2000);
  };

  const canSubmit = selectedColor && selectedCapacity && serialNumber && partNumber && !registered && !isSubmitting;

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
          {allColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                selectedColor === c ? "chip-active" : "chip-idle"
              }`}
            >
              {c}
            </button>
          ))}

          {/* Inline add color */}
          {addingColor ? (
            <div className="flex items-center gap-1">
              <input
                ref={colorInputRef}
                autoFocus
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddColor();
                  if (e.key === "Escape") { setColorInput(""); setAddingColor(false); }
                }}
                placeholder="Nuevo color"
                className="w-28 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={confirmAddColor}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground hover:opacity-80 transition-opacity"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => { setColorInput(""); setAddingColor(false); }}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground hover:opacity-80 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAddingColor(true); setTimeout(() => colorInputRef.current?.focus(), 0); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              title="Agregar color"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Capacity */}
      <div className="space-y-2.5">
        <label className="text-[0.6875rem] font-bold uppercase tracking-widest text-category-label">
          {capacityLabel}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {allCapacities.map((cap) => (
            <button
              key={cap}
              onClick={() => setCapacity(cap)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                selectedCapacity === cap ? "chip-active" : "chip-idle"
              }`}
            >
              {cap}
            </button>
          ))}

          {/* Inline add capacity */}
          {addingCapacity ? (
            <div className="flex items-center gap-1">
              <input
                ref={capacityInputRef}
                autoFocus
                type="text"
                value={capacityInput}
                onChange={(e) => setCapacityInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddCapacity();
                  if (e.key === "Escape") { setCapacityInput(""); setAddingCapacity(false); }
                }}
                placeholder="Nueva capacidad"
                className="w-32 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={confirmAddCapacity}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground hover:opacity-80 transition-opacity"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => { setCapacityInput(""); setAddingCapacity(false); }}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground hover:opacity-80 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAddingCapacity(true); setTimeout(() => capacityInputRef.current?.focus(), 0); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              title="Agregar capacidad"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Serial Number */}
      <div className="space-y-2.5">
        <label className="text-[0.6875rem] font-bold uppercase tracking-widest text-category-label">
          Serial Number
        </label>
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
          placeholder="Ej: C39X1234ABCD"
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Part Number */}
      <div className="space-y-2.5">
        <label className="text-[0.6875rem] font-bold uppercase tracking-widest text-category-label">
          Part Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
            placeholder="Ej: MU2A3LZ"
            className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">/A</span>
        </div>
        <div className="flex items-start gap-1.5 text-[0.65rem] text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>No es necesario digitar el <span className="font-semibold text-foreground">/A</span> final, se agrega automáticamente.</span>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedColor || selectedCapacity) && (
        <div className="animate-fade-in rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          {normalizedColor === null && normalizedCapacity === null ? (
            <span className="font-medium text-foreground">Sin capacidad y sin color</span>
          ) : (
            <>
              {selectedColor && <span className="font-medium text-foreground">{selectedColor}</span>}
              {selectedColor && selectedCapacity && <span className="mx-1.5">·</span>}
              {selectedCapacity && <span className="font-medium text-foreground">{selectedCapacity}</span>}
            </>
          )}
        </div>
      )}

      {/* Submit */}
      {submitError && (
        <p className="text-xs text-destructive">{submitError}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
          registered ? "btn-success" : canSubmit ? "btn-register" : "btn-disabled"
        }`}
      >
        {isSubmitting ? (
          "Registrando..."
        ) : registered ? (
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

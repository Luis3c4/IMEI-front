import { useMemo, useState } from "react";
import { ChevronRight, X, ChevronLeft } from "lucide-react";
import { useProducts, useMacbookVariants } from "@/services/api-query";

interface ProductInterest {
  label: string;
}

interface BoardProductSelectorProps {
  selected: ProductInterest[];
  onChange: (products: ProductInterest[]) => void;
}

type Step = "category" | "model" | "capacity" | "chip" | "color";

interface ProductModel {
  name: string;
  base_product_id: number;
  category: string;
}

const MACBOOK_CATEGORY = "MACBOOK";

// Inner component that has access to macbook variants hook (called conditionally by category)
const MacbookCapacityStep = ({
  model,
  onCapacitySelect,
}: {
  model: string;
  onCapacitySelect: (capacity: string, chips: string[]) => void;
}) => {
  const { data, isLoading } = useMacbookVariants(model, { enabled: !!model });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando variantes...</p>;
  if (!data?.capacities?.length) return <p className="text-sm text-muted-foreground">Sin variantes disponibles.</p>;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {data.capacities.map((cap) => (
        <button
          key={cap}
          onClick={() => onCapacitySelect(cap, data.chips_by_capacity[cap] ?? [])}
          className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.8125rem] font-medium transition-all duration-200 glass-card glass-card-hover"
        >
          <span>{cap}</span>
          {(data.chips_by_capacity[cap]?.length ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground">
              {data.chips_by_capacity[cap].length} chips
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export const BoardProductSelector = ({ selected, onChange }: BoardProductSelectorProps) => {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [availableChips, setAvailableChips] = useState<string[]>([]);

  const { data: products = [], isLoading } = useProducts({ retry: 1 });

  const modelsByCategory = useMemo(() => {
    const map = new Map<string, ProductModel>();
    products.forEach((p) => {
      const key = `${p.id}-${p.name}`;
      if (!map.has(key)) map.set(key, { name: p.name, base_product_id: p.id, category: p.category });
    });
    return Array.from(map.values()).reduce((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {} as Record<string, ProductModel[]>);
  }, [products]);

  const categories = useMemo(() => Object.keys(modelsByCategory).sort(), [modelsByCategory]);

  const isMacbook = selectedCategory === MACBOOK_CATEGORY;

  const productHasNoCapacity = useMemo(() => {
    if (!selectedModel || isMacbook) return false;
    const p = products.find((x) => x.id === selectedModel.base_product_id);
    return !!p && p.product_variants.length > 0 && p.product_variants[0].capacity === null;
  }, [selectedModel, products, isMacbook]);

  const productHasNoColor = useMemo(() => {
    if (!selectedModel) return false;
    const p = products.find((x) => x.id === selectedModel.base_product_id);
    return !!p && p.product_variants.length > 0 && p.product_variants[0].color === null;
  }, [selectedModel, products]);

  const availableCapacities = useMemo(() => {
    if (!selectedModel || isMacbook) return [];
    const p = products.find((x) => x.id === selectedModel.base_product_id);
    if (!p) return [];
    const map = new Map<string, number>();
    p.product_variants.forEach((v) => {
      if (v.capacity) map.set(v.capacity, (map.get(v.capacity) ?? 0) + (v.quantity ?? 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([capacity, stock]) => ({ capacity, stock }));
  }, [selectedModel, products, isMacbook]);

  const availableColors = useMemo(() => {
    if (!selectedModel || isMacbook) return [];
    if (!productHasNoCapacity && !selectedCapacity) return [];
    const p = products.find((x) => x.id === selectedModel.base_product_id);
    if (!p) return [];
    const map = new Map<string, number>();
    p.product_variants
      .filter((v) => productHasNoCapacity || v.capacity === selectedCapacity)
      .forEach((v) => { if (v.color) map.set(v.color, (map.get(v.color) ?? 0) + (v.quantity ?? 0)); });
    return Array.from(map.entries()).map(([color, stock]) => ({ color, stock }));
  }, [selectedModel, selectedCapacity, productHasNoCapacity, products, isMacbook]);

  const reset = () => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedModel(null);
    setSelectedCapacity(null);
    setAvailableChips([]);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setStep("model");
  };

  const handleModelSelect = (model: ProductModel) => {
    setSelectedModel(model);
    if (isMacbook) {
      setStep("capacity");
      return;
    }
    const p = products.find((x) => x.id === model.base_product_id);
    const noCapacity = !!p && p.product_variants.length > 0 && p.product_variants[0].capacity === null;
    const noColor = !!p && p.product_variants.length > 0 && p.product_variants[0].color === null;
    if (noCapacity && noColor) {
      addProduct(model.name, null, null, null);
    } else if (noCapacity) {
      setSelectedCapacity("N/A");
      setStep("color");
    } else {
      setStep("capacity");
    }
  };

  // For non-macbook products
  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
    if (productHasNoColor) {
      addProduct(selectedModel!.name, capacity, null, null);
    } else {
      setStep("color");
    }
  };

  // For macbook: called from MacbookCapacityStep
  const handleMacbookCapacitySelect = (capacity: string, chips: string[]) => {
    setSelectedCapacity(capacity);
    setAvailableChips(chips);
    if (chips.length > 0) {
      setStep("chip");
    } else {
      addProduct(selectedModel!.name, capacity, null, null);
    }
  };

  const handleChipSelect = (chip: string) => {
    addProduct(selectedModel!.name, selectedCapacity, null, chip);
  };

  const handleColorSelect = (color: string) => {
    addProduct(selectedModel!.name, selectedCapacity, color, null);
  };

  const addProduct = (name: string, capacity: string | null, color: string | null, chip: string | null) => {
    const parts = [
      name,
      capacity && capacity !== "N/A" ? capacity : null,
      chip ?? null,
      color && color !== "N/A" ? color : null,
    ].filter(Boolean);
    const label = parts.join(" · ");
    onChange([...selected, { label }]);
    reset();
  };

  const removeProduct = (index: number) => {
    onChange(selected.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando productos...</p>;
  }

  const backAction: Partial<Record<Step, () => void>> = {
    model: () => { setStep("category"); setSelectedModel(null); },
    capacity: () => { setStep("model"); setSelectedCapacity(null); },
    chip: () => { setStep("capacity"); setAvailableChips([]); },
    color: () => setStep(productHasNoCapacity ? "model" : "capacity"),
  };

  const backLabel: Partial<Record<Step, string>> = {
    model: selectedCategory ?? "",
    capacity: selectedModel?.name ?? "",
    chip: selectedCapacity && selectedCapacity !== "N/A"
      ? `${selectedModel?.name} · ${selectedCapacity}`
      : selectedModel?.name ?? "",
    color: selectedCapacity && selectedCapacity !== "N/A"
      ? `${selectedModel?.name} · ${selectedCapacity}`
      : selectedModel?.name ?? "",
  };

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((p, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              {p.label}
              <button onClick={() => removeProduct(i)} className="hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Back breadcrumb */}
      {step !== "category" && (
        <button
          onClick={backAction[step]}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {backLabel[step]}
        </button>
      )}

      {/* Step: category */}
      {step === "category" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.8125rem] font-medium transition-all duration-200 glass-card glass-card-hover"
            >
              <span className="truncate">{cat}</span>
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Step: model */}
      {step === "model" && selectedCategory && (
        <div className="grid gap-2 sm:grid-cols-2">
          {(modelsByCategory[selectedCategory] ?? []).map((m) => (
            <button
              key={m.base_product_id}
              onClick={() => handleModelSelect(m)}
              className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.8125rem] font-medium transition-all duration-200 glass-card glass-card-hover"
            >
              <span className="truncate">{m.name}</span>
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Step: capacity — macbook uses dedicated component with dedicated endpoint */}
      {step === "capacity" && selectedModel && isMacbook && (
        <MacbookCapacityStep
          model={selectedModel.name}
          onCapacitySelect={handleMacbookCapacitySelect}
        />
      )}

      {/* Step: capacity — non-macbook */}
      {step === "capacity" && !isMacbook && (
        <div className="grid gap-2 sm:grid-cols-2">
          {availableCapacities.map(({ capacity, stock }) => (
            <button
              key={capacity}
              onClick={() => handleCapacitySelect(capacity)}
              className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.8125rem] font-medium transition-all duration-200 glass-card glass-card-hover"
            >
              <span>{capacity}</span>
              <span className="text-xs text-muted-foreground">{stock} en stock</span>
            </button>
          ))}
        </div>
      )}

      {/* Step: chip (macbook only) */}
      {step === "chip" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {availableChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipSelect(chip)}
              className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.8125rem] font-medium transition-all duration-200 glass-card glass-card-hover"
            >
              <span>{chip}</span>
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Step: color */}
      {step === "color" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {availableColors.map(({ color, stock }) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.8125rem] font-medium transition-all duration-200 glass-card glass-card-hover"
            >
              <span>{color}</span>
              <span className="text-xs text-muted-foreground">{stock} en stock</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

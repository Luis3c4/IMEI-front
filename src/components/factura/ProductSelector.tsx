import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Check, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/data/products";
import { IMEIAPIService } from "@/services/api";

interface ProductSelectorProps {
  onAddProduct: (product: Product) => void;
  selectedProducts: Product[];
}

type Step = "model" | "capacity" | "color" | "serial";

interface ProductModel {
  name: string;
  base_product_id: string;
  category: string;
}

interface SerialEntry extends Product {
  entryId: string;
  displaySerial: string;
}

export const ProductSelector = ({ onAddProduct, selectedProducts }: ProductSelectorProps) => {
  const [step, setStep] = useState<Step>("model");
  const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await IMEIAPIService.getProducts();
        setProducts(items);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar productos";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Obtener modelos únicos agrupados por categoría
  const modelsByCategory = useMemo(() => {
    const modelsMap = new Map<string, ProductModel>();
    
    products.forEach(product => {
      const key = `${product.base_product_id}-${product.name}`;
      if (!modelsMap.has(key)) {
        modelsMap.set(key, {
          name: product.name,
          base_product_id: product.base_product_id,
          category: product.category
        });
      }
    });

    const uniqueModels = Array.from(modelsMap.values());
    
    return uniqueModels.reduce((acc, model) => {
      if (!acc[model.category]) {
        acc[model.category] = [];
      }
      acc[model.category].push(model);
      return acc;
    }, {} as Record<string, ProductModel[]>);
  }, [products]);

  const categories = useMemo(() => {
    return Object.keys(modelsByCategory).sort();
  }, [modelsByCategory]);

  // Obtener capacidades disponibles para el modelo seleccionado
  const availableCapacities = useMemo(() => {
    if (!selectedModel) return [];
    
    const capacitiesMap = new Map<string, { capacity: string; totalStock: number }>();
    
    products
      .filter(p => p.base_product_id === selectedModel.base_product_id && p.capacity)
      .forEach(product => {
        const capacity = product.capacity!;
        const stock = typeof product.quantity === "number" ? product.quantity : 0;
        const current = capacitiesMap.get(capacity);
        
        if (current) {
          capacitiesMap.set(capacity, {
            capacity,
            totalStock: current.totalStock + stock
          });
        } else {
          capacitiesMap.set(capacity, { capacity, totalStock: stock });
        }
      });
    
    return Array.from(capacitiesMap.values())
      .sort((a, b) => {
        const numA = parseInt(a.capacity);
        const numB = parseInt(b.capacity);
        return numA - numB;
      });
  }, [selectedModel, products]);

  // Colores disponibles y stock agregado por color
  const colorsWithStock = useMemo(() => {
    if (!selectedModel || !selectedCapacity) return [];

    const colorMap = new Map<string, { color: string; stock: number; price: number }>();

    products
      .filter(
        (p) =>
          p.base_product_id === selectedModel.base_product_id &&
          p.capacity === selectedCapacity &&
          p.color
      )
      .forEach((product) => {
        const color = product.color!;
        const stock = typeof product.quantity === "number" ? product.quantity : 0;
        const current = colorMap.get(color);

        if (current) {
          colorMap.set(color, {
            color,
            stock: current.stock + stock,
            price: product.item_price,
          });
        } else {
          colorMap.set(color, {
            color,
            stock,
            price: product.item_price,
          });
        }
      });

    return Array.from(colorMap.values());
  }, [products, selectedCapacity, selectedModel]);

  // Dispositivos disponibles para el modelo/capacidad/color seleccionados (seriales)
  const availableSerials = useMemo<SerialEntry[]>(() => {
    if (!selectedModel || !selectedCapacity || !selectedColor) return [];

    const entries: SerialEntry[] = [];

    products.forEach((p) => {
      const matches =
        p.base_product_id === selectedModel.base_product_id &&
        p.capacity === selectedCapacity &&
        p.color === selectedColor &&
        p.status !== "sold"; // Filtrar productos ya vendidos

      if (!matches) return;

      const hasSerial = Boolean(p.serial_number);

      if (hasSerial) {
        // Si tiene serial, es un producto individual
        entries.push({
          ...p,
          entryId: p.id,
          displaySerial: p.serial_number,
        });
      }
    });

    return entries;
  }, [products, selectedCapacity, selectedColor, selectedModel]);

  const isProductSelected = (entryId: string) => {
    return selectedProducts.some((p) => p.id === entryId);
  };

  const resetSelection = () => {
    setStep("model");
    setSelectedModel(null);
    setSelectedCapacity(null);
    setSelectedColor(null);
  };

  const handleModelSelect = (model: ProductModel) => {
    setSelectedModel(model);
    setSelectedCapacity(null);
    setSelectedColor(null);
    setStep("capacity");
  };

  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
    setSelectedColor(null);
    setStep("color");
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setStep("serial");
  };

  const handleSerialSelect = (product: SerialEntry) => {
    if (isProductSelected(product.entryId)) return;
    onAddProduct({
      ...product,
      id: product.entryId,
      serial_number: product.displaySerial,
      quantity_ordered: 1,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-destructive">
        <div className="text-center">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Package className="w-8 h-8 mb-2" />
        <p className="text-sm">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb / Progress */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button
          onClick={resetSelection}
          className={`transition-colors ${step === "model" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          Modelo
        </button>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className={step === "capacity" ? "text-primary font-medium" : "text-muted-foreground"}>
          Capacidad
        </span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className={step === "color" ? "text-primary font-medium" : "text-muted-foreground"}>
          Color
        </span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className={step === "serial" ? "text-primary font-medium" : "text-muted-foreground"}>
          Serial
        </span>
      </div>

      {/* Step: Model Selection */}
      {step === "model" && (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {modelsByCategory[category].map((model) => (
                  <button
                    key={`${model.base_product_id}-${model.name}`}
                    onClick={() => handleModelSelect(model)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent hover:border-primary/30 transition-all text-left group"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {model.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step: Capacity Selection */}
      {step === "capacity" && selectedModel && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Selecciona la capacidad para <span className="text-foreground font-medium">{selectedModel.name}</span>
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                <Home className="w-3 h-3 mr-1" />
                Inicio
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCapacities.map(({ capacity, totalStock }) => (
              <button
                key={capacity}
                onClick={() => totalStock > 0 && handleCapacitySelect(capacity)}
                disabled={totalStock === 0}
                className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                  totalStock === 0
                    ? "border-border/30 bg-muted/30 cursor-not-allowed opacity-50 text-muted-foreground"
                    : "border-border/50 bg-background/50 hover:bg-accent hover:border-primary/30 text-foreground hover:text-primary"
                }`}
              >
                <span>{capacity}</span>
                <span className={`ml-2 text-xs ${totalStock === 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  ({totalStock} disp.)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Color Selection */}
      {step === "color" && selectedModel && selectedCapacity && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{selectedModel.name}</span>
              {" · "}
              <span className="text-foreground">{selectedCapacity}</span>
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                <Home className="w-3 h-3 mr-1" />
                Inicio
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep("capacity")}>
                Cambiar
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {colorsWithStock.map(({ color, stock, price }) => {
              return (
                <button
                  key={color}
                  onClick={() => stock > 0 && handleColorSelect(color)}
                  disabled={stock === 0}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    stock === 0
                      ? "border-border/30 bg-muted/30 cursor-not-allowed opacity-50"
                      : "border-border/50 bg-background/50 hover:bg-accent hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{color}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {stock} {stock === 0 && "(Agotado)"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Serial Selection */}
      {step === "serial" && selectedModel && selectedCapacity && selectedColor && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{selectedModel.name}</span>
              {" · "}
              <span className="text-foreground">{selectedCapacity}</span>
              {" · "}
              <span className="text-foreground">{selectedColor}</span>
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                <Home className="w-3 h-3 mr-1" />
                Inicio
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep("color")}>
                Cambiar
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecciona dispositivos por número de serie (multi-selección)
          </p>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {availableSerials.map((product) => {
              const isSelected = isProductSelected(product.entryId);
              return (
                <button
                  key={product.entryId}
                  onClick={() => !isSelected && handleSerialSelect(product)}
                  disabled={isSelected}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary/50 bg-primary/10 cursor-not-allowed"
                      : "border-border/50 bg-background/50 hover:bg-accent hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isSelected ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-mono font-semibold text-primary tracking-wide">
                        {product.displaySerial}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.capacity} · {product.color}
                        {product.status && (
                          <span className={`ml-2 ${product.status === "available" ? "text-green-600" : "text-muted-foreground"}`}>
                            · {product.status === "available" ? "Disponible" : product.status}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(product.item_price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {step === "model" && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Package className="w-8 h-8 mb-2" />
          <p className="text-sm">No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
};

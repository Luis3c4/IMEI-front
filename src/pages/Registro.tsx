import { useMemo, useState } from "react";
import ProductCard from "@/components/Registro/ProductCard";
import ProductForm, {
  NO_CAPACITY_LABEL,
  NO_COLOR_LABEL,
  type RegistroFormData,
  type RegistroProductVariant,
} from "@/components/Registro/ProductForm";
import { useCreateProduct, useProducts } from "@/services/api-query";
import { Package, Cpu, Smartphone, Tablet, Laptop, Monitor, Watch, Headphones, Speaker, Tv, MapPin, ChevronLeft, Keyboard, PencilLine} from "lucide-react";
//import { toast } from "sonner";

const categoryIcons: Record<string, React.ElementType> = {
  IPHONE: Smartphone,
  IPAD: Tablet,
  MACBOOK: Laptop,
  MAC: Monitor,
  "APPLE WATCH": Watch,
  AIRPODS: Headphones,
  HOMEPOD: Speaker,
  "APPLE TV": Tv,
  AIRTAG: MapPin,
  KEYBOARD: Keyboard,
  "APPLE PENCIL": PencilLine,
};

interface RegistroCategory {
  category: string;
  products: RegistroProductVariant[];
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<RegistroCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<RegistroProductVariant | null>(null);
  const { data: apiProducts = [], isLoading, isError } = useProducts();
  const createProduct = useCreateProduct();

  const categories = useMemo<RegistroCategory[]>(() => {
    if (!apiProducts.length) return [];

    const grouped = new Map<string, RegistroProductVariant[]>();

    apiProducts.forEach((product) => {
      const category = (product.category || "OTROS").toUpperCase();
      const colors = Array.from(
        new Set(
          product.product_variants
            .map((variant) => variant.color)
            .filter((color): color is string => Boolean(color))
        )
      );
      const capacities = Array.from(
        new Set(
          product.product_variants
            .map((variant) => variant.capacity)
            .filter((capacity): capacity is string => Boolean(capacity))
        )
      );

      const nextProduct: RegistroProductVariant = {
        name: product.name,
        colors: colors.length ? colors : [NO_COLOR_LABEL],
        capacities: capacities.length ? capacities : [NO_CAPACITY_LABEL],
      };

      const categoryProducts = grouped.get(category) || [];
      categoryProducts.push(nextProduct);
      grouped.set(category, categoryProducts);
    });

    return Array.from(grouped.entries()).map(([category, products]) => ({
      category,
      products,
    }));
  }, [apiProducts]);

  const handleRegister = async (data: RegistroFormData): Promise<boolean> => {
    if (!selectedCategory) return false;

    try {
      await createProduct.mutateAsync({
        category: selectedCategory.category,
        product_name: data.product,
        color: data.color,
        capacity: data.capacity,
        serial_number: data.serialNumber,
        product_number: data.partNumber,
      });

      return true;
    } catch {
      return false;
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedProduct(null);
  };

  const totalProducts = categories.reduce((acc, cat) => acc + cat.products.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
              <Cpu className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Registro de Productos</h1>
              <p className="text-xs text-muted-foreground">{totalProducts} productos disponibles</p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            Sistema activo
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        {/* Left Panel */}
        <div className="space-y-4">
          {!selectedCategory ? (
            /* Category Selection */
            <>
              <div className="mb-2.5 flex items-center gap-2">
                <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-category-label">
                  Tipo de producto
                </h2>
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[0.625rem] font-medium text-muted-foreground">
                  {categories.length} categorías
                </span>
              </div>
              {isLoading && (
                <div className="rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-xs text-muted-foreground">
                  Cargando categorías...
                </div>
              )}
              {isError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                  No se pudieron cargar productos desde la API.
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.category] || Package;
                  return (
                    <button
                      key={cat.category}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedProduct(null);
                      }}
                      className="group glass-card glass-card-hover flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                        <Icon className="h-4.5 w-4.5 text-accent-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[0.8125rem] font-medium text-foreground truncate">
                          {cat.category}
                        </span>
                        <span className="text-[0.6875rem] text-muted-foreground">
                          {cat.products.length} {cat.products.length === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Product Selection within Category */
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Volver a categorías
              </button>
              <div className="mb-2.5 flex items-center gap-2">
                <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-category-label">
                  {selectedCategory.category}
                </h2>
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[0.625rem] font-medium text-muted-foreground">
                  {selectedCategory.products.length}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {selectedCategory.products.map((product) => (
                  <ProductCard
                    key={product.name}
                    name={product.name}
                    isSelected={selectedProduct?.name === product.name}
                    onClick={() =>
                      setSelectedProduct(selectedProduct?.name === product.name ? null : product)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Form Panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          {selectedProduct ? (
            <ProductForm
              product={selectedProduct}
              onRegister={handleRegister}
              onSuccess={handleBack}
              isSubmitting={createProduct.isPending}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {selectedCategory ? "Selecciona un producto" : "Selecciona una categoría"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {selectedCategory ? "Elige de la lista para registrar" : "Elige el tipo de producto primero"}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Index;

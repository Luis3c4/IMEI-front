import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, type Product } from "@/data/products";
import { IMEIAPIService } from "@/services/api";

interface ProductSelectorProps {
  onAddProduct: (product: Product) => void;
  selectedProducts: Product[];
}

export const ProductSelector = ({ onAddProduct, selectedProducts }: ProductSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 px-4 bg-card border-border hover:bg-secondary/50 transition-all duration-200"
        >
          <span className="text-muted-foreground">
            {isLoading ? "Cargando productos..." : "Seleccionar producto..."}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-(--radix-dropdown-menu-trigger-width) max-h-100 overflow-y-auto bg-popover border-border shadow-elevated z-50"
        align="start"
      >
        {isLoading && (
          <DropdownMenuLabel className="text-sm font-medium text-muted-foreground px-3 py-4">
            Cargando productos...
          </DropdownMenuLabel>
        )}

        {error && !isLoading && (
          <div className="px-3 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            No hay productos disponibles.
          </div>
        )}

        {!isLoading && !error && Object.entries(groupedProducts).map(([category, grouped], index) => (
          <div key={category}>
            {index > 0 && <DropdownMenuSeparator className="bg-border" />}
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              {category}
            </DropdownMenuLabel>
            {grouped.map((product) => {
              const isSelected = isProductSelected(product.id);
              return (
                <DropdownMenuItem
                  key={product.id}
                  onClick={() => {
                    if (!isSelected) {
                      onAddProduct(product);
                      setIsOpen(false);
                    }
                  }}
                  disabled={isSelected}
                  className={`flex items-center justify-between px-3 py-3 cursor-pointer transition-colors duration-150 ${
                    isSelected 
                      ? 'opacity-50 cursor-not-allowed bg-muted' 
                      : 'hover:bg-secondary focus:bg-secondary'
                  }`}
                >
                  <span className="font-medium text-foreground">{product.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(product.item_price)}
                    </span>
                    {!isSelected && (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

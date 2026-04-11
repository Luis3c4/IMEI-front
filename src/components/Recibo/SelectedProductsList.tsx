import { Trash2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/helper/products";
import type { ProductVariant } from "@/types/productsType";

// Tipo extendido para incluir información del producto base
interface SelectedProduct extends ProductVariant {
  baseProductId: number;
  baseProductName: string;
  category: string;
  description?: string;
}

interface SelectedProductsListProps {
  products: SelectedProduct[];
  onRemoveProduct: (productId: string) => void;
}

export const SelectedProductsList = ({ products, onRemoveProduct }: SelectedProductsListProps) => {
  const total = products.reduce((sum, product) => {
    const qty = product.quantity ?? 1;
    return sum + product.price * qty;
  }, 0);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">
          No hay productos seleccionados
        </p>
        <p className="text-sm text-muted-foreground/70 text-center mt-1">
          Usa el menú de arriba para agregar productos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {products.map((product, index) => {
          const qty = product.quantity ?? 1;
          const serialNumber = product.serial_numbers?.[0] || '';

          return (
            <div
              key={`${product.id}-${index}`}
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-card animate-fade-in hover:shadow-elevated transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{product.baseProductName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      product.category,
                      product.capacity,
                      product.color,
                      serialNumber ? `SN: ${serialNumber}` : null,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                  {qty > 1 && (
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">Cantidad seleccionada: {qty}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-foreground">
                    {formatPrice(product.price * qty)}
                  </span>
                  {qty > 1 && (
                    <span className="text-[11px] text-muted-foreground">
                      {formatPrice(product.price)} c/u
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveProduct(product.id.toString())}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
        <span className="text-sm font-medium text-muted-foreground">
          Total ({products.length} {products.length === 1 ? 'producto' : 'productos'})
        </span>
        <span className="text-xl font-bold text-foreground">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
};

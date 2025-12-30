import { useState } from "react";
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
import { mockInvoice, formatPrice, type Product } from "@/data/products";

interface ProductSelectorProps {
  onAddProduct: (product: Product) => void;
  selectedProducts: Product[];
}

export const ProductSelector = ({ onAddProduct, selectedProducts }: ProductSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const iPhoneProducts = mockInvoice.products;
  const groupedProducts = iPhoneProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const isProductSelected = (productId: number) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 px-4 bg-card border-border hover:bg-secondary/50 transition-all duration-200"
        >
          <span className="text-muted-foreground">Seleccionar producto...</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-(--radix-dropdown-menu-trigger-width) max-h-100 overflow-y-auto bg-popover border-border shadow-elevated z-50"
        align="start"
      >
        {Object.entries(groupedProducts).map(([category, products], index) => (
          <div key={category}>
            {index > 0 && <DropdownMenuSeparator className="bg-border" />}
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              {category}
            </DropdownMenuLabel>
            {products.map((product) => {
              const isSelected = isProductSelected(product.id);
              return (
                <DropdownMenuItem
                  key={product.id}
                  onClick={() => {
                    if (!isSelected) {
                      onAddProduct(product);
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

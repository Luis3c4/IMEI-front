import { useState } from "react";
import type { Product } from "@/types/mockProductsType";
import ExpandButton from "./ExpandButton";
import ColorDot from "./ColorDot";
import CapacityGroupRow from "./CapacityGroupRow";
import { TableCell, TableRow } from "@/components/ui/table";

interface ProductRowProps {
  product: Product;
}

const ProductRow = ({ product }: ProductRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Fase 1: Fila principal del producto */}
      <TableRow className="bg-card hover:bg-accent/50 border-b border-border">
        <TableCell>
          <div className="flex items-center gap-3">
            <ExpandButton
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
            />
            <span className="font-medium">{product.name}</span>
          </div>
        </TableCell>
        <TableCell>{product.totalQuantity}</TableCell>
        <TableCell>
          {product.capacities.length > 0 
            ? product.capacities.filter(c => c !== null).join("/") || "—"
            : "—"
          }
        </TableCell>
        <TableCell>
          <div className="flex gap-1.5">
            {product.colors.map((color, idx) => (
              <ColorDot key={idx} color={color.hex} />
            ))}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {product.lastUpdate}
        </TableCell>
      </TableRow>

      {/* Fase 2: Grupos por capacidad */}
      {isExpanded && product.capacityGroups.map((group) => (
        <CapacityGroupRow key={group.id} group={group} />
      ))}
    </>
  );
};

export default ProductRow;

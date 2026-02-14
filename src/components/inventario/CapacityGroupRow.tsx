import { useState } from "react";
import type { CapacityGroup } from "@/types/mockProductsType";
import ExpandButton from "./ExpandButton";
import ColorDot from "./ColorDot";
import ProductItemRow from "./ProductItemRow";
import { TableCell, TableRow } from "@/components/ui/table";

interface CapacityGroupRowProps {
  group: CapacityGroup;
}

const CapacityGroupRow = ({ group }: CapacityGroupRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Fase 2: Fila de capacidad */}
      <TableRow className="bg-muted/80 border-b border-border">
        <TableCell className="pl-8">
          <div className="flex items-center gap-2">
            <ExpandButton
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
            />
            <span className="text-sm text-muted-foreground">ID: {group.id}</span>
          </div>
        </TableCell>
        <TableCell>{group.quantity}</TableCell>
        <TableCell>{group.capacity || "Sin capacidad"}</TableCell>
        <TableCell>
          <div className="flex gap-1.5">
            {group.colors.map((color, idx) => (
              <ColorDot key={idx} color={color.hex} size="md" />
            ))}
          </div>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>

      {/* Fase 3: Items individuales */}
      {isExpanded && group.items.map((item) => (
        <ProductItemRow key={item.serial} item={item} />
      ))}
    </>
  );
};

export default CapacityGroupRow;

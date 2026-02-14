import type { ProductItem } from "@/types/mockProductsType";
import ColorDot from "./ColorDot";
import { TableCell, TableRow } from "@/components/ui/table";

interface ProductItemRowProps {
  item: ProductItem;
}

const ProductItemRow = ({ item }: ProductItemRowProps) => {
  return (
    <TableRow className="bg-primary/90 text-primary-foreground border-b border-primary-foreground/10">
      <TableCell className="pl-16">
        <span className="font-mono font-semibold">{item.serial}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono">{item.productNumber}</span>
      </TableCell>
      <TableCell>{item.capacity || "—"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ColorDot color={item.colorHex} size="sm" />
          <span className="text-sm">{item.color}</span>
        </div>
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};

export default ProductItemRow;

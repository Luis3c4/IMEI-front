import type { Product } from "@/types/mockProductsType";
import ProductRow from "@/components/inventario/ProductRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableProps {
  products: Product[];
}

const ProductTable = ({ products }: ProductTableProps) => {
  return (
    <div className="w-full rounded-lg border border-border overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Producto</TableHead>
            <TableHead className="font-semibold">Cantidad</TableHead>
            <TableHead className="font-semibold">Capacidades</TableHead>
            <TableHead className="font-semibold">Colores</TableHead>
            <TableHead className="font-semibold">Actualización</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;

import ProductTable from '@/components/inventario/ProductTable';
import { mockProducts  } from '@/types/mockProducts';
const Inventario = () => {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Inventario de Productos</h1>
                <ProductTable products={mockProducts} />
            </div>
        </div>
    );
}

export default Inventario;
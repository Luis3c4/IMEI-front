import ProductTable from '@/components/inventario/ProductTable';
import { useInventory } from '@/services/api-query';
import { Loader2 } from 'lucide-react';

const Inventario = () => {
    const { data: products, isLoading, error } = useInventory();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Inventario de Productos</h1>
                
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Cargando inventario...</span>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                        <p className="font-semibold">Error al cargar inventario</p>
                        <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Error desconocido'}</p>
                    </div>
                )}

                {products && products.length === 0 && !isLoading && (
                    <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
                        <p className="text-muted-foreground">No hay productos disponibles en el inventario</p>
                    </div>
                )}

                {products && products.length > 0 && (
                    <ProductTable products={products} />
                )}
            </div>
        </div>
    );
}

export default Inventario;
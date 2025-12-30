import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSelector } from "@/components/factura/ProductSelector";
import { SelectedProductsList } from "@/components/factura/SelectedProductsList";
import { type Product } from "@/data/products";
import { IMEIAPIService } from "@/services/api";

const Factura = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

const handleAddProduct = (product: Product) => {
    setSelectedProducts((prev) => [...prev, product]);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.id === productId);
      if (index !== -1) {
        const newProducts = [...prev];
        newProducts.splice(index, 1);
        return newProducts;
      }
      return prev;
    });
  };

  const handleGeneratePDF = () => {
    console.log("Generando PDF con productos:", selectedProducts);
     // Generar/abrir preview de PDF al agregar producto
    IMEIAPIService.getInvoiceTestPdfPreview()
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, "_blank");
        // Limpieza opcional: revocar URL tras unos segundos
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      })
      .catch((err) => {
        console.error("Error generando PDF:", err);
      }); 
  };

  const canGeneratePDF = selectedProducts.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-2 py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Sistema de Cotización
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Selecciona tus productos
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Elige los iPhones que deseas incluir en tu cotización y genera un PDF profesional
            </p>
          </div>

          {/* Product Selector Card */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Agregar producto
              </label>
              <ProductSelector
                onAddProduct={handleAddProduct}
                selectedProducts={selectedProducts}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                Productos seleccionados
              </h3>
              <SelectedProductsList
                products={selectedProducts}
                onRemoveProduct={handleRemoveProduct}
              />
            </div>

            {/* Generate PDF Button */}
            <Button
              variant="generate"
              size="lg"
              className="w-full"
              disabled={!canGeneratePDF}
              onClick={handleGeneratePDF}
            >
              <FileText className="w-5 h-5" />
              {canGeneratePDF
                ? "Generar PDF"
                : "Selecciona productos para continuar"}
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground">
            Los precios están en USD y pueden variar según disponibilidad
          </p>
        </div>
      </main>
    </div>
  );
};

export default Factura;

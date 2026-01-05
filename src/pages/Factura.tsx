import { useState } from "react";
import { FileText, Sparkles, UserSearch, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSelector } from "@/components/factura/ProductSelector";
import { SelectedProductsList } from "@/components/factura/SelectedProductsList";
import type { ProductVariant } from "@/types/productsType";
import { DniSearch } from "@/components/factura/DniSearch";
import { useInvoiceTestPdfPreview } from "@/services/api-query";

// Tipo extendido para incluir información del producto base
interface SelectedProduct extends ProductVariant {
  baseProductId: number;
  baseProductName: string;
  category: string;
  description: string;
}

const Factura = () => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const { mutateAsync: generateInvoiceTestPdf, isPending: isGeneratingPdf } = useInvoiceTestPdfPreview();

  const handleAddProduct = (product: SelectedProduct) => {
    setSelectedProducts((prev) => [...prev, { ...product, quantity: 1 }]);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.id.toString() === productId);
      if (index !== -1) {
        const newProducts = [...prev];
        newProducts.splice(index, 1);
        return newProducts;
      }
      return prev;
    });
  };

  const handleGeneratePDF = async () => {
    // Crear el body con la estructura de Invoice
  const invoiceBody = {
    order_date: new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "2-digit" 
    }),
    order_number: `W${Date.now().toString().slice(-10)}`, // Generar número único
    customer: {
      name: "Geraldine Eva Flores Flores", // Dato estático por ahora
      customer_number: "900007" // Dato estático por ahora
    },
    products: selectedProducts.map((product) => ({
      name: product.baseProductName,
      product_number: product.id.toString(),
      serial_number: product.serial_numbers?.[0] || `SN${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      item_price: product.price,
      quantity_ordered: 1,
      quantity_fulfilled: 1,
      extended_price: product.price,
    })),
    invoice_info: {
      invoice_number: `MA${Date.now().toString().slice(-8)}`, // Generar número único
      invoice_date: new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "2-digit" 
      })
    }
  };

  // Mostrar la estructura por consola
  console.log("Body para enviar al backend:", JSON.stringify(invoiceBody, null, 2));
  console.log("Objeto invoice:", invoiceBody);

    try {
      const pdfBlob = await generateInvoiceTestPdf();
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Error generando PDF:", err);
    }
  };

  const canGeneratePDF = selectedProducts.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Sistema de Cotizaciones
                </h1>
                <p className="text-xs text-muted-foreground">
                  Genera cotizaciones profesionales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Selecciona los productos iPhone para tu cotización. Consulta el DNI del cliente y genera un PDF profesional.
              </p>
            </div>

            {/* DNI Search Module */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserSearch className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  Consulta por DNI
                </h3>
              </div>
              <DniSearch />
            </div>

            {/* Product Selector Card */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  Agregar productos
                </h3>
              </div>
              <ProductSelector
                onAddProduct={handleAddProduct}
                selectedProducts={selectedProducts}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Selected Products Card */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Productos seleccionados
                </h3>
                {selectedProducts.length > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {selectedProducts.length} {selectedProducts.length === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
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
              disabled={!canGeneratePDF || isGeneratingPdf}
              onClick={handleGeneratePDF}
            >
              <FileText className="w-5 h-5 mr-2" />
              {isGeneratingPdf ? "Generando..." : "Generar PDF de Cotización"}
            </Button>

            {!canGeneratePDF && (
              <p className="text-xs text-muted-foreground text-center">
                Agrega al menos un producto para generar el PDF
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Los precios están en USD y pueden variar según disponibilidad
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Factura;

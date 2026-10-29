import { useState } from "react";
import { FileText, Sparkles, UserSearch, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSelector } from "@/components/Recibo/ProductSelector";
import { SelectedProductsList } from "@/components/Recibo/SelectedProductsList";
import type { ProductVariant } from "@/types/productsType";
import { DniSearch } from "@/components/Recibo/DniSearch";
import { DatePickerCard } from "@/components/Recibo/DatePicker";
import { useInvoiceTestPdfPreview, useBulkToggleSoldItems, useProducts } from "@/services/api-query";
import { format } from "date-fns";
import { PaymentInfo, type PaymentData } from "@/components/Recibo/PaymentInfo";

// Tipo extendido para incluir información del producto base
interface SelectedProduct extends ProductVariant {
  baseProductId: number;
  baseProductName: string;
  category: string;
  description?: string;
}

interface DniResult {
  full_name: string;
  document_number: string;
  phone?: string;
}

const createInitialPaymentData = (): PaymentData => ({
  tipo: "FINAL",
  departamento: "",
  provincia: "",
  provinciaAdicional: "",
  agencia: "OFICINA",
  olva: "",
  frank: "",
  vendedor: "",
  numero: "",
  precioFinal: "",
  envio: "",
  accesorio: "",
  banco: "",
  total: "",
  titular: "",
  numero_operacion: "",
  fecha_transferencia: "",
});

const Factura = () => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [includeImei, setIncludeImei] = useState(true);
  const [customerData, setCustomerData] = useState<DniResult | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<{
    message: string;
    type: "error" | "warning";
  } | null>(null);
  const { mutateAsync: generateInvoiceTestPdf, isPending: isGeneratingPdf } = useInvoiceTestPdfPreview();
  const { mutateAsync: bulkToggleSold, isPending: isTogglingStatus } = useBulkToggleSoldItems();
  const { refetch: refetchProducts } = useProducts();
  const [paymentData, setPaymentData] = useState<PaymentData>(createInitialPaymentData);
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
    setGenerationNotice(null);

    // Extraer los IDs de los product_items de los productos seleccionados
    const itemIds: number[] = [];

    selectedProducts.forEach((product) => {
      product.product_items?.forEach((item) => {
        itemIds.push(item.id);
      });
    });

    console.log("IDs de items a marcar como vendidos:", itemIds);

    // Formatear la fecha seleccionada al formato requerido por el backend
    const formattedDate = format(invoiceDate, "MMMM dd, yyyy");
    const optionalAmount = (value: string) => value.trim() ? Number(value) : null;

    // Crear el body con la estructura de Invoice
    const invoiceBody = {
      order_date: formattedDate,
      order_number: `W${Date.now().toString().slice(-10)}`, // Generar número único
      customer: {
        name: customerData?.full_name || "Cliente sin nombre",
        dni: customerData?.document_number || "",
        phone: customerData?.phone || ""
      },
      payment_info: {
        tipo: paymentData.tipo,
        agencia: paymentData.agencia?.trim() || null,
        departamento: paymentData.departamento?.trim() || null,
        provincia: paymentData.provincia?.trim() || null,
        provincia_adicional: paymentData.provinciaAdicional?.trim() || null,
        olva: optionalAmount(paymentData.olva),
        frank: optionalAmount(paymentData.frank),
        vendedor: paymentData.vendedor || null,
        numero: optionalAmount(paymentData.numero),
        precio_final: optionalAmount(paymentData.precioFinal),
        envio: optionalAmount(paymentData.envio),
        accesorio: optionalAmount(paymentData.accesorio),
        banco: paymentData.banco?.trim() || null,
        titular: paymentData.titular?.trim() || null,
        total: paymentData.total?.trim() || null,
        numero_operacion: paymentData.numero_operacion?.trim() || null,
        fecha_transferencia: paymentData.fecha_transferencia?.trim() || null,
      },
      include_imei: includeImei,
      products: selectedProducts.map((product) => ({
        product_id: product.baseProductId, // FK a products.id (REQUERIDO)
        variant_id: product.id, // FK a product_variants.id (opcional)
        product_item_id: product.product_items?.[0]?.id ?? null, // FK a product_items.id
        name: product.description || product.baseProductName,
        product_number: product.product_number ?? product.id.toString(),
        item_price: product.price,
        quantity_ordered: 1,
        quantity_fulfilled: 1,
        extended_price: product.price,
      })),
      invoice_info: {
        invoice_number: `MA${Date.now().toString().slice(-8)}`, // Generar número único
        invoice_date: formattedDate
      }
    };
    console.log("Body para enviar al backend:", JSON.stringify(invoiceBody, null, 2));
    console.log();
    try {
      // Primero cambiar el estado de los productos a "sold"
      if (itemIds.length > 0) {
        await bulkToggleSold(itemIds);
        console.log("Estados actualizados correctamente");
      }

      // Luego generar el PDF
      const pdfResult = await generateInvoiceTestPdf(invoiceBody);
      const url = URL.createObjectURL(pdfResult.blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      const warnings: string[] = [];
      if (pdfResult.googleSheetSaved === false) {
        warnings.push(
          "El PDF se generó, pero no se pudo guardar la fila en Google Sheets. Revisa los permisos del Sheet."
        );
      }

      // Refetch de productos para actualizar la lista con los nuevos estados
      setIsRefreshingProducts(true);
      try {
        await refetchProducts();
      } catch (refreshError) {
        console.error("El PDF se generó, pero no se pudo actualizar el inventario:", refreshError);
        warnings.push("No se pudo actualizar el inventario después de generar el PDF.");
      } finally {
        setIsRefreshingProducts(false);
      }

      // Reiniciar el formulario después de generar el PDF correctamente.
      setSelectedProducts([]);
      setIncludeImei(true);
      setCustomerData(null);
      setPaymentData(createInitialPaymentData());
      setInvoiceDate(new Date());
      setResetKey((prev) => prev + 1);
      if (warnings.length > 0) {
        setGenerationNotice({ type: "warning", message: warnings.join(" ") });
      }
    } catch (err) {
      console.error("Error en el proceso:", err);
      setGenerationNotice({
        type: "error",
        message: err instanceof Error ? err.message : "No se pudo completar la cotización.",
      });
    }
  };

  const canGeneratePDF = selectedProducts.length > 0 && customerData !== null;
  const hasIPhone = selectedProducts.some((product) =>
    product.category.toLowerCase().includes("iphone") ||
    product.baseProductName.toLowerCase().includes("iphone")
  );
  const isProcessing = isGeneratingPdf || isTogglingStatus || isRefreshingProducts;

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

            {/* Date Picker */}
            <DatePickerCard date={invoiceDate} onDateChange={setInvoiceDate} />

            {/* DNI Search Module */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserSearch className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  Consulta por DNI
                </h3>
              </div>
              <DniSearch key={resetKey} onCustomerDataChange={setCustomerData} />
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
                key={resetKey}
                onAddProduct={handleAddProduct}
                selectedProducts={selectedProducts}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Info Card */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  Información de pago
                </h3>
              </div>
              <PaymentInfo
                key={resetKey}
                data={paymentData}
                onChange={setPaymentData}
                customerData={customerData}
                invoiceDate={invoiceDate}
              />
            </div>

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
              <label
                className={`flex items-center gap-2 text-sm ${
                  hasIPhone ? "text-foreground" : "text-muted-foreground opacity-40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeImei}
                  disabled={!hasIPhone}
                  onChange={(event) => setIncludeImei(event.target.checked)}
                  className="h-4 w-4 accent-primary disabled:cursor-not-allowed"
                />
                <span>Generar IMEI</span>
              </label>
            </div>

            {/* Generate PDF Button */}
            <Button
              variant="generate"
              size="lg"
              className="w-full"
              disabled={!canGeneratePDF || isProcessing}
              onClick={handleGeneratePDF}
            >
              <FileText className="w-5 h-5 mr-2" />
              {isProcessing ? "Procesando..." : "Generar PDF de Cotización"}
            </Button>

            {generationNotice && (
              <p
                role="alert"
                className={`text-sm text-center ${
                  generationNotice.type === "error" ? "text-destructive" : "text-amber-700"
                }`}
              >
                {generationNotice.message}
              </p>
            )}

            {!canGeneratePDF && (
              <p className="text-xs text-muted-foreground text-center">
                {!customerData
                  ? "Consulta el DNI del cliente y agrega productos para generar el PDF"
                  : "Agrega al menos un producto para generar el PDF"
                }
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

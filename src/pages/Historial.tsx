import { Loader2, AlertCircle, TableIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHistorialInvoices } from "@/services/api-query";
import type { QuantumRow, HistorialInvoice } from "@/types/historyType";

const NULL_DISPLAY = "—";

function flattenInvoices(invoices: HistorialInvoice[]): QuantumRow[] {
  const rows: QuantumRow[] = [];

  for (const inv of invoices) {
    const customer = inv.customers;
    const baseRow = {
      invoiceId: inv.id,
      dpto: inv.shipping_department ?? null,
      provincia: inv.shipping_province ?? null,
      agencia: inv.shipping_agency ?? null,
      dni: customer?.dni ?? null,
      cliente: customer?.name ?? null,
      telefono: customer?.phone ?? null,
      fechaVenta: inv.invoice_date ?? null,
      banco: inv.bank_name ?? null,
      total: inv.payment_total ?? null,
      titular: inv.payment_holder ?? null,
    };

    if (!inv.invoice_products || inv.invoice_products.length === 0) {
      rows.push({
        ...baseRow,
        invoiceProductId: inv.id * -1,
        producto: null,
        detalle: null,
        color: null,
        gb: null,
        serie: null,
      });
    } else {
      for (const ip of inv.invoice_products) {
        rows.push({
          ...baseRow,
          invoiceProductId: ip.id,
          producto: ip.products?.category ?? null,
          detalle: ip.products?.name ?? null,
          color: ip.product_variants?.color ?? null,
          gb: ip.product_variants?.capacity ?? null,
          serie: ip.product_items?.serial_number ?? null,
        });
      }
    }
  }

  return rows;
}

const val = (v: string | number | null) =>
  v === null || v === "" ? NULL_DISPLAY : String(v);

const formatTotal = (n: number | null) =>
  n === null ? NULL_DISPLAY : `S/. ${n.toFixed(2)}`;

export default function Quantum() {
  const { data: invoices, isLoading, isError, error } = useHistorialInvoices();

  const rows = invoices ? flattenInvoices(invoices) : [];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TableIcon className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">Quantum</h1>
        {!isLoading && !isError && (
          <span className="ml-auto text-xs text-muted-foreground">
            {rows.length} {rows.length === 1 ? "fila" : "filas"}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando historial...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-20 gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error instanceof Error ? error.message : "Error al cargar el historial"}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="rounded-md border overflow-x-auto">
          <Table className="text-xs whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead>PRODUCTO</TableHead>
                <TableHead>DETALLE</TableHead>
                <TableHead>COLOR</TableHead>
                <TableHead>GB</TableHead>
                <TableHead>SERIE</TableHead>
                <TableHead>DPTO</TableHead>
                <TableHead>PROVI.</TableHead>
                <TableHead>AGENCIA</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>CLIENTE</TableHead>
                <TableHead>TELÉFONO</TableHead>
                <TableHead>FECHA V.</TableHead>
                <TableHead>BANCO</TableHead>
                <TableHead>S/. TOTAL</TableHead>
                <TableHead>TITULAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-12 text-muted-foreground">
                    No hay registros aún
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={`${row.invoiceId}-${row.invoiceProductId}`}>
                    <TableCell>{val(row.producto)}</TableCell>
                    <TableCell>{val(row.detalle)}</TableCell>
                    <TableCell>{val(row.color)}</TableCell>
                    <TableCell>{val(row.gb)}</TableCell>
                    <TableCell className="font-mono">{val(row.serie)}</TableCell>
                    <TableCell>{val(row.dpto)}</TableCell>
                    <TableCell>{val(row.provincia)}</TableCell>
                    <TableCell>{val(row.agencia)}</TableCell>
                    <TableCell className="font-mono">{val(row.dni)}</TableCell>
                    <TableCell>{val(row.cliente)}</TableCell>
                    <TableCell>{val(row.telefono)}</TableCell>
                    <TableCell>{val(row.fechaVenta)}</TableCell>
                    <TableCell>{val(row.banco)}</TableCell>
                    <TableCell className="font-medium">{formatTotal(row.total)}</TableCell>
                    <TableCell>{val(row.titular)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

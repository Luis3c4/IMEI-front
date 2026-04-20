import { useState, useDeferredValue } from "react";
import { Users, Search, UserCircle, Phone, CreditCard, Calendar, Loader2, AlertCircle, Package, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomers, useCustomerInvoices, useOpenInvoicePdf, type CustomerInvoice } from "@/services/api-query";
import { useAuth } from "@/hooks/useAuth";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
};

const PAGE_SIZE = 20;

function InvoicesModal({
  customerId,
  customerName,
  onClose,
}: {
  customerId: number;
  customerName: string;
  onClose: () => void;
}) {
  const { data: invoices, isLoading, isError } = useCustomerInvoices(customerId);
  const { mutate: openPdf, isPending } = useOpenInvoicePdf();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Facturas de {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando facturas...
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-10 gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              Error al cargar facturas
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <FileText className="h-6 w-6 opacity-30" />
              <p className="text-sm">Este cliente no tiene facturas aún</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {invoices.map((inv: CustomerInvoice) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 px-1"
                >
                  <div className="space-y-0.5">
                    <p className="text-[0.8125rem] font-medium text-foreground">
                      {inv.order_number ?? inv.invoice_number}
                    </p>
                    <p className="text-[0.6875rem] text-muted-foreground">
                      {inv.invoice_date}
                    </p>
                  </div>
                  <button
                    onClick={() => openPdf(inv.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    Ver PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Clients = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [invoiceModal, setInvoiceModal] = useState<{ id: number; name: string } | null>(null);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Admin ve todos los clientes; user solo los suyos
  const filterUserId = isAdmin ? undefined : user?.id;
  const { data, isLoading, isError, error } = useCustomers(filterUserId, deferredSearch || undefined, page, PAGE_SIZE, isAuthenticated);

  const clients = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {invoiceModal && (
        <InvoicesModal
          customerId={invoiceModal.id}
          customerName={invoiceModal.name}
          onClose={() => setInvoiceModal(null)}
        />
      )}
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Clientes</h1>
                <p className="text-xs text-muted-foreground">
                  Gestiona tu base de clientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {isLoading ? "Cargando..." : `${total} registrados`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Actions bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nombre, DNI o teléfono..."
                className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando clientes...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-destructive text-sm">
                <AlertCircle className="h-6 w-6" />
                <p>{error instanceof Error ? error.message : "Error al cargar clientes"}</p>
              </div>
            ) : (
              <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
                    #
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Cliente
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
                    DNI
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Teléfono
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Registro
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Productos
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    Recibo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell colSpan={7} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UserCircle className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No se encontraron clientes</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client, i) => (
                    <TableRow
                      key={client.id}
                      className="border-border/40 hover:bg-accent/30 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5 text-xs text-muted-foreground font-medium">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <UserCircle className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate text-[0.8125rem]">
                              {client.first_last_name} {client.second_last_name}
                            </p>
                            <p className="text-[0.6875rem] text-muted-foreground truncate">
                              {client.first_name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          {client.dni}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(client.created_at ?? "")}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 max-w-55">
                        {client.products && client.products.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {client.products.map((p) => (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-medium text-primary"
                              >
                                <Package className="h-2.5 w-2.5" />
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-center">
                      <button
                          onClick={() => setInvoiceModal({
                            id: client.id,
                            name: `${client.first_name} ${client.first_last_name}`,
                          })}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="Ver recibo"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">
                Página <span className="font-medium text-foreground">{page}</span> de{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
                {" "}·{" "}
                <span className="font-medium text-foreground">{total}</span> clientes
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border text-xs font-medium transition-colors ${
                          page === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Clients;

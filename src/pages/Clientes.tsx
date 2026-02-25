import { useState, useDeferredValue } from "react";
import { Users, Search, UserCircle, Phone, CreditCard, Calendar, Loader2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/services/api-query";

interface Client {
  id: number;
  name?: string;
  dni?: string;
  phone?: string;
  created_at?: string;
  first_name?: string;
  first_last_name?: string;
  second_last_name?: string;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
};

const Clients = () => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, isError, error } = useCustomers(deferredSearch || undefined);

  const clients: Client[] = data?.data ?? [];
  const total = data?.total ?? 0;

  const filtered = clients.filter(
    (c) =>
      (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.dni ?? "").includes(search) ||
      (c.phone ?? "").includes(search)
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
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
                onChange={(e) => setSearch(e.target.value)}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell colSpan={5} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UserCircle className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No se encontraron clientes</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((client, i) => (
                    <TableRow
                      key={client.id}
                      className="border-border/40 hover:bg-accent/30 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5 text-xs text-muted-foreground font-medium">
                        {i + 1}
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clients;

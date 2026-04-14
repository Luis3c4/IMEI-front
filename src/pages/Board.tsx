import { useState } from "react";
import { ClipboardList, Plus, UserSearch } from "lucide-react";
import { KanbanColumn } from "../components/board/KanbanCoulumn";
import { ClientCard, type ClientData } from "../components/board/ClientCard";
import { DniSearch } from "@/components/Recibo/DniSearch";
import { DatePickerCard } from "@/components/Recibo/DatePicker";
import { BoardProductSelector } from "@/components/board/BoardProductSelector";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    useOrders,
    useCreateOrder,
    useUpdateOrderPhase,
    useDeleteOrder,
} from "@/services/api-query";

export type KanbanPhase = "pedido" | "reservado" | "entregado" | "completado";

const PHASES: { key: KanbanPhase; label: string }[] = [
    { key: "pedido", label: "Pedido" },
    { key: "reservado", label: "Reservado" },
    { key: "entregado", label: "Entregado" },
    { key: "completado", label: "Completado" },
];

export const KanbanBoard = () => {
    const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
    const [customerData, setCustomerData] = useState<{
        full_name: string;
        document_number: string;
        phone?: string;
    } | null>(null);
    const [interestedProducts, setInterestedProducts] = useState<{
        label: string;
        product_id: number;
        variant_id: number | null;
        unit_price: number;
    }[]>([]);

    const { data: orders = [], isLoading } = useOrders();
    const createOrder = useCreateOrder();
    const updatePhase = useUpdateOrderPhase();
    const deleteOrder = useDeleteOrder();

    // Map API orders → ClientData for display
    const cards: ClientData[] = orders.map((o) => ({
        id: o.id,
        dni: o.customer_dni ?? "",
        fullName: o.customer_name ?? "",
        telefono: o.customer_phone ?? "",
        fecha: o.order_date,
        products: o.products.map((p) => ({ label: p.label, unit_price: p.unit_price })),
        phase: o.phase,
    }));

    const handleAddClient = () => {
        if (!customerData || interestedProducts.length === 0) return;

        createOrder.mutate(
            {
                customer_dni: customerData.document_number,
                customer_name: customerData.full_name,
                customer_phone: customerData.phone,
                order_date: format(invoiceDate, "dd/MM/yyyy"),
                products: interestedProducts,
            },
            {
                onSuccess: () => {
                    setCustomerData(null);
                    setInterestedProducts([]);
                },
            }
        );
    };

    const handleMoveCard = (id: string, newPhase: KanbanPhase) => {
        updatePhase.mutate({ orderId: id, phase: newPhase });
    };

    const handleDeleteCard = (id: string) => {
        deleteOrder.mutate(id);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">Gestión de Pedidos</h1>
                                <p className="text-xs text-muted-foreground">
                                    Administra el flujo de tus cotizaciones y pedidos
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                {isLoading ? "…" : `${cards.length} pedidos`}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:min-h-109">
                    {/* Left: Date + DniSearch + customer result */}
                    <div className="space-y-4 ">
                        <DatePickerCard date={invoiceDate} onDateChange={setInvoiceDate} />

                        <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <UserSearch className="w-5 h-5 text-primary" />
                                <h3 className="text-sm font-medium text-foreground">
                                    Consulta por DNI
                                </h3>
                            </div>
                            <DniSearch onCustomerDataChange={setCustomerData} />
                        </div>
                    </div>

                    {/* Right: product interest selector */}
                    <div className="bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col gap-3 md:max-h-109">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Producto de interés</p>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <BoardProductSelector
                                selected={interestedProducts}
                                onChange={setInterestedProducts}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleAddClient}
                        disabled={!customerData || interestedProducts.length === 0 || createOrder.isPending}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {createOrder.isPending ? "Guardando…" : "Agregar Pedido"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {PHASES.map((phase) => {
                        const phaseCards = cards.filter((c) => c.phase === phase.key);
                        return (
                            <KanbanColumn
                                key={phase.key}
                                phase={phase.key}
                                label={phase.label}
                                count={phaseCards.length}
                            >
                                {phaseCards.map((card) => (
                                    <ClientCard
                                        key={card.id}
                                        data={card}
                                        onMove={handleMoveCard}
                                        onDelete={handleDeleteCard}
                                    />
                                ))}
                            </KanbanColumn>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

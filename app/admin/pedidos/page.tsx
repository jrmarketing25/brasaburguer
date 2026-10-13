"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  DollarSign,
  Phone,
  RefreshCw,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCentsToBRL, formatDateTime } from "@/lib/utils/formatters";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  order_type: "delivery" | "pickup" | "dine_in";
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  delivery_address: any;
  payment_method: string;
  payment_status: string;
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  notes: string | null;
  whatsapp_message: string | null;
  created_at: string;
  order_items?: {
    id: string;
    product_name: string;
    unit_price_cents: number;
    quantity: number;
    subtotal_cents: number;
    customizations: any;
    notes: string | null;
  }[];
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-amber-950/60 border-amber-800/60 text-amber-300" },
  confirmed: { label: "Confirmado", color: "bg-blue-950/60 border-blue-800/60 text-blue-300" },
  preparing: { label: "Em Preparo", color: "bg-purple-950/60 border-purple-800/60 text-purple-300" },
  ready: { label: "Pronto", color: "bg-cyan-950/60 border-cyan-800/60 text-cyan-300" },
  out_for_delivery: { label: "Em Entrega", color: "bg-orange-950/60 border-orange-800/60 text-[#FF6A00]" },
  delivered: { label: "Entregue", color: "bg-emerald-950/60 border-emerald-800/60 text-emerald-300" },
  cancelled: { label: "Cancelado", color: "bg-red-950/60 border-red-800/60 text-red-300" },
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal de Detalhes
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          order_type,
          status,
          delivery_address,
          payment_method,
          payment_status,
          subtotal_cents,
          delivery_fee_cents,
          discount_cents,
          total_cents,
          notes,
          whatsapp_message,
          created_at,
          order_items (
            id,
            product_name,
            unit_price_cents,
            quantity,
            subtotal_cents,
            customizations,
            notes
          )
        `)
        .eq("store_id", STORE_ID)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as OrderRow[]) || []);
    } catch (err: any) {
      console.error("Erro ao carregar pedidos:", err);
      alert(`Falha ao buscar pedidos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (newStatus: OrderRow["status"]) => {
    if (!selectedOrder) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      setIsUpdatingStatus(true);
      const { error } = await client
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-xs text-zinc-400">
            Acompanhe o fluxo de pedidos registrados em tempo real no banco PostgreSQL.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Pedidos</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#161616] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número do pedido (#BB-...), cliente ou telefone..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-xs text-[#F3E3C7] placeholder-zinc-600 focus:outline-none focus:border-[#FF6A00]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-[#FF6A00]"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="confirmed">Confirmados</option>
            <option value="preparing">Em Preparo</option>
            <option value="ready">Prontos</option>
            <option value="out_for_delivery">Em Rota de Entrega</option>
            <option value="delivered">Entregues</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos ou Estado Vazio Honesto */}
      <div className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
            <span className="text-xs">Consultando pedidos no PostgreSQL...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-zinc-200">
              Nenhum pedido registrado no banco de dados local
            </div>
            <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
              O banco de dados da hamburgueria não possui pedidos registrados no momento.
              Conforme os clientes realizarem compras ou pedidos forem sincronizados com a tabela{" "}
              <code className="text-[#F3E3C7] font-mono">public.orders</code>, eles aparecerão aqui com status, itens e controle de expedição.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Nenhum pedido corresponde aos filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Modalidade</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] || {
                    label: order.status,
                    color: "bg-zinc-800 text-zinc-300",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/20 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-200">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200">{order.customer_name}</div>
                        <div className="text-[11px] text-zinc-500">{order.customer_phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-zinc-300 capitalize">
                          {order.order_type === "delivery" ? (
                            <Truck className="w-3 h-3 text-[#FF6A00]" />
                          ) : (
                            <Store className="w-3 h-3 text-cyan-400" />
                          )}
                          <span>{order.order_type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#FF6A00]">
                        {formatCentsToBRL(order.total_cents)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          title="Ver Detalhes do Pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          <div className="relative w-full max-w-lg bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-xs max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                  Pedido {selectedOrder.order_number}
                </h2>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Registrado em {formatDateTime(selectedOrder.created_at)}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Cliente */}
              <div className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Dados do Cliente
                </span>
                <div className="text-zinc-200 font-medium">{selectedOrder.customer_name}</div>
                <div className="text-zinc-400 font-mono">{selectedOrder.customer_phone}</div>
                {selectedOrder.customer_email && (
                  <div className="text-zinc-500">{selectedOrder.customer_email}</div>
                )}
              </div>

              {/* Endereço se Delivery */}
              {selectedOrder.delivery_address && (
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Endereço de Entrega
                  </span>
                  <div className="text-zinc-200">
                    {selectedOrder.delivery_address.street}, {selectedOrder.delivery_address.number}
                    {selectedOrder.delivery_address.complement && ` (${selectedOrder.delivery_address.complement})`}
                  </div>
                  <div className="text-zinc-400">
                    Bairro: {selectedOrder.delivery_address.neighborhood}
                  </div>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Itens Selecionados
                </span>
                <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-lg overflow-hidden bg-[#0C0C0C]">
                  {(selectedOrder.order_items || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-200">
                          {item.quantity}x {item.product_name}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-zinc-500">Obs: {item.notes}</div>
                        )}
                      </div>
                      <div className="font-mono text-[#F3E3C7]">
                        {formatCentsToBRL(item.subtotal_cents)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] space-y-1.5 font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span>{formatCentsToBRL(selectedOrder.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Taxa de Entrega:</span>
                  <span>{formatCentsToBRL(selectedOrder.delivery_fee_cents)}</span>
                </div>
                <div className="flex justify-between text-zinc-200 font-bold text-sm pt-1 border-t border-zinc-800">
                  <span>Total do Pedido:</span>
                  <span className="text-[#FF6A00]">{formatCentsToBRL(selectedOrder.total_cents)}</span>
                </div>
              </div>

              {/* Alterar Status */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Atualizar Status da Operação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      "pending",
                      "confirmed",
                      "preparing",
                      "ready",
                      "out_for_delivery",
                      "delivered",
                      "cancelled",
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdatingStatus || selectedOrder.status === st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedOrder.status === st
                          ? "bg-[#FF6A00] text-black border-[#FF6A00] font-semibold"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 disabled:opacity-50"
                      }`}
                    >
                      {STATUS_LABELS[st]?.label || st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  FolderTree,
  ShoppingBag,
  PlusCircle,
  Settings,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCentsToBRL, formatDateTime } from "@/lib/utils/formatters";

interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalCategories: number;
  totalOrders: number;
  recentOrders: any[];
  recentProducts: any[];
  storeName: string;
  isOpen: boolean;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    recentOrders: [],
    recentProducts: [],
    storeName: "BRASA BURGERS",
    isOpen: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      // 1. Produtos
      const { data: products, error: prodErr } = await client
        .from("products")
        .select("id, name, slug, base_price_cents, promo_price_cents, image_url, badge, is_active, created_at, categories(name)")
        .eq("store_id", STORE_ID)
        .order("sort_order", { ascending: true });

      // 2. Categorias
      const { count: catCount } = await client
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("store_id", STORE_ID);

      // 3. Pedidos
      const { data: orders, count: orderCount } = await client
        .from("orders")
        .select("id, order_number, customer_name, total_cents, order_type, status, created_at")
        .eq("store_id", STORE_ID)
        .order("created_at", { ascending: false })
        .limit(5);

      // 4. Loja
      const { data: storeData } = await client
        .from("stores")
        .select("name, is_active")
        .eq("id", STORE_ID)
        .single();

      const allProds = products || [];
      const activeProds = allProds.filter((p) => p.is_active);
      const inactiveProds = allProds.filter((p) => !p.is_active);

      setMetrics({
        totalProducts: allProds.length,
        activeProducts: activeProds.length,
        inactiveProducts: inactiveProds.length,
        totalCategories: catCount || 0,
        totalOrders: orderCount || 0,
        recentOrders: orders || [],
        recentProducts: allProds.slice(0, 5),
        storeName: storeData?.name || "BRASA BURGERS",
        isOpen: storeData?.is_active ?? true,
      });
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* ============================================================== */}
      {/* TOPO COM TÍTULO E AÇÕES                                         */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Visão Geral da Operação
          </h1>
          <p className="text-xs text-zinc-400">
            Métricas em tempo real integradas ao banco local da {metrics.storeName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1C1C1C] hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FF6A00]" : ""}`} />
            <span>Atualizar</span>
          </button>

          <Link
            href="/admin/produtos?novo=1"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition shadow-sm shadow-[#FF6A00]/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARDS DE MÉTRICAS PRINCIPAIS                                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card: Total de Produtos */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#161616] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Produtos Cadastrados</span>
            <UtensilsCrossed className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 font-mono">
              {isLoading ? "..." : metrics.totalProducts}
            </div>
            <span className="text-[11px] text-zinc-500">No catálogo geral</span>
          </div>
        </div>

        {/* Card: Produtos Ativos */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#161616] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Disponíveis</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {isLoading ? "..." : metrics.activeProducts}
            </div>
            <span className="text-[11px] text-zinc-500">Visíveis no cardápio</span>
          </div>
        </div>

        {/* Card: Produtos Indisponíveis */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#161616] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Indisponíveis</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500 font-mono">
              {isLoading ? "..." : metrics.inactiveProducts}
            </div>
            <span className="text-[11px] text-zinc-500">Pausados no momento</span>
          </div>
        </div>

        {/* Card: Categorias */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#161616] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Categorias</span>
            <FolderTree className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-400 font-mono">
              {isLoading ? "..." : metrics.totalCategories}
            </div>
            <span className="text-[11px] text-zinc-500">Seções ativas</span>
          </div>
        </div>

        {/* Card: Pedidos Registrados */}
        <div className="col-span-2 lg:col-span-1 rounded-xl border border-zinc-800/80 bg-[#161616] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Pedidos Registrados</span>
            <ShoppingBag className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FF6A00] font-mono">
              {isLoading ? "..." : metrics.totalOrders}
            </div>
            <span className="text-[11px] text-zinc-500">Total no banco local</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ATALHOS RÁPIDOS                                                */}
      {/* ============================================================== */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/produtos"
            className="p-3.5 rounded-xl border border-zinc-800 bg-[#161616] hover:bg-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200">Produtos</div>
                <div className="text-[11px] text-zinc-500">Preços & Fotos</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
          </Link>

          <Link
            href="/admin/categorias"
            className="p-3.5 rounded-xl border border-zinc-800 bg-[#161616] hover:bg-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                <FolderTree className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200">Categorias</div>
                <div className="text-[11px] text-zinc-500">Organização</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
          </Link>

          <Link
            href="/admin/entregas"
            className="p-3.5 rounded-xl border border-zinc-800 bg-[#161616] hover:bg-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200">Taxas & Bairros</div>
                <div className="text-[11px] text-zinc-500">Frete & Regiões</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="p-3.5 rounded-xl border border-zinc-800 bg-[#161616] hover:bg-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200">Cardápio</div>
                <div className="text-[11px] text-zinc-500">Visão do Cliente</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABELAS REAIS DO BANCO                                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Produtos no Catálogo */}
        <div className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Produtos no Catálogo ({metrics.totalProducts})
            </h3>
            <Link
              href="/admin/produtos"
              className="text-xs text-[#FF6A00] hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {metrics.recentProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Nenhum produto cadastrado no banco local.
              </div>
            ) : (
              metrics.recentProducts.map((prod) => (
                <div key={prod.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-800/30 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50">
                      <Image
                        src={prod.image_url || "/images/products/brasa-classico.webp"}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate flex items-center gap-1.5">
                        <span className="truncate">{prod.name}</span>
                        {prod.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-400">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {prod.categories?.name || "Sem categoria"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-[#F3E3C7] font-mono">
                      {formatCentsToBRL(prod.base_price_cents)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px]">
                      {prod.is_active ? (
                        <span className="text-emerald-400 font-medium">Ativo</span>
                      ) : (
                        <span className="text-amber-500 font-medium">Inativo</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Pedidos Registrados */}
        <div className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Pedidos Recentes no Banco
            </h3>
            <Link
              href="/admin/pedidos"
              className="text-xs text-[#FF6A00] hover:underline flex items-center gap-1"
            >
              <span>Gerenciar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div>
            {metrics.totalOrders === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-zinc-300">
                  Nenhum pedido registrado no PostgreSQL
                </div>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  Os pedidos submetidos pelo checkout público ou inseridos na base aparecerão aqui com status em tempo real.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {metrics.recentOrders.map((order) => (
                  <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-800/30 transition">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 font-mono">
                        {order.order_number}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {order.customer_name} • {order.order_type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#FF6A00] font-mono">
                        {formatCentsToBRL(order.total_cents)}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatDateTime(order.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { defaultStoreConfig } from "@/lib/config/store.config";
import {
  Trash2,
  Plus,
  Minus,
  X,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Bike,
  Star,
  Heart,
  MessageSquare,
} from "lucide-react";

export function DesktopCartSidebar() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotalProductsCents = useCartStore(
    (state) => state.getSubtotalProductsCents
  );
  const getTotalAddOnsCents = useCartStore(
    (state) => state.getTotalAddOnsCents
  );
  const getTotalItemsCount = useCartStore(
    (state) => state.getTotalItemsCount
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemsCount = mounted ? getTotalItemsCount() : 0;
  const subtotalProductsCents = mounted ? getSubtotalProductsCents() : 0;
  const totalAddOnsCents = mounted ? getTotalAddOnsCents() : 0;
  const itemsSubtotalCents = subtotalProductsCents + totalAddOnsCents;

  const isFreeDelivery =
    Boolean(defaultStoreConfig.delivery.freeDeliveryThresholdCents) &&
    itemsSubtotalCents >= (defaultStoreConfig.delivery.freeDeliveryThresholdCents || 0);

  const deliveryFeeCents = isFreeDelivery
    ? 0
    : defaultStoreConfig.delivery.feeCents;

  const totalCents = itemsSubtotalCents + deliveryFeeCents;

  return (
    <aside className="w-72 2xl:w-80 shrink-0 self-start sticky top-20 rounded-2xl border border-brasa-border bg-brasa-surface p-4 shadow-card flex flex-col max-h-[calc(100vh-6rem)]">
      {/* 1. Cabeçalho do Carrinho */}
      <div className="flex items-center justify-between border-b border-brasa-border/60 pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-brasa-orange" />
          <h3 className="font-bebas text-lg tracking-wide uppercase text-brasa-cream">
            Seu Pedido ({itemsCount})
          </h3>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
            title="Esvaziar carrinho"
            aria-label="Esvaziar carrinho"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 2. Lista de Itens com rolagem interna */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3 min-h-[140px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brasa-bg border border-brasa-border text-zinc-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">
              Seu carrinho está vazio
            </p>
            <p className="text-[11px] text-zinc-600 max-w-[180px]">
              Clique em adicionar para montar seu burger na brasa.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const itemTotal = item.unitPriceCents * item.quantity;
            return (
              <div
                key={item.cartItemId}
                className="group relative flex gap-2.5 rounded-xl border border-brasa-border/40 bg-brasa-bg/70 p-2.5 transition-all hover:border-brasa-border"
              >
                {/* Miniatura quadrada da foto */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/60 border border-brasa-border/30">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    style={{ objectPosition: "center 45%" }}
                  />
                </div>

                {/* Conteúdo e ações */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bebas text-sm uppercase tracking-wide text-brasa-cream truncate leading-tight">
                      {item.product.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-zinc-500 hover:text-red-400 p-0.5"
                      aria-label={`Remover ${item.product.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Resumo de adicionais */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-[10px] text-zinc-400 truncate">
                      {item.selectedOptions.map((o) => o.name).join(", ")}
                    </p>
                  )}

                  {/* Quantidade e preço */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center rounded-lg border border-brasa-border bg-brasa-surface px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="h-4 w-4 flex items-center justify-center text-zinc-400 hover:text-brasa-cream"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="w-5 text-center font-mono text-[10px] font-bold text-brasa-cream">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="h-4 w-4 flex items-center justify-center text-zinc-400 hover:text-brasa-cream"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-brasa-cream">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Resumo Financeiro e CTA */}
      <div className="border-t border-brasa-border/60 pt-3 space-y-2.5 mt-auto">
        <div className="space-y-1.5 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-brasa-cream">
              {formatCurrency(itemsSubtotalCents)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Taxa de entrega</span>
            <span className="font-mono text-brasa-cream">
              {items.length === 0
                ? "—"
                : isFreeDelivery
                ? "Grátis"
                : formatCurrency(deliveryFeeCents)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1 border-t border-brasa-border/40 font-bold">
            <span className="font-bebas text-base uppercase text-brasa-cream">
              Total
            </span>
            <span className="font-mono text-lg text-brasa-orange">
              {formatCurrency(items.length === 0 ? 0 : totalCents)}
            </span>
          </div>
        </div>

        {/* Botão de Finalização / Acesso ao Checkout */}
        <Link
          href="/carrinho"
          className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
            items.length > 0
              ? "bg-emerald-500 hover:bg-emerald-600 text-black"
              : "bg-zinc-800 text-zinc-500 pointer-events-none"
          }`}
        >
          <MessageSquare className="h-4 w-4 fill-current shrink-0" />
          <span>Finalizar Pedido</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        {/* Selos de Confiança na Base */}
        <div className="pt-2 border-t border-brasa-border/40 grid grid-cols-3 gap-1 text-center text-[9px] text-zinc-500">
          <div className="flex flex-col items-center gap-0.5">
            <Bike className="h-3 w-3 text-brasa-orange" />
            <span className="leading-tight">Entrega rápida</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Star className="h-3 w-3 text-brasa-orange" />
            <span className="leading-tight">Ingredientes top</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="h-3 w-3 text-brasa-orange" />
            <span className="leading-tight">Sabor único</span>
          </div>
        </div>
      </div>
    </aside>
  );
}


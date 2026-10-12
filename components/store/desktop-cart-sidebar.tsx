"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { defaultStoreConfig } from "@/lib/config/store.config";
import { WhatsAppOfficialIcon } from "@/components/store/menu-icons";
import {
  Trash2,
  Plus,
  Minus,
  X,
  ShoppingBag,
  ArrowRight,
  Lock,
  Bike,
  Star,
  Heart,
  Tag,
  Info,
} from "lucide-react";

export function DesktopCartSidebar() {
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
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
    <aside className="w-80 xl:w-[330px] 2xl:w-[350px] shrink-0 self-start sticky top-20 rounded-2xl border border-zinc-800 bg-[#161616] p-3.5 xl:p-4 shadow-card flex flex-col max-h-[calc(100vh-5.5rem)]">
      {/* 1. Cabeçalho do Carrinho */}
      <div className="flex items-center justify-between border-b border-zinc-800/90 pb-2.5">
        <h3 className="font-bebas text-xl tracking-wider uppercase text-brasa-cream font-normal">
          Seu Pedido
        </h3>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
            title="Esvaziar carrinho"
            aria-label="Esvaziar carrinho"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. Lista de Itens (Mockup Exato) */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2.5 space-y-2 min-h-[100px] max-h-[210px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
              <ShoppingBag className="h-4 w-4" />
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
                className="group relative flex gap-2.5 rounded-xl border border-zinc-800/80 bg-[#141414] p-2 transition-all hover:border-zinc-700"
              >
                {/* Miniatura quadrada da foto */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/60 border border-zinc-800">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    style={{ objectPosition: "center 45%" }}
                  />
                </div>

                {/* Conteúdo central e controles */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Linha superior: Nome do item e Botão de Remover ✕ */}
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-sans text-xs font-bold text-brasa-cream truncate leading-tight">
                      {item.product.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5 -mr-0.5 -mt-0.5 transition-colors"
                      aria-label={`Remover ${item.product.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Resumo de opções/adicionais se houver */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-[9.5px] text-zinc-500 truncate -mt-0.5">
                      {item.selectedOptions.map((o) => o.name).join(", ")}
                    </p>
                  )}

                  {/* Linha inferior: Contador de quantidade e Preço total do item */}
                  <div className="flex items-center justify-between pt-0.5 mt-auto">
                    {/* Contador estilo mockup: - 1 + */}
                    <div className="flex items-center rounded-lg border border-zinc-700/80 bg-zinc-900 px-1.5 py-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="h-3.5 w-3.5 flex items-center justify-center text-zinc-400 hover:text-brasa-cream transition-colors"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="w-4 text-center font-mono text-[10px] font-bold text-brasa-cream">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="h-3.5 w-3.5 flex items-center justify-center text-zinc-400 hover:text-brasa-cream transition-colors"
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

      {/* 3. Campo de Cupom de Desconto (Conforme Mockup) */}
      <div className="pt-2 pb-2.5 border-t border-zinc-800/80">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#121212] px-2.5 py-1.5 text-xs">
          <Tag className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Cupom de desconto"
            className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            type="button"
            className="text-zinc-400 hover:text-white font-medium text-xs transition-colors shrink-0"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* 4. Resumo Financeiro e CTA WhatsApp */}
      <div className="border-t border-zinc-800/80 pt-2.5 space-y-2.5 mt-auto">
        <div className="space-y-1 text-xs text-zinc-400">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-mono text-zinc-300">
              {formatCurrency(itemsSubtotalCents)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Taxa de entrega
              <Info className="h-3 w-3 text-zinc-500" />
            </span>
            <span className="font-mono text-zinc-300">
              {items.length === 0
                ? "—"
                : isFreeDelivery
                ? "Grátis"
                : formatCurrency(deliveryFeeCents)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1 border-t border-zinc-800/80 font-bold">
            <span className="font-bebas text-base uppercase tracking-wider text-brasa-cream">
              Total
            </span>
            <span className="font-bebas text-2xl tracking-wider text-brasa-orange">
              {formatCurrency(items.length === 0 ? 0 : totalCents)}
            </span>
          </div>
        </div>

        {/* 5. Botão de Finalização WhatsApp (Fiel ao Mockup) */}
        <Link
          href="/carrinho"
          className={`flex items-center justify-between w-full h-12 xl:h-13 px-4 rounded-xl font-bold uppercase transition-all shadow-lg active:scale-[0.98] ${
            items.length > 0
              ? "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-glow"
              : "bg-zinc-800 text-zinc-500 pointer-events-none"
          }`}
        >
          {/* Lado Esquerdo: Ícone WhatsApp Oficial + Texto em 2 linhas */}
          <div className="flex items-center gap-2.5">
            <WhatsAppOfficialIcon className="h-6 w-6 text-white fill-white shrink-0" />
            <div className="flex flex-col text-left leading-none font-bebas tracking-wide">
              <span className="text-sm font-bold text-white">FINALIZAR PEDIDO</span>
              <span className="text-sm font-bold text-white">PELO WHATSAPP</span>
            </div>
          </div>

          {/* Seta Direita */}
          <ArrowRight className="h-4 w-4 text-white stroke-[2.5] shrink-0" />
        </Link>

        {/* Selo de Segurança */}
        <div className="flex items-center justify-center gap-1.5 text-center text-[9.5px] text-zinc-500 pt-0.5">
          <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
          <span className="leading-tight">
            Seus dados estão seguros. Finalização direta no WhatsApp.
          </span>
        </div>

        {/* 6. Selos de Confiança na Base */}
        <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-1 text-center text-[9px] text-zinc-400">
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


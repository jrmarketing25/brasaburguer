"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import {
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  itemsCount: number;
  subtotalProductsCents: number;
  totalAddOnsCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  isDelivery: boolean;
  minimumOrderCents: number;
  isStoreOpen: boolean;
  allowAdvanceOrders: boolean;
  isFormValid: boolean;
  isWhatsAppConfigured?: boolean;
  isWhatsAppDemo?: boolean;
  onFinishOrder: () => void;
  isLoading?: boolean;
}

export function OrderSummary({
  itemsCount,
  subtotalProductsCents,
  totalAddOnsCents,
  deliveryFeeCents,
  totalCents,
  isDelivery,
  minimumOrderCents,
  isStoreOpen,
  allowAdvanceOrders,
  isFormValid,
  isWhatsAppConfigured = true,
  isWhatsAppDemo = false,
  onFinishOrder,
  isLoading = false,
}: OrderSummaryProps) {
  const isBelowMinimum = subtotalProductsCents < minimumOrderCents;
  const isStoreClosedBlocked = !isStoreOpen && !allowAdvanceOrders;
  const canSubmit =
    isFormValid &&
    !isBelowMinimum &&
    !isStoreClosedBlocked &&
    isWhatsAppConfigured;

  return (
    <div className="space-y-4 rounded-2xl border border-brasa-border bg-brasa-surface p-4 sm:p-5 shadow-card">
      <h3 className="font-bebas text-lg sm:text-xl tracking-wide uppercase text-brasa-cream border-b border-brasa-border/60 pb-3">
        Resumo do Pedido
      </h3>

      {/* Linhas Financeiras */}
      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-zinc-300">
          <span>Itens do cardápio ({itemsCount})</span>
          <span className="font-mono text-brasa-cream">
            {formatCurrency(subtotalProductsCents)}
          </span>
        </div>

        {totalAddOnsCents > 0 && (
          <div className="flex items-center justify-between text-zinc-300">
            <span>Adicionais e personalizações</span>
            <span className="font-mono text-brasa-orange">
              + {formatCurrency(totalAddOnsCents)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-zinc-300">
          <span>{isDelivery ? "Taxa de entrega" : "Taxa de retirada"}</span>
          <span className="font-mono text-brasa-cream">
            {isDelivery
              ? deliveryFeeCents > 0
                ? formatCurrency(deliveryFeeCents)
                : "Grátis"
              : "R$ 0,00"}
          </span>
        </div>

        <div className="pt-2 border-t border-brasa-border flex items-baseline justify-between">
          <div>
            <span className="font-bebas text-lg uppercase tracking-wide text-brasa-cream">
              Total Geral
            </span>
            <span className="block text-[10px] text-zinc-400">
              Valor final do seu pedido
            </span>
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-brasa-orange drop-shadow-sm">
            {formatCurrency(totalCents)}
          </span>
        </div>
      </div>

      {/* Avisos de Validação de Negócio */}
      {isBelowMinimum && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-semibold">Pedido abaixo do mínimo</p>
            <p className="text-[11px] text-amber-200/80">
              O valor mínimo em produtos é de {formatCurrency(minimumOrderCents)}. Faltam{" "}
              {formatCurrency(minimumOrderCents - subtotalProductsCents)} para atingir o valor.
            </p>
          </div>
        </div>
      )}

      {isStoreClosedBlocked && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2">
          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold">Restaurante fechado no momento</p>
            <p className="text-[11px] text-red-200/80">
              Nosso horário de funcionamento é das 18h00 às 23h30. Não estamos aceitando pedidos antecipados agora.
            </p>
          </div>
        </div>
      )}

      {!isWhatsAppConfigured && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold">WhatsApp da loja não configurado</p>
            <p className="text-[11px] text-red-200/80">
              Por favor, configure o número de atendimento da hamburgueria nas configurações da loja.
            </p>
          </div>
        </div>
      )}

      {isWhatsAppDemo && isWhatsAppConfigured && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <p className="text-[11px] text-amber-200/90 leading-tight">
            <strong>Ambiente Demonstrativo:</strong> Mensagem formatada com sucesso para simulação de pedido via WhatsApp.
          </p>
        </div>
      )}

      {/* Botão de Finalização pelo WhatsApp */}
      <div className="pt-2">
        <Button
          type="button"
          disabled={!canSubmit || isLoading}
          onClick={onFinishOrder}
          size="lg"
          className="w-full h-12 sm:h-13 font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg rounded-xl gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          <MessageSquare className="h-5 w-5 fill-current shrink-0" />
          <span>Finalizar pedido pelo WhatsApp</span>
        </Button>

        <p className="mt-2.5 text-center text-[11px] text-zinc-400 leading-snug flex items-center justify-center gap-1.5 px-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Você será direcionado ao WhatsApp para enviar e confirmar seu pedido com a hamburgueria.</span>
        </p>
      </div>
    </div>
  );
}

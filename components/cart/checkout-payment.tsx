"use client";

import React from "react";
import { PaymentInfo, PaymentMethod } from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { maskCurrency, parseCurrencyToCents } from "@/lib/utils/masks";
import { QrCode, Banknote, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

interface CheckoutPaymentProps {
  payment: PaymentInfo;
  onPaymentChange: (payment: PaymentInfo) => void;
  totalCents: number;
  acceptedMethods?: PaymentMethod[];
  error?: string;
}

export function CheckoutPayment({
  payment,
  onPaymentChange,
  totalCents,
  acceptedMethods = ["pix", "dinheiro", "cartao_entrega"],
  error,
}: CheckoutPaymentProps) {
  const handleMethodSelect = (method: PaymentMethod) => {
    onPaymentChange({
      ...payment,
      method,
      needsChange: method === "dinheiro" ? payment.needsChange : false,
    });
  };

  const handleNeedsChangeToggle = (needs: boolean) => {
    onPaymentChange({
      ...payment,
      needsChange: needs,
      changeForCents: needs ? payment.changeForCents : undefined,
    });
  };

  const handleChangeForInputChange = (rawInput: string) => {
    const cents = parseCurrencyToCents(rawInput);
    onPaymentChange({
      ...payment,
      changeForCents: cents > 0 ? cents : undefined,
    });
  };

  const currentTroco =
    payment.changeForCents && payment.changeForCents >= totalCents
      ? payment.changeForCents - totalCents
      : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-brasa-border bg-brasa-surface p-4 sm:p-5">
      <h3 className="font-bebas text-lg sm:text-xl tracking-wide uppercase text-brasa-cream">
        2. Forma de pagamento
      </h3>

      {/* Grid com opções de pagamento (Responsivo para telas pequenas sem compressão) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {acceptedMethods.includes("pix") && (
          <button
            type="button"
            onClick={() => handleMethodSelect("pix")}
            className={`flex items-center gap-3 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm font-semibold border transition-all active:scale-95 ${
              payment.method === "pix"
                ? "bg-brasa-orange/15 border-brasa-orange text-brasa-cream shadow-sm"
                : "bg-brasa-bg border-brasa-border text-zinc-400 hover:text-brasa-cream"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <QrCode className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-brasa-cream leading-tight">Pix</p>
              <p className="text-[11px] text-zinc-400">Chave na finalização</p>
            </div>
          </button>
        )}

        {acceptedMethods.includes("cartao_entrega") && (
          <button
            type="button"
            onClick={() => handleMethodSelect("cartao_entrega")}
            className={`flex items-center gap-3 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm font-semibold border transition-all active:scale-95 ${
              payment.method === "cartao_entrega"
                ? "bg-brasa-orange/15 border-brasa-orange text-brasa-cream shadow-sm"
                : "bg-brasa-bg border-brasa-border text-zinc-400 hover:text-brasa-cream"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-brasa-cream leading-tight">Cartão</p>
              <p className="text-[11px] text-zinc-400">Débito ou crédito</p>
            </div>
          </button>
        )}

        {acceptedMethods.includes("dinheiro") && (
          <button
            type="button"
            onClick={() => handleMethodSelect("dinheiro")}
            className={`flex items-center gap-3 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm font-semibold border transition-all active:scale-95 ${
              payment.method === "dinheiro"
                ? "bg-brasa-orange/15 border-brasa-orange text-brasa-cream shadow-sm"
                : "bg-brasa-bg border-brasa-border text-zinc-400 hover:text-brasa-cream"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Banknote className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-brasa-cream leading-tight">Dinheiro</p>
              <p className="text-[11px] text-zinc-400">Com opção de troco</p>
            </div>
          </button>
        )}
      </div>

      {/* Opções de Troco (Apenas quando Dinheiro selecionado) */}
      {payment.method === "dinheiro" && (
        <div className="rounded-xl border border-brasa-border/80 bg-brasa-bg/70 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-zinc-300">
              Precisa de troco?
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleNeedsChangeToggle(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  !payment.needsChange
                    ? "bg-brasa-orange text-black border-brasa-orange font-bold"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                }`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => handleNeedsChangeToggle(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  payment.needsChange
                    ? "bg-brasa-orange text-black border-brasa-orange font-bold"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                }`}
              >
                Sim
              </button>
            </div>
          </div>

          {payment.needsChange && (
            <div className="space-y-2 pt-1 border-t border-brasa-border/40">
              <label className="text-xs font-semibold text-zinc-400 block">
                Troco para quanto? (Total do pedido: {formatCurrency(totalCents)})
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 150,00"
                  value={payment.changeForCents ? maskCurrency(payment.changeForCents) : ""}
                  onChange={(e) => handleChangeForInputChange(e.target.value)}
                  className="w-full rounded-xl border border-brasa-border bg-brasa-bg px-3.5 h-11 text-sm font-mono text-brasa-cream placeholder:text-zinc-600 focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange focus:outline-none transition-colors"
                />
              </div>

              {/* Feedback dinâmico e cálculo de troco em tempo real */}
              {payment.changeForCents && payment.changeForCents < totalCents ? (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    O valor para troco deve ser maior ou igual ao total do pedido (
                    <strong>{formatCurrency(totalCents)}</strong>).
                  </span>
                </div>
              ) : payment.changeForCents && payment.changeForCents >= totalCents ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Troco a ser levado:</span>
                  </div>
                  <strong className="font-mono text-sm text-emerald-300">
                    {formatCurrency(currentTroco)}
                  </strong>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

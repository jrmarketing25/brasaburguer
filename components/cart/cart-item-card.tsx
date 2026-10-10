"use client";

import React from "react";
import Image from "next/image";
import { CartItem } from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus, Trash2, Edit3 } from "lucide-react";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onEdit: () => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  onEdit,
}: CartItemCardProps) {
  const itemTotalCents = item.unitPriceCents * item.quantity;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brasa-border bg-brasa-surface p-3.5 sm:p-4 transition-all">
      <div className="flex items-start gap-3">
        {/* Imagem do produto */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/50 border border-brasa-border/40">
          <Image
            src={item.product.image}
            alt={item.product.name}
            fill
            sizes="80px"
            className="object-cover"
            style={{ objectPosition: "center 45%" }}
          />
        </div>

        {/* Informações centrais */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bebas text-lg sm:text-xl tracking-wide uppercase text-brasa-cream leading-tight truncate">
              {item.product.name}
            </h3>
            <span className="font-mono text-sm sm:text-base font-bold text-brasa-cream shrink-0">
              {formatCurrency(itemTotalCents)}
            </span>
          </div>

          <p className="text-[11px] font-mono text-zinc-400">
            Unitário: {formatCurrency(item.unitPriceCents)}
          </p>

          {/* Adicionais selecionados com valores */}
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.selectedOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] text-zinc-300"
                >
                  <span className="text-brasa-orange/90 font-medium truncate">
                    + {opt.name}
                  </span>
                  <span className="font-mono text-zinc-400 shrink-0 ml-1">
                    {opt.priceCents > 0
                      ? formatCurrency(opt.priceCents)
                      : "Incluso"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Ingredientes removidos */}
          {item.removedIngredients && item.removedIngredients.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.removedIngredients.map((rem, idx) => (
                <span
                  key={idx}
                  className="rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 text-[10px] text-red-300"
                >
                  - {rem}
                </span>
              ))}
            </div>
          )}

          {/* Observações */}
          {item.observation && (
            <p className="mt-1 text-[11px] italic text-zinc-400 bg-brasa-bg/60 rounded-md p-1.5 border border-brasa-border/40">
              &ldquo;{item.observation}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Barra de Ações: Quantidade e Botões de Edição/Remoção */}
      <div className="flex items-center justify-between pt-2 border-t border-brasa-border/60">
        <div className="flex items-center gap-2">
          {/* Botão de Editar Personalização */}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-brasa-orange hover:bg-brasa-orange/10 border border-brasa-orange/30 transition-colors"
            aria-label="Editar opções deste item"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editar</span>
          </button>

          {/* Botão de Remover */}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Remover item do carrinho"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Remover</span>
          </button>
        </div>

        {/* Controle de Quantidade */}
        <div className="flex items-center rounded-xl border border-brasa-border bg-brasa-bg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-brasa-cream hover:bg-zinc-800 transition-colors"
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-7 text-center font-mono text-xs font-bold text-brasa-cream">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-brasa-cream hover:bg-zinc-800 transition-colors"
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


"use client";

import React from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Flame } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
}

export function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const isBacon = product.slug.includes("bacon");
  const isClassic = product.slug.includes("classico");

  const handleClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex w-full items-center gap-3 rounded-2xl border border-brasa-border bg-brasa-surface p-2.5 xs:p-3 transition-all hover:border-zinc-700 active:scale-[0.99] cursor-pointer select-none"
    >
      {/* Imagem do produto à esquerda com proporção quadrada perfeita */}
      <div className="relative h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-black/50 border border-brasa-border/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 96px, 112px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: "center 45%" }}
        />
      </div>

      {/* Conteúdo textual e ações à direita */}
      <div className="flex flex-1 flex-col justify-between self-stretch min-w-0 py-0.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bebas text-lg xs:text-xl tracking-wide uppercase text-brasa-cream leading-tight truncate">
              {product.name}
            </h3>
            {isBacon && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-brasa-red px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white">
                <Flame className="h-2.5 w-2.5" />
                Mais pedido
              </span>
            )}
            {isClassic && (
              <span className="inline-flex items-center rounded-full bg-brasa-orange/20 border border-brasa-orange/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-brasa-orange">
                Clássico
              </span>
            )}
          </div>

          <p className="text-[11px] xs:text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Linha de Preço e Botão de Adicionar sem sobreposição */}
        <div className="flex items-center justify-between pt-1.5 mt-auto">
          <span className="text-sm xs:text-base font-bold text-brasa-cream font-mono shrink-0">
            {formatCurrency(product.priceCents)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="flex h-8 w-8 xs:h-9 xs:w-9 shrink-0 items-center justify-center rounded-xl bg-brasa-orange hover:bg-brasa-orangeHover text-black transition-all active:scale-90 shadow-sm"
            aria-label={`Personalizar e adicionar ${product.name}`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

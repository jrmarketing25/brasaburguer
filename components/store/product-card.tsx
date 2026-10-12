"use client";

import React from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Flame, Sparkles, Layers, Leaf } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
}

export function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const isBacon = product.slug.includes("bacon");
  const isClassic = product.slug.includes("classico");
  const isCombo = product.category === "combos";
  const isVeggie = product.slug.includes("veggie");

  const badgeText = product.badge || (isBacon ? "Mais pedido" : isClassic ? "Clássico" : isCombo ? "Combo" : isVeggie ? "Veggie" : null);

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
      className="group relative flex w-full flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0 rounded-2xl border border-brasa-border bg-brasa-surface p-2.5 xs:p-3 md:p-3.5 transition-all hover:border-zinc-700 md:hover:border-brasa-orange/50 md:hover:shadow-card active:scale-[0.99] cursor-pointer select-none"
    >
      {/* 1. Imagem do produto */}
      {/* Mobile: quadrada lateral (80-112px). Desktop: topo com proporção 16/10 ou quadrada (h-44 a h-48) */}
      <div className="relative h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 md:h-44 md:w-full shrink-0 overflow-hidden rounded-xl bg-black/50 border border-brasa-border/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 280px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: "center 45%" }}
        />

        {/* Badge flutuante visível no topo da imagem no Desktop */}
        {badgeText && (
          <div className="hidden md:block absolute top-2.5 left-2.5 z-10">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${
                isBacon
                  ? "bg-brasa-red"
                  : isCombo
                  ? "bg-amber-600"
                  : isVeggie
                  ? "bg-emerald-600"
                  : "bg-brasa-orange text-black"
              }`}
            >
              {isBacon && <Flame className="h-3 w-3" />}
              {isCombo && <Layers className="h-3 w-3" />}
              {isVeggie && <Leaf className="h-3 w-3" />}
              {badgeText}
            </span>
          </div>
        )}
      </div>

      {/* 2. Conteúdo textual e Ações */}
      <div className="flex flex-1 flex-col justify-between self-stretch min-w-0 py-0.5 md:pt-3 md:pb-0">
        <div className="space-y-1">
          {/* Título e Badge Mobile */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bebas text-lg xs:text-xl md:text-xl tracking-wide uppercase text-brasa-cream leading-tight truncate">
              {product.name}
            </h3>

            {/* Badge inline apenas no Mobile */}
            {badgeText && (
              <span className="md:hidden inline-flex items-center gap-0.5 rounded-full bg-brasa-orange/20 border border-brasa-orange/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-brasa-orange">
                {badgeText}
              </span>
            )}
          </div>

          <p className="text-[11px] xs:text-xs text-zinc-400 line-clamp-2 leading-relaxed md:h-8">
            {product.description}
          </p>
        </div>

        {/* 3. Linha de Preço e Botão de Adicionar */}
        <div className="flex items-center justify-between pt-1.5 md:pt-3 mt-auto">
          <span className="text-sm xs:text-base md:text-base font-bold text-brasa-cream font-mono shrink-0">
            {formatCurrency(product.priceCents)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="flex items-center justify-center gap-1 h-8 px-2.5 xs:h-9 xs:px-3 md:h-8 md:px-3 rounded-xl md:rounded-lg bg-brasa-orange hover:bg-brasa-orangeHover text-black transition-all active:scale-95 shadow-sm text-xs font-bold shrink-0"
            aria-label={`Personalizar e adicionar ${product.name}`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden md:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

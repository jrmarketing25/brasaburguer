"use client";

import React from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Flame } from "lucide-react";

interface ComboCarouselProps {
  combos: Product[];
  onSelectCombo?: (combo: Product) => void;
}

export function ComboCarousel({ combos, onSelectCombo }: ComboCarouselProps) {
  if (!combos || combos.length === 0) return null;

  const handleClick = (combo: Product) => {
    if (onSelectCombo) {
      onSelectCombo(combo);
    }
  };

  return (
    <section className="w-full pt-1 pb-3">
      <div className="flex flex-col space-y-0.5 mb-3">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-brasa-orange" />
          <h2 className="font-bebas text-xl sm:text-2xl tracking-wide uppercase text-brasa-cream leading-tight">
            Combos em destaque
          </h2>
        </div>
        <p className="text-[11px] text-zinc-400">
          Seu burger favorito fica ainda melhor em combo.
        </p>
      </div>

      {/* Carrossel horizontal nativo, snap e barra de rolagem oculta */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {combos.map((combo, index) => {
          const isFeatured = index === 0;

          return (
            <div
              key={combo.slug}
              onClick={() => handleClick(combo)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(combo);
                }
              }}
              className="group relative flex flex-col justify-between w-[255px] xs:w-[275px] sm:w-[300px] shrink-0 rounded-2xl border border-brasa-border bg-brasa-surface p-3 transition-all hover:border-zinc-700 snap-start select-none cursor-pointer"
            >
              {/* Badge "Mais pedido" */}
              {isFeatured && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full bg-brasa-red px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white shadow-sm">
                  <Flame className="h-2.5 w-2.5" />
                  <span>Mais pedido</span>
                </div>
              )}

              {/* Fotografia em evidência gastronômica */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/40 border border-brasa-border/30">
                <Image
                  src={combo.image}
                  alt={combo.name}
                  fill
                  sizes="(max-width: 640px) 275px, 300px"
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Informações bem distribuídas */}
              <div className="flex flex-col flex-1 justify-between pt-2.5 space-y-2.5">
                <div className="space-y-0.5">
                  <h3 className="font-bebas text-lg sm:text-xl tracking-wide uppercase text-brasa-cream leading-tight">
                    {combo.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {combo.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-brasa-border/60">
                  <span className="text-sm sm:text-base font-bold text-brasa-cream font-mono">
                    {formatCurrency(combo.priceCents)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(combo);
                    }}
                    className="flex items-center gap-1 h-8 rounded-xl px-3 text-xs font-bold bg-brasa-orange hover:bg-brasa-orangeHover text-black transition-all active:scale-95 shadow-sm"
                    aria-label={`Personalizar e adicionar ${combo.name} ao carrinho`}
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Personalizar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

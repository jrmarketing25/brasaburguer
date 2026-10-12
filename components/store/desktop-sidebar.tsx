"use client";

import React from "react";
import Image from "next/image";
import { Category } from "@/types/store";
import { defaultStoreConfig } from "@/lib/config/store.config";
import {
  Flame,
  Layers,
  UtensilsCrossed,
  Sparkles,
  CupSoda,
  Cookie,
  Beef,
} from "lucide-react";

interface DesktopSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
}

export function DesktopSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: DesktopSidebarProps) {
  // Mapeia ícones apropriados por slug de categoria
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "all":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "hamburgueres":
        return <Beef className="h-4 w-4" />;
      case "combos":
        return <Layers className="h-4 w-4" />;
      case "acompanhamentos":
        return <Sparkles className="h-4 w-4" />;
      case "bebidas":
        return <CupSoda className="h-4 w-4" />;
      case "sobremesas":
        return <Cookie className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
    }
  };

  // Garante a opção "Todos os Produtos" na lista
  const allCategories = [
    { slug: "all", name: "Todos os Produtos", sort: 0 },
    ...categories,
  ];

  return (
    <aside className="w-56 xl:w-64 shrink-0 space-y-6 self-start sticky top-20">
      {/* 1. Lista de Categorias de Navegação */}
      <div className="rounded-2xl border border-brasa-border bg-brasa-surface/70 p-3 space-y-1 shadow-card backdrop-blur-sm">
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Categorias
        </p>

        <nav className="space-y-1" aria-label="Categorias do cardápio">
          {allCategories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.slug);
                  const menuEl = document.getElementById("cardapio");
                  if (menuEl) {
                    menuEl.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-brasa-orange/15 text-brasa-orange border border-brasa-orange/40 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-brasa-cream hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-brasa-orange text-black"
                      : "bg-zinc-800/80 text-zinc-400 group-hover:text-brasa-cream"
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Banner Institucional e Visual de Brasa (Mockup Desktop) */}
      <div className="relative overflow-hidden rounded-2xl border border-brasa-border/80 bg-gradient-to-b from-brasa-surface via-black to-black p-5 text-center shadow-card group">
        {/* Glow de fundo */}
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-brasa-orange/15 blur-[45px] rounded-full"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="relative h-12 w-32">
            <Image
              src={defaultStoreConfig.logoUrl}
              alt={defaultStoreConfig.name}
              fill
              className="object-contain"
            />
          </div>

          <div className="space-y-1">
            <h4 className="font-bebas text-xl uppercase tracking-wide text-brasa-cream leading-tight">
              Sabor que{" "}
              <span className="text-brasa-orange">une pessoas.</span>
            </h4>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Mais que burgers. Momentos melhores.
            </p>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-brasa-orange/30 bg-brasa-orange/10 px-2.5 py-1 text-[10px] font-bold text-brasa-orange">
              <Flame className="h-3 w-3" />
              100% na brasa viva
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}


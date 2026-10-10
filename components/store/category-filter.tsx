"use client";

import React from "react";
import { Category } from "@/types/store";
import { Flame, Package, Utensils, GlassWater } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "hamburgueres":
        return <Flame className="h-3.5 w-3.5 shrink-0" />;
      case "combos":
        return <Package className="h-3.5 w-3.5 shrink-0" />;
      case "acompanhamentos":
        return <Utensils className="h-3.5 w-3.5 shrink-0" />;
      case "bebidas":
        return <GlassWater className="h-3.5 w-3.5 shrink-0" />;
      default:
        return <Flame className="h-3.5 w-3.5 shrink-0" />;
    }
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-2xl tracking-wide uppercase text-brasa-cream leading-tight">
            Cardápio
          </h2>
          <p className="text-[11px] text-zinc-400">Escolha uma categoria</p>
        </div>
      </div>

      {/* Navegação horizontal com rolagem nativa e scrollbar oculta */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-1.5 h-9 rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all snap-start select-none active:scale-95 border shrink-0 ${
                isActive
                  ? "bg-brasa-orange text-black border-brasa-orange font-bold shadow-sm"
                  : "bg-brasa-surface text-brasa-cream/90 border-brasa-border hover:border-zinc-700 hover:bg-brasa-surfaceHover"
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

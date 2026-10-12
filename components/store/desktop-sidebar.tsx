"use client";

import React from "react";
import Image from "next/image";
import { Category } from "@/types/store";
import {
  BurgerMenuIcon,
  ComboMenuIcon,
  FriesMenuIcon,
  DrinkMenuIcon,
  SauceMenuIcon,
  DessertMenuIcon,
} from "@/components/store/menu-icons";
import { Flame } from "lucide-react";

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
  // Mapeia ícones fiéis ao mockup por slug de categoria
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "all":
        return <BurgerMenuIcon className="h-4 w-4" />;
      case "hamburgueres":
        return <BurgerMenuIcon className="h-4 w-4" />;
      case "combos":
        return <ComboMenuIcon className="h-4 w-4" />;
      case "acompanhamentos":
        return <FriesMenuIcon className="h-4 w-4" />;
      case "bebidas":
        return <DrinkMenuIcon className="h-4 w-4" />;
      case "molhos":
        return <SauceMenuIcon className="h-4 w-4" />;
      case "sobremesas":
        return <DessertMenuIcon className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
    }
  };

  // Garante a lista completa com os nomes fiéis ao mockup
  const baseCategories = [
    { slug: "all", name: "Todos os Produtos", sort: 0 },
    ...categories.map((c) => ({
      ...c,
      name: c.slug === "hamburgueres" ? "Burgers Artesanais" : c.name,
    })),
  ];

  // Adiciona Molhos Extras e Sobremesas se não estiverem presentes nos dados demo
  const hasMolhos = baseCategories.some((c) => c.slug === "molhos");
  const hasSobremesas = baseCategories.some((c) => c.slug === "sobremesas");
  const allCategories = [
    ...baseCategories,
    ...(!hasMolhos ? [{ slug: "molhos", name: "Molhos Extras", sort: 5 }] : []),
    ...(!hasSobremesas ? [{ slug: "sobremesas", name: "Sobremesas", sort: 6 }] : []),
  ];

  return (
    <aside className="w-56 xl:w-64 shrink-0 space-y-6 self-start sticky top-20">
      {/* 1. Lista de Categorias de Navegação */}
      <div className="rounded-2xl border border-brasa-border bg-brasa-surface/90 p-2.5 space-y-1 shadow-card backdrop-blur-sm">
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
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-gradient-to-r from-brasa-orange/20 to-brasa-orange/5 text-brasa-cream border border-brasa-orange/60 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-brasa-cream hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0 ${
                    isActive
                      ? "bg-brasa-orange text-black shadow-sm"
                      : "text-zinc-400 group-hover:text-brasa-cream"
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

      {/* 2. Banner Institucional Vertical Oficial (Image B) */}
      <div className="relative overflow-hidden rounded-2xl border border-brasa-border/80 bg-brasa-surface/40 shadow-card transition-all hover:border-brasa-orange/40">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <Image
            src="/images/desktop/sidebar-banner-desktop.webp"
            alt="Brasa Burgers - Sabor que une pessoas"
            fill
            sizes="(max-width: 1280px) 224px, 256px"
            className="object-cover object-center rounded-2xl transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>
    </aside>
  );
}


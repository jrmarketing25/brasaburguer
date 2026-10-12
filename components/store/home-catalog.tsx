"use client";

import React, { useState } from "react";
import { MenuData } from "@/types/store";
import { HeroBanner } from "@/components/store/hero-banner";
import { ProductList } from "@/components/store/product-list";
import { DesktopSidebar } from "@/components/store/desktop-sidebar";
import { DesktopCartSidebar } from "@/components/store/desktop-cart-sidebar";

interface HomeCatalogProps {
  menuData: MenuData;
}

export function HomeCatalog({ menuData }: HomeCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-2xl lg:max-w-[1440px] px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
      <div className="flex gap-6 lg:gap-8 items-start">
        {/* ========================================================= */}
        {/* 1. SIDEBAR ESQUERDA (Desktop: hidden lg:block)            */}
        {/* ========================================================= */}
        <div className="hidden lg:block">
          <DesktopSidebar
            categories={menuData.categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* ========================================================= */}
        {/* 2. ÁREA PRINCIPAL: Hero no topo + Catálogo & Carrinho    */}
        {/* ========================================================= */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
          {/* Hero Gastronômico (Ampla largura no Desktop, acima do catálogo e do carrinho) */}
          <HeroBanner />

          {/* Linha de Conteúdo: Catálogo à esquerda e Carrinho Lateral à direita */}
          <div className="flex gap-6 lg:gap-7 xl:gap-8 items-start">
            <main className="flex-1 min-w-0">
              <ProductList
                categories={menuData.categories}
                products={menuData.products}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </main>

            {/* 3. SIDEBAR DIREITA: Carrinho Lateral alinhado abaixo do Hero (Mockup Exato) */}
            <div className="hidden xl:block shrink-0">
              <DesktopCartSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


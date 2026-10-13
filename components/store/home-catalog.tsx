"use client";

import React, { useState } from "react";
import { MenuData } from "@/types/store";
import { HeroBanner } from "@/components/store/hero-banner";
import { ProductList } from "@/components/store/product-list";
import { DesktopSidebar } from "@/components/store/desktop-sidebar";
import { DesktopCartSidebar } from "@/components/store/desktop-cart-sidebar";
import { useStoreConfigStore } from "@/lib/store/useStoreConfigStore";
import { defaultStoreConfig } from "@/lib/config/store.config";

interface HomeCatalogProps {
  menuData: MenuData;
}

export function HomeCatalog({ menuData }: HomeCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const updateConfig = useStoreConfigStore((state) => state.updateConfig);

  React.useEffect(() => {
    if (menuData.store) {
      updateConfig({
        name: menuData.store.name,
        slogan: menuData.store.slogan,
        whatsappNumber: menuData.store.whatsapp,
        isOpen: menuData.store.isOpen,
        logoUrl: menuData.store.logoUrl || defaultStoreConfig.logoUrl,
        faviconUrl: menuData.store.faviconUrl || defaultStoreConfig.faviconUrl,
        delivery: {
          ...defaultStoreConfig.delivery,
          feeCents: menuData.store.deliveryFeeCents,
          minimumOrderCents: menuData.store.minimumOrderCents,
        },
      });
    }
  }, [menuData.store, updateConfig]);

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
          {/* Hero Gastronômico (Ampla largura no Desktop) */}
          <HeroBanner
            storeName={menuData.store.name}
            slogan={menuData.store.slogan}
            logoUrl={menuData.store.logoUrl}
            bannerUrl={menuData.store.bannerUrl}
          />

          {/* Catálogo de Produtos com Carrinho acoplado ao topo e grid 4 colunas abaixo */}
          <main className="w-full">
            <ProductList
              categories={menuData.categories}
              products={menuData.products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              cartSidebar={<DesktopCartSidebar />}
            />
          </main>
        </div>
      </div>
    </div>
  );
}


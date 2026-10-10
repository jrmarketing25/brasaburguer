import React from "react";
import { getMenuData } from "@/lib/data/menu";
import { HeroBanner } from "@/components/store/hero-banner";
import { ProductList } from "@/components/store/product-list";

export default async function HomePage() {
  const menuData = await getMenuData();

  return (
    <div className="flex-1 flex flex-col w-full pb-4">
      {/* Container Principal com foco Mobile-First (16-20px de padding lateral) */}
      <div className="mx-auto w-full max-w-md sm:max-w-2xl px-4 sm:px-6">
        {/* Hero gastronômico refinado e compacto */}
        <HeroBanner />

        {/* Catálogo com categorias, combos em carrossel e hambúrgueres em cards horizontais */}
        <ProductList
          categories={menuData.categories}
          products={menuData.products}
        />
      </div>
    </div>
  );
}

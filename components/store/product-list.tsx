"use client";

import React, { useState } from "react";
import { Category, Product } from "@/types/store";
import { CategoryFilter } from "@/components/store/category-filter";
import { ComboCarousel } from "@/components/store/combo-carousel";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetailsDrawer } from "@/components/store/product-details-drawer";
import { Flame, Sparkles, UtensilsCrossed } from "lucide-react";

interface ProductListProps {
  categories: Category[];
  products: Product[];
}

export function ProductList({ categories, products }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("hamburgueres");
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<Product | null>(null);

  const combos = products.filter((p) => p.category === "combos");
  const burgers = products.filter((p) => p.category === "hamburgueres");

  const activeProducts = products.filter((p) => p.category === selectedCategory);

  return (
    <>
      <section id="cardapio" className="w-full scroll-mt-16 space-y-5 pt-2 pb-8">
        {/* Filtro horizontal de Categorias */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => setSelectedCategory(slug)}
        />

        {/* Seção de Combos em Destaque (quando em Hambúrgueres ou Combos) */}
        {(selectedCategory === "hamburgueres" || selectedCategory === "combos") && (
          <ComboCarousel
            combos={combos}
            onSelectCombo={(combo) => setActiveDrawerProduct(combo)}
          />
        )}

        {/* Seção Principal de Produtos */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-brasa-orange" />
            <h2 className="font-bebas text-xl sm:text-2xl tracking-wide uppercase text-brasa-cream leading-tight">
              {selectedCategory === "combos"
                ? "Todos os Combos"
                : selectedCategory === "hamburgueres"
                ? "Nossos burgers"
                : categories.find((c) => c.slug === selectedCategory)?.name || "Produtos"}
            </h2>
          </div>

          {/* Lista vertical de cards horizontais (1 por linha, largura total) */}
          {activeProducts.length > 0 ? (
            <div className="flex flex-col gap-3 w-full">
              {activeProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  onSelectProduct={(p) => setActiveDrawerProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brasa-border bg-brasa-surface/40 p-6 text-center space-y-2.5">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brasa-orange/10 text-brasa-orange">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bebas text-lg uppercase tracking-wide text-brasa-cream">
                  Opções em preparação
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Novos itens desta categoria estarão disponíveis em breve no cardápio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory("hamburgueres")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brasa-orange hover:underline pt-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ver nossos hambúrgueres</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Drawer / Modal de Detalhes e Personalização do Produto */}
      <ProductDetailsDrawer
        product={activeDrawerProduct}
        isOpen={Boolean(activeDrawerProduct)}
        onClose={() => setActiveDrawerProduct(null)}
      />
    </>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Category, Product } from "@/types/store";
import { CategoryFilter } from "@/components/store/category-filter";
import { ComboCarousel } from "@/components/store/combo-carousel";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetailsDrawer } from "@/components/store/product-details-drawer";
import {
  Flame,
  Sparkles,
  UtensilsCrossed,
  Search,
  X,
  Layers,
} from "lucide-react";

interface ProductListProps {
  categories: Category[];
  products: Product[];
  selectedCategory?: string;
  onSelectCategory?: (categorySlug: string) => void;
}

export function ProductList({
  categories,
  products,
  selectedCategory: controlledCategory,
  onSelectCategory: setControlledCategory,
}: ProductListProps) {
  const [internalCategory, setInternalCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<Product | null>(null);

  // Permite sincronização controlada com sidebar externa ou controle interno
  const currentCategory = controlledCategory ?? internalCategory;
  const handleCategoryChange = (slug: string) => {
    if (setControlledCategory) {
      setControlledCategory(slug);
    } else {
      setInternalCategory(slug);
    }
  };

  // Escuta parâmetros de busca na URL se houver navegação vinda do header
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get("busca");
      if (queryParam) {
        setSearchQuery(queryParam);
      }
    }
  }, []);

  const combos = useMemo(() => products.filter((p) => p.category === "combos"), [products]);

  // Filtragem combinada por Categoria e Busca Local
  const filteredProducts = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      // 1. Filtro de categoria (se não for "all")
      const matchesCategory =
        currentCategory === "all" || product.category === currentCategory;

      // 2. Filtro de busca por nome ou descrição
      const matchesSearch =
        cleanQuery === "" ||
        product.name.toLowerCase().includes(cleanQuery) ||
        product.description.toLowerCase().includes(cleanQuery) ||
        (product.badge && product.badge.toLowerCase().includes(cleanQuery));

      return matchesCategory && matchesSearch;
    });
  }, [products, currentCategory, searchQuery]);

  return (
    <>
      <section id="cardapio" className="w-full scroll-mt-20 space-y-5 pt-2 pb-8">
        {/* Barra de Busca e Filtro de Categorias */}
        <div className="space-y-3">
          {/* Campo de Busca Local Integrado */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar hambúrguer, combo ou acompanhamento..."
              className="w-full h-11 rounded-2xl border border-brasa-border bg-brasa-surface pl-10 pr-10 text-xs sm:text-sm text-brasa-cream placeholder:text-zinc-500 focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brasa-cream p-0.5"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtro horizontal de Categorias (Visível no Mobile e como Pills no Desktop) */}
          <CategoryFilter
            categories={[
              { slug: "all", name: "Todos", sort: 0 },
              ...categories,
            ]}
            selectedCategory={currentCategory}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Seção de Combos em Destaque (quando não houver busca ativa e em categoria aplicável) */}
        {!searchQuery && (currentCategory === "all" || currentCategory === "combos" || currentCategory === "hamburgueres") && (
          <div id="combos" className="scroll-mt-20 pt-1">
            <ComboCarousel
              combos={combos}
              onSelectCombo={(combo) => setActiveDrawerProduct(combo)}
            />
          </div>
        )}

        {/* Seção Principal de Produtos */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 border-b border-brasa-border/40 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-brasa-orange" />
                <h2 className="font-bebas text-xl sm:text-2xl lg:text-3xl tracking-wide uppercase text-brasa-cream leading-tight">
                  {searchQuery
                    ? `Resultados para "${searchQuery}"`
                    : currentCategory === "all"
                    ? "Nossos Burgers & Especiais"
                    : currentCategory === "combos"
                    ? "Combos Especiais"
                    : currentCategory === "hamburgueres"
                    ? "Nossos Burgers"
                    : categories.find((c) => c.slug === currentCategory)?.name || "Produtos"}
                </h2>
              </div>
              {!searchQuery && (currentCategory === "all" || currentCategory === "hamburgueres") && (
                <p className="text-xs text-zinc-400 font-medium">
                  Ingredientes selecionados. Sabor incomparável. Feitos para unir pessoas.
                </p>
              )}
            </div>

            <span className="text-xs font-mono text-zinc-500 shrink-0">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
            </span>
          </div>

          {/* Grid Responsivo de Produtos: Mobile em lista horizontal (1 col), Desktop em grid equilibrado (2-3 cols) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 w-full">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  onSelectProduct={(p) => setActiveDrawerProduct(p)}
                />
              ))}
            </div>
          ) : (
            /* Estado Vazio de Busca */
            <div className="rounded-2xl border border-dashed border-brasa-border bg-brasa-surface/40 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brasa-orange/10 text-brasa-orange">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bebas text-lg uppercase tracking-wide text-brasa-cream">
                  Nenhum produto encontrado
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Não encontramos itens para &ldquo;{searchQuery}&rdquo; na categoria selecionada.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    handleCategoryChange("all");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brasa-orange/40 bg-brasa-orange/15 px-4 py-2 text-xs font-bold text-brasa-orange hover:bg-brasa-orange/25 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ver todo o cardápio</span>
                </button>
              </div>
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

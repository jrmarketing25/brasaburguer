"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Search, UtensilsCrossed, Sparkles } from "lucide-react";
import { defaultStoreConfig } from "@/lib/config/store.config";
import { useCartStore } from "@/lib/store/useCartStore";

interface StoreHeaderProps {
  storeName?: string;
  logoUrl?: string;
  isOpen?: boolean;
}

export function StoreHeader({
  storeName = defaultStoreConfig.name,
  logoUrl = defaultStoreConfig.logoUrl,
  isOpen = defaultStoreConfig.isOpen,
}: StoreHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItemsCount = useCartStore((state) => state.getTotalItemsCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Dispara evento global de busca ou rola para o cardápio
    if (pathname !== "/") {
      router.push(`/?busca=${encodeURIComponent(searchQuery.trim())}#cardapio`);
    } else {
      const searchInput = document.getElementById("search-input") as HTMLInputElement;
      if (searchInput) {
        searchInput.value = searchQuery;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        searchInput.focus();
      }
      const menuSection = document.getElementById("cardapio");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const isHome = pathname === "/";
  const isCart = pathname === "/carrinho";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brasa-border/80 bg-brasa-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* LAYOUT MOBILE (md:hidden) — Preservação Estrita da Etapa 2 */}
        {/* ========================================================= */}
        <div className="flex md:hidden w-full items-center justify-between">
          {/* Indicador discreto de funcionamento à esquerda */}
          <div className="flex items-center min-w-[70px]">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide border ${
                isOpen
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span>{isOpen ? "Aberto" : "Fechado"}</span>
            </div>
          </div>

          {/* Logo oficial da BRASA BURGERS centralizada */}
          <Link
            href="/"
            className="flex items-center justify-center transition-opacity hover:opacity-90 active:scale-95"
            aria-label={storeName}
          >
            <div className="relative h-7 w-28 xs:h-8 xs:w-32">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Botão do carrinho com contador reativo */}
          <div className="flex items-center justify-end min-w-[70px]">
            <Link
              href="/carrinho"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brasa-surface border border-brasa-border text-brasa-cream transition-colors hover:border-brasa-orange hover:text-brasa-orange active:scale-95"
              aria-label="Ver carrinho"
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brasa-orange px-1 text-[9px] font-bold text-black shadow-glow animate-in zoom-in-50">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LAYOUT DESKTOP (hidden md:flex) — Conforme Mockup Aprovado */}
        {/* ========================================================= */}
        <div className="hidden md:flex w-full items-center justify-between gap-6">
          {/* 1. Logo à esquerda */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-90 active:scale-95"
              aria-label={storeName}
            >
              <div className="relative h-9 w-36 lg:w-44">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* 2. Links de Navegação Horizontal */}
            <nav className="flex items-center gap-5 lg:gap-7 text-sm font-semibold" aria-label="Navegação desktop">
              <Link
                href="/"
                className={`relative py-1 transition-colors ${
                  isHome && !isCart
                    ? "text-brasa-orange font-bold"
                    : "text-zinc-300 hover:text-brasa-cream"
                }`}
              >
                Início
                {isHome && !isCart && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brasa-orange rounded-full" />
                )}
              </Link>

              <Link
                href="/#cardapio"
                className="py-1 text-zinc-300 hover:text-brasa-orange transition-colors"
              >
                Cardápio
              </Link>

              <Link
                href="/#combos"
                className="py-1 text-zinc-300 hover:text-brasa-orange transition-colors"
              >
                Combos
              </Link>
            </nav>
          </div>

          {/* 3. Barra de Busca Desktop */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar seu burger favorito..."
                className="w-full h-10 rounded-full border border-brasa-border bg-brasa-surface/80 pl-10 pr-4 text-xs lg:text-sm text-brasa-cream placeholder:text-zinc-500 focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange focus:outline-none transition-all"
              />
            </form>
          </div>

          {/* 4. Status de Funcionamento e Carrinho com Contador */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Status da Loja */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide border ${
                isOpen
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span>{isOpen ? "Aberto agora" : "Fechado"}</span>
            </div>

            {/* Botão do Carrinho Desktop */}
            <Link
              href="/carrinho"
              className={`relative flex items-center gap-2.5 h-10 px-4 rounded-full border transition-all active:scale-95 ${
                isCart
                  ? "border-brasa-orange bg-brasa-orange/15 text-brasa-orange font-bold"
                  : "border-brasa-border bg-brasa-surface hover:border-brasa-orange text-brasa-cream"
              }`}
              aria-label="Ver carrinho de compras"
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4 text-brasa-orange" />
                {mounted && cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brasa-orange px-1 text-[9px] font-bold text-black shadow-glow">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {mounted && cartItemsCount > 0
                  ? `${cartItemsCount} ${cartItemsCount === 1 ? "item" : "itens"}`
                  : "Carrinho"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

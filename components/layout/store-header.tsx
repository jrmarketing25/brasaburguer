"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useCartStore((state) => state.getTotalItemsCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brasa-border/80 bg-brasa-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md sm:max-w-2xl md:max-w-4xl items-center justify-between px-4 sm:px-6">
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

        {/* Logo oficial da BRASA BURGERS centralizada e com proporção ideal */}
        <Link
          href="/"
          className="flex items-center justify-center transition-opacity hover:opacity-90 active:scale-95"
          aria-label={storeName}
        >
          <div className="relative h-7 w-28 sm:h-8 sm:w-36">
            <Image
              src={logoUrl}
              alt={storeName}
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Botão do carrinho com contador reativo levando à rota /carrinho */}
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
    </header>
  );
}

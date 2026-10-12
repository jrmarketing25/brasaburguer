"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useCartStore((state) => state.getTotalItemsCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCart = pathname === "/carrinho";
  const isHome = pathname === "/";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-brasa-border bg-brasa-surface/98 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navegação inferior mobile"
    >
      <div className="mx-auto flex h-14 xs:h-16 max-w-md items-center justify-around px-6">
        {/* Início */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
            isHome && !isCart
              ? "text-brasa-orange font-bold"
              : "text-zinc-400 hover:text-brasa-cream"
          }`}
          aria-current={isHome ? "page" : undefined}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] tracking-wide">Início</span>
        </Link>

        {/* Cardápio */}
        <Link
          href="/#cardapio"
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-zinc-400 hover:text-brasa-cream`}
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span className="text-[10px] tracking-wide">Cardápio</span>
        </Link>

        {/* Carrinho */}
        <Link
          href="/carrinho"
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
            isCart
              ? "text-brasa-orange font-bold"
              : "text-zinc-400 hover:text-brasa-cream"
          }`}
          aria-current={isCart ? "page" : undefined}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brasa-orange px-1 text-[9px] font-bold text-black shadow-glow animate-in zoom-in-50">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wide">Carrinho</span>
        </Link>
      </div>
    </nav>
  );
}

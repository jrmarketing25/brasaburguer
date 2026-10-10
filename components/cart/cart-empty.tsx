import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-5">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brasa-surface border border-brasa-border text-brasa-orange shadow-glow">
        <ShoppingBag className="h-9 w-9 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h2 className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase text-brasa-cream">
          Seu carrinho está vazio
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Você ainda não escolheu seus burgers artesanais na brasa. Que tal dar uma olhada no nosso cardápio?
        </p>
      </div>

      <div className="pt-2">
        <Link href="/">
          <Button size="lg" className="gap-2 rounded-full px-8 shadow-glow">
            <span>Explorar cardápio</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}


"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  const handleScrollToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menuSection = document.getElementById("cardapio");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-6">
      {/* Luz ambiente de calor suave, sem excesso */}
      <div
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-48 bg-brasa-orange/10 blur-[60px] rounded-full"
        aria-hidden="true"
      />

      <div className="flex flex-col items-center text-center">
        {/* Título Principal Compacto */}
        <div className="space-y-1.5 max-w-sm">
          <h1 className="font-bebas text-3xl xs:text-4xl sm:text-5xl tracking-wide uppercase leading-none text-brasa-cream">
            Sabor que{" "}
            <span className="text-brasa-orange">
              une pessoas.
            </span>
          </h1>

          <p className="font-sans text-xs sm:text-sm text-zinc-400 font-medium">
            Burgers artesanais preparados na brasa viva.
          </p>
        </div>

        {/* CTA Principal Compacto */}
        <div className="pt-3 pb-1">
          <Button
            size="default"
            onClick={handleScrollToMenu}
            className="group h-10 sm:h-11 px-6 text-xs sm:text-sm font-bold bg-brasa-orange hover:bg-brasa-orangeHover text-black rounded-full shadow-sm transition-all active:scale-95"
          >
            <span>Explorar cardápio</span>
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        {/* Fotografia Principal Integrada com Destaque Gastronômico */}
        <div className="relative mt-2 w-full max-w-[230px] xs:max-w-[260px] sm:max-w-[300px] aspect-[4/3] flex items-center justify-center">
          <div className="relative w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <Image
              src="/images/hero/hero-burger-recorte.webp"
              alt="Hambúrguer artesanal BRASA BURGERS na brasa"
              fill
              priority
              sizes="(max-width: 640px) 260px, 300px"
              className="object-contain object-center"
            />
          </div>
        </div>

        {/* Faixa de Diferenciais gastronômicos discreta e integrada */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-full max-w-sm border-t border-brasa-border/50 pt-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brasa-orange" />
            <span className="text-[10px] font-medium text-zinc-300 leading-tight">
              Ingredientes nobres
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-brasa-orange" />
            <span className="text-[10px] font-medium text-zinc-300 leading-tight">
              Brasa autêntica
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Users className="h-3.5 w-3.5 text-brasa-orange" />
            <span className="text-[10px] font-medium text-zinc-300 leading-tight">
              Momentos únicos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultStoreConfig } from "@/lib/config/store.config";

export function HeroBanner() {
  const handleScrollToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menuSection = document.getElementById("cardapio");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-2 sm:pt-4 pb-6">
      {/* ========================================================= */}
      {/* 1. HERO MOBILE (< lg) — Fiel à Etapa 02.1 Aprovada        */}
      {/* ========================================================= */}
      <div className="flex lg:hidden flex-col items-center text-center">
        {/* Luz ambiente de calor suave */}
        <div
          className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-48 bg-brasa-orange/10 blur-[60px] rounded-full"
          aria-hidden="true"
        />

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

        {/* Fotografia Principal Integrada */}
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

        {/* Diferenciais gastronômicos */}
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

      {/* ========================================================= */}
      {/* 2. HERO DESKTOP (lg:flex) — Reprodução Fiel do Mockup    */}
      {/* ========================================================= */}
      <div className="hidden lg:flex relative w-full rounded-3xl border border-brasa-border bg-gradient-to-r from-black via-brasa-surface to-black p-8 xl:p-10 overflow-hidden shadow-2xl items-center justify-between min-h-[300px] xl:min-h-[340px]">
        {/* Efeito sutil de calor e brasa ao fundo */}
        <div
          className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-brasa-orange/15 blur-[90px] rounded-full"
          aria-hidden="true"
        />

        {/* Coluna Esquerda: Marca, Mensagem e CTA */}
        <div className="relative z-10 max-w-md xl:max-w-lg space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-28 xl:h-12 xl:w-36">
              <Image
                src={defaultStoreConfig.logoUrl}
                alt={defaultStoreConfig.name}
                fill
                priority
                className="object-contain object-left"
              />
            </div>
            <span className="rounded-full border border-brasa-orange/40 bg-brasa-orange/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brasa-orange">
              Artesanal na brasa
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-bebas text-4xl xl:text-5xl 2xl:text-6xl tracking-wide uppercase leading-[0.95] text-brasa-cream">
              Sabor que{" "}
              <span className="text-brasa-orange">
                une pessoas.
              </span>
            </h1>

            <p className="font-sans text-xs xl:text-sm font-medium uppercase tracking-wider text-zinc-400">
              Burgers artesanais para qualquer momento.
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleScrollToMenu}
              className="group h-12 px-7 text-sm font-bold bg-brasa-orange hover:bg-brasa-orangeHover text-black rounded-full shadow-lg transition-all active:scale-95"
            >
              <span>Faça seu pedido agora</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Coluna Direita: Fotografia do Hambúrguer & Elementos Tipográficos */}
        <div className="relative z-10 flex items-center justify-end flex-1 pl-6">
          {/* Tipografia Artística Lateral (Conforme Mockup) */}
          <div className="hidden xl:flex flex-col text-right font-bebas text-lg tracking-wider text-zinc-600/70 select-none mr-4 leading-none space-y-1">
            <span>CARNE</span>
            <span>FOGO</span>
            <span>PESSOAS</span>
            <span className="text-zinc-500">BONS MOMENTOS</span>
          </div>

          {/* Fotografia em Destaque Gastronômico */}
          <div className="relative w-64 xl:w-80 2xl:w-96 aspect-square drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:scale-105">
            <Image
              src="/images/hero/hero-burger-recorte.webp"
              alt="Hambúrguer artesanal na brasa viva"
              fill
              priority
              sizes="(max-width: 1280px) 320px, 384px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

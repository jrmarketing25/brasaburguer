"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultStoreConfig } from "@/lib/config/store.config";

interface HeroBannerProps {
  storeName?: string;
  slogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export function HeroBanner({
  storeName = defaultStoreConfig.name,
  slogan = defaultStoreConfig.slogan,
  logoUrl = defaultStoreConfig.logoUrl,
  bannerUrl,
}: HeroBannerProps) {
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
      {/* 2. HERO DESKTOP (lg:flex) — Reprodução Fiel com Image A    */}
      {/* ========================================================= */}
      <div className="hidden lg:flex relative w-full rounded-3xl border border-brasa-border bg-black overflow-hidden shadow-2xl items-center min-h-[300px] xl:min-h-[330px] 2xl:min-h-[350px]">
        {/* Imagem de Fundo Oficial (Image A): Burger na brasa + tipografia manuscrita na direita */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/desktop/hero-desktop-bg.webp"
            alt="Burgers artesanais preparados na brasa viva"
            fill
            priority
            sizes="(max-width: 1440px) 960px, 1200px"
            className="object-cover object-right select-none pointer-events-none"
          />
        </div>

        {/* Gradiente escuro no lado esquerdo para garantir legibilidade perfeita do overlay em HTML */}
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/75 to-transparent w-full md:w-[65%] lg:w-[60%] xl:w-[55%]"
          aria-hidden="true"
        />

        {/* Coluna Esquerda: Overlay em HTML (Logo, Badge, Título, Subtítulo e CTA) */}
        <div className="relative z-20 max-w-sm xl:max-w-md 2xl:max-w-lg p-7 xl:p-9 space-y-3.5 text-left">
          {/* Logo Pequena e Tag/Badge */}
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-24 xl:h-9 xl:w-28">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                priority
                className="object-contain object-left"
              />
            </div>
            <span className="rounded-full border border-brasa-orange/40 bg-brasa-orange/15 px-3 py-0.5 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider text-brasa-orange shadow-sm">
              Artesanal na brasa
            </span>
          </div>

          {/* Título Principal */}
          <div className="space-y-1">
            <h1 className="font-bebas text-4xl xl:text-5xl 2xl:text-6xl tracking-wide uppercase leading-[0.92] text-brasa-cream">
              Sabor que <br />
              <span className="text-brasa-orange">une pessoas.</span>
            </h1>

            <p className="font-sans text-xs xl:text-sm font-medium uppercase tracking-wider text-zinc-300">
              Burgers artesanais para qualquer momento.
            </p>
          </div>

          {/* Botão CTA Principal */}
          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleScrollToMenu}
              className="group h-11 xl:h-12 px-6 xl:px-7 text-xs xl:text-sm font-bold uppercase tracking-wider bg-brasa-orange hover:bg-brasa-orangeHover text-black rounded-full shadow-lg transition-all active:scale-95"
            >
              <span>Faça seu pedido agora</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Lado Direito: A própria imagem de fundo já destaca o hambúrguer suculento e a tipografia
            manuscrita "CARNE / FOGO / PESSOAS / BONS MOMENTOS", preservando a composição sem sobreposição */}
      </div>
    </section>
  );
}

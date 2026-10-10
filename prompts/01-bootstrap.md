# ETAPA 01 — Fundação técnica e design system

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Crie projeto Next.js App Router + TS strict + Tailwind; instale e configure shadcn/ui, Lucide, Zustand e supabase-js (sem obrigar credenciais para rodar demo). Defina fontes: Bebas Neue nos títulos promocionais e Inter no sistema, com fallback. Estruture app/(store), app/admin, components/{layout,store,cart,admin}, lib, types, data. Tokens de cores e spacing globais, container mobile max 100%, breakpoints desktop. Instale favicon de public/images/brand/favicon.svg. Exiba logo SVG do kit. Configure README, .env.example sem chaves reais, ESLint e scripts. No modo sem Supabase, ler data/cardapio-demo.json para que a home funcione. Não começar homepage além do shell. Critério: npm run build sem erros.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

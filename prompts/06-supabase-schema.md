# ETAPA 06 — Banco de dados e segurança

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Integrar Supabase de maneira opcional e segura: migrations SQL versionadas para stores, settings, categories, products, option_groups, product_options, product_option_groups, orders, order_items e order_item_options; UUID pk, timestamps, sort_order, active e campos monetários integer cents. Uma instalação equivale a uma loja; isole todos os dados por store_id para futura evolução. Adicionar autenticação Supabase somente para administradores e RLS: leitura pública APENAS de loja/categorias/produtos ativos; escrita de dados administrativos APENAS via role autorizada, nunca confiar em client-side flags. Não usar SERVICE_ROLE_KEY no browser nem expor segredos NEXT_PUBLIC. Orders privados; clientes nunca podem consultar dados de outros clientes. Validar entradas com Zod, preservar snapshot de preço no item do pedido, políticas RLS e índice por store_id. Fornecer seed idempotente do catálogo demo, tratamento sem rede e migrations reversíveis quando aplicável. Explicar setup local Supabase sem assumir Docker já ligado.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

# ETAPA 05 — Layout desktop refinado

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Adaptar todas as rotas públicas para tablet e desktop sem alterar a boa experiência mobile. Guiar-se por /images/references/mockup-desktop.webp: sidebar de categorias em largura grande, hero panorâmico, grid de 3–4 produtos e resumo do carrinho em painel lateral sticky, sem sobreposição. Não usar print do mockup como página. No mobile o carrinho continua em tela própria, barra inferior fixa. Preservar comportamento dos formulários, acessibilidade do teclado e responsividade de 320 até 1920 px. Revisar imagens, texto, contrastes, scrollbar, estados hover/focus e layout shift.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

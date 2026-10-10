# ETAPA 03 — Catálogo e personalização

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Criar página de cardápio com categorias, pesquisa por nome e descrição, ordenação, cards responsivos e estados indisponível/esgotado. Página ou drawer /produto/[slug] com fotografia real, descrição, seleção de adicionais definidos por grupos e restrições min/max, observações, quantidade e preço total atualizado em centavos. A seleção deve criar item de carrinho com chave determinística levando em conta slug, adicionais e observações. Integre Zustand persist para carrinho sem armazenar dados pessoais. Valide limites. Botão de adicionar exige seleção válida. Combos do seed são itens independentes. Usar imagens reais exatas do JSON. Não inventar novas fotos.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

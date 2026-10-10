# ETAPA 07 — Painel administrativo funcional

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Criar /admin com login real Supabase Auth protegido no servidor e sessões seguras; não usar senha fixa embutida ou middleware como única barreira. Dashboard com números comprovados do banco (ou indicação de sem dados). CRUD de categorias, produtos, imagens em bucket por loja, opcionais, preços, disponibilidade, ordem de exibição, configurações, atendimento e WhatsApp. Formulários com validação, mensagens claras, confirmação para exclusões e otimização de imagens. Lista de pedidos distinguiendo rascunho, encaminhado ao WhatsApp, confirmado manualmente, preparado, concluído e cancelado. Proibir inferência de confirmação automática por clique; sem WhatsApp Business API não há comprovante de envio. Tela white label para trocar marca, textos e cores (com validação de contraste), logo e fotos por upload. Testar RLS com usuário autenticado e anônimo.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

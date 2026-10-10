# ETAPA 08 — Auditoria, white label e entrega

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Auditar todos os fluxos com dados reais do catálogo. Testar tamanhos 320, 360, 390, 430, 768, 1024 e 1440; teclado, leitores de tela, imagens, formulário, combinações de adicionais, carrinho duplicado, atualização de preço, loja fechada, entrega/retirada e URLs WhatsApp válidas. Criar docs/GUIA-WHITE-LABEL.md mostrando como instalar, configurar .env, importar seed, trocar logo/cores/nome/WhatsApp, cadastrar produtos, implantar na Vercel e criar seu próprio Supabase. Não publicar segredos. Revisar lint/typecheck/build e entregar checklist com resultados honestos e pendências. Não adicionar funcionalidades pagas, checkout online ou integração API do WhatsApp.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

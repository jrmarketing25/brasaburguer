# ETAPA 04 — Carrinho e fechamento por WhatsApp

Cole este prompt no Antigravity (Gemini 3.8 Flash Medium), com a pasta do projeto aberta.

## Prompt

CONTEXTO OBRIGATÓRIO: Projeto BRASA BURGERS, sistema white label de cardápio digital mobile-first e checkout via WhatsApp. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide, Zustand e Supabase. Identidade: fundo #080808, superfície #1C1C1C, laranja #FF6A00, vermelho #E6391F, creme #F3E3C7. Slogan: "Sabor que une pessoas.". As imagens reais estão em public/images; não use URLs aleatórias, bancos de imagens, emojis como ícones ou artes geradas por CSS. Mockups: /images/references/mockup-mobile.webp e /images/references/mockup-desktop.webp. Responsivo, acessível, legível e sem aparência de template genérico. Não alterar arquivos sem necessidade; antes de editar, inspecionar o projeto. Implementar de verdade, não apenas telas estáticas. Rodar build e corrigir erros ao final. Entregar resumo de alterações e checklist de teste. Não executar etapas posteriores sem autorização.

TAREFA DESTA ETAPA:
Implemente carrinho editável: alterar quantidade, remover, subtotal, adicionais, taxa de entrega e total corretos usando centavos inteiros e Intl.NumberFormat pt-BR. Checkout com nome, telefone opcional, entrega/retirada, endereço detalhado se entrega, forma de pagamento selecionável (Pix, dinheiro, cartão na entrega) e troco se dinheiro. Configuração da loja informa WhatsApp e horários. Validar campos obrigatórios, política de loja aberta, pedido mínimo e taxa, sem afirmar entrega em área não validada. Criar mensagem WhatsApp clara com itens, adicionais, quantidades, subtotal, entrega, total, forma de pagamento, endereço e observações; abrir https://wa.me/<numero>?text=<encodeURIComponent(mensagem)> mediante ação do usuário. A abertura do WhatsApp NÃO equivale a pedido recebido/confirmado nem pagamento efetuado; mostrar aviso visível. Não enviar automaticamente e não marcar como confirmado. Se registrar pedidos localmente, estado inicial 'rascunho/encaminhado' e confirmação manual.

Antes de implementar: liste os arquivos que pretende criar/editar em até 10 linhas. Em seguida implemente sem pedir autorização para cada arquivo. Ao terminar: resuma alterações, testes executados e bloqueios reais.

# Manual Operacional do Painel Administrativo

Este manual descreve todas as funcionalidades do painel administrativo do sistema.

---

## 1. Módulos do Sistema

### 1. Visão Geral (`/admin`)
- Indicadores em tempo real: Total de produtos cadastrados, categorias ativas, pedidos recentes e zonas de entrega.
- Acesso rápido aos módulos de gestão.

### 2. Produtos (`/admin/produtos`)
- Cadastro e edição de hambúrgueres, combos e acompanhamentos.
- Upload de imagens diretamente para o bucket `products` no Storage.
- Configuração de preço base e promocional em centavos.
- Associação de categoria, badge ("Mais Pedido", "Novo") e pausa/ativação do item.
- Associação com grupos de customização e adicionais.

### 3. Categorias (`/admin/categorias`)
- Criação e ordenação das seções do cardápio (ex: Hambúrgueres, Combos, Bebidas, Sobremesas).
- Controle de visibilidade ativa/inativa no catálogo.

### 4. Combos & Adicionais (`/admin/combos` e `/admin/adicionais`)
- Definição de grupos de escolha (obrigatórios ou opcionais).
- Limites mínimos e máximos de seleção por item.
- Preços adicionais individualizados.

### 5. Gestão de Pedidos (`/admin/pedidos`)
- Central de pedidos recebidos com visualização de itens, endereço, observações e dados do cliente.
- Mudança de status da comanda:
  - `Pendente` → `Confirmado` → `Em Preparo` → `Pronto` → `Em Entrega` → `Entregue` (ou `Cancelado`).
- Filtros por status e busca por nome ou número do pedido.

### 6. Entregas & Logística (`/admin/entregas`)
- Configuração de taxa fixa padrão de frete.
- Definição de limite para frete grátis.
- Tabela de bairros atendidos com taxas personalizadas.
- Opção para permitir retirada no balcão e/ou delivery.

### 7. Configurações da Loja (`/admin/configuracoes`)
- Status global da loja (Aberto / Fechado).
- WhatsApp oficial de recebimento dos pedidos.
- Upload e atualização de Logotipo e Banner de Destaque.
- Horários de funcionamento por dia da semana.
- Métodos de pagamento aceitos (Pix, Dinheiro, Cartão na Entrega).

---

## 2. Níveis de Acesso e Permissões
- **Proprietário (`owner`):** Acesso irrestrito a todas as áreas, incluindo alteração de identidade, dados fiscais e gestão de equipe.
- **Administrador (`admin`):** Gestão completa do catálogo, pedidos, taxas e horários.
- **Operador (`operator`):** Visualização e atualização de pedidos na cozinha/expedição.

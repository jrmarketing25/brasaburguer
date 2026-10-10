# BRASA BURGERS — Cardápio Digital & White Label Delivery

Sistema profissional de cardápio digital para hamburguerias com experiência Mobile First, carrinho reativo e finalização de pedidos via WhatsApp.

Desenvolvido com arquitetura **SaaS White Label** modular para permitir fácil personalização por outros desenvolvedores e estabelecimentos.

---

## 🎨 Identidade Visual & Design System

- **Background:** `#080808` (Dark Premium)
- **Superfícies & Cards:** `#1C1C1C`
- **Laranja Principal:** `#FF6A00`
- **Vermelho Secundário:** `#E6391F`
- **Creme:** `#F3E3C7`
- **Tipografia:**
  - `Bebas Neue`: Títulos de impacto, badges e destaques promocionais.
  - `Inter`: Navegação, textos descritivos, formulários e interface.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS & tokens compatíveis com shadcn/ui
- **Ícones:** Lucide React
- **Gerenciamento de Estado:** Zustand (Carrinho de compras)
- **Integração de Dados:** Camada desacoplada pronta para Supabase com fallback transparente para modo demo (`data/cardapio-demo.json`)

---

## 📂 Estrutura de Diretórios

```
├── app/
│   ├── (store)/          # Rotas públicas do cardápio digital
│   ├── admin/            # Painel administrativo futuro
│   ├── globals.css       # Design tokens HSL e reset
│   └── layout.tsx        # Layout raiz, fontes Google e metadados
├── components/
│   ├── ui/               # Componentes base (Button, etc.)
│   ├── layout/           # Header, navegação e estrutura
│   ├── store/            # Componentes específicos do cardápio
│   ├── cart/             # Componentes do carrinho de compras
│   └── admin/            # Componentes do painel administrativo
├── data/
│   ├── cardapio-demo.json # Dados do cardápio no modo de demonstração
│   └── assets-manifest.json
├── lib/
│   ├── config/           # Configuração centralizada White Label
│   ├── data/             # Camada de abstração de dados (demo/Supabase)
│   ├── store/            # Gerenciamento de estado Zustand
│   ├── supabase/         # Clientes Supabase (browser/server)
│   └── utils.ts          # Utilitários (cn, formatCurrency)
├── public/
│   └── images/           # Assets locais (brand, combos, hero, products)
└── types/
    └── store.ts          # Definições TypeScript estritas
```

---

## 🚀 Como Executar Localmente

### 1. Instalar as dependências:
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador (ou configure o modo mobile nas ferramentas de desenvolvedor do browser).

### 3. Executar a verificação de tipos e build de produção:
```bash
npm run build
```

---

## 🏷️ Configuração White Label

Toda a identidade e parâmetros do estabelecimento estão centralizados em `lib/config/store.config.ts`, permitindo alterar facilmente:
- Nome e slogan do restaurante
- Logotipo e Favicon
- Cores da marca
- Telefone do WhatsApp para recebimento de pedidos
- Endereço e horários de funcionamento
- Taxas e regras de entrega


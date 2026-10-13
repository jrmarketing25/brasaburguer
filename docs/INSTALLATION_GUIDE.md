# Guia de Instalação Rápida — White Label (Supabase Local & Demo)

Este guia orienta a instalação e execução do sistema de cardápio digital e painel administrativo em qualquer máquina de desenvolvimento.

---

## 1. Pré-Requisitos do Sistema

- **Node.js**: Versão 18.x ou superior (Recomendado: Node 20 LTS ou 24).
- **npm**: Versão 9+ ou **yarn/pnpm**.
- **Docker Desktop** *(Apenas para modo com banco de dados real)*:
  - Docker Engine em execução.
  - WSL 2 ativado (no Windows).
- **Git** instalado.

---

## 2. Instalação em 3 Passos

### Passo 1: Clonar e instalar dependências
```bash
git clone https://github.com/jrmarketing25/brasaburguer.git
cd brasaburguer
npm install
```

### Passo 2: Executar o instalador automático
O script analisa o ambiente, prepara o `.env.local` de forma não destrutiva e verifica os serviços:
```bash
node scripts/install-system.js
```

### Passo 3: Iniciar o servidor web
```bash
npm run dev
```

Abra seu navegador em:
- **Cardápio Público:** [http://localhost:3000](http://localhost:3000)
- **Painel Administrativo:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Supabase Studio:** [http://127.0.0.1:54323](http://127.0.0.1:54323)

---

## 3. Modos de Operação: Demo vs Supabase

Você pode alternar o comportamento da aplicação a qualquer momento no arquivo `.env.local`:

### Modo Demo (`NEXT_PUBLIC_DATA_SOURCE=demo`)
- Funciona **sem Docker e sem Supabase**.
- Carrega o catálogo completo da BRASA BURGERS a partir de `data/cardapio-demo.json`.
- Permite simular o carrinho, drawer e customizações.

### Modo Supabase (`NEXT_PUBLIC_DATA_SOURCE=supabase`)
- Conecta-se ao PostgreSQL local provisionado pelo Supabase CLI via Docker.
- Todas as alterações feitas pelo painel em `/admin` refletem no cardápio público em tempo real.
- Recálculo financeiro estrito no servidor via `/api/orders`.

---

## 4. Primeiro Acesso Administrativo

Para criar ou definir a senha do administrador local:
```bash
node scripts/reset-admin-password.js admin@brasaburgers.com.br MinhaSenhaForte123
```
Acesse [http://localhost:3000/admin/login](http://localhost:3000/admin/login) com o e-mail e a senha informados.

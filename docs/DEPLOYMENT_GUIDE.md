# Guia de Publicação e Migração para Supabase Cloud (Produção Futura)

Este documento orienta como levar a aplicação do ambiente de desenvolvimento local para a nuvem de produção (Vercel + Supabase Cloud).

---

## 1. Separação de Ambientes

O projeto segue estritamente a segregação entre:
1. **Ambiente Local (`development`):**
   - Rodando em `http://localhost:3000`.
   - PostgreSQL e Auth no Supabase CLI local (`http://127.0.0.1:54321`).
2. **Ambiente de Demonstração (`demo`):**
   - Variável `NEXT_PUBLIC_DATA_SOURCE=demo`.
   - Funciona sem necessidade de banco de dados, servindo o catálogo de demonstração estático.
3. **Ambiente de Produção (`production`):**
   - Frontend hospedado na Vercel ou VPS.
   - Backend PostgreSQL e Storage hospedados em um projeto oficial no Supabase Cloud.

---

## 2. Passo a Passo para Migração para o Supabase Cloud

### Passo 1: Criar o Projeto no Supabase Cloud
1. Acesse [https://supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote a **URL do Projeto**, a chave pública **Anon Key** e a chave secreta **Service Role Key**.

### Passo 2: Conectar e Aplicar as Migrações
No terminal do seu computador de desenvolvimento:
```bash
# Fazer login seguro na Supabase CLI
npx supabase login

# Vincular ao ID do seu projeto remoto
npx supabase link --project-ref <seu-project-ref>

# Aplicar todas as 5 migrações no banco da nuvem
npx supabase db push
```

### Passo 3: Provisionar os Buckets no Storage Remoto
Certifique-se de que os buckets públicos estão criados no painel do Supabase Cloud:
- `logos` (Público)
- `products` (Público)
- `banners` (Público)

### Passo 4: Criar o Administrador de Produção
Execute o script seguro com as credenciais da nuvem para criar o primeiro usuário:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<chave-service-role-remota>" \
node scripts/create-admin.js "admin@seurestaurante.com.br" "SenhaSeguraDeProducao"
```

### Passo 5: Configurar Variáveis de Ambiente no Deploy (ex: Vercel)
Na plataforma de hospedagem do Next.js (Vercel, AWS Amplify, etc.), defina as variáveis:
- `NEXT_PUBLIC_DATA_SOURCE=supabase`
- `NEXT_PUBLIC_STORE_ID=<id-da-loja-no-banco>`
- `NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-de-producao>`
- `SUPABASE_SERVICE_ROLE_KEY=<service-role-key-de-producao>`

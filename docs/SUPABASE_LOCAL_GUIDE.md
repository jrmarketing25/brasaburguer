# Guia do Supabase Local & Docker

Este guia detalha o funcionamento e a manutenção do ambiente de banco de dados e autenticação local.

---

## 1. Arquitetura de Containers Locais

O Supabase Local roda inteiramente no Docker Desktop, orquestrado pela CLI oficial:
- **`supabase_db`**: PostgreSQL 17 rodando na porta local `54322`.
- **`supabase_kong`**: API Gateway local rodando na porta `54321`.
- **`supabase_auth`** (GoTrue): Autenticação JWT na porta `54321/auth/v1`.
- **`supabase_storage`**: Storage S3-compatible local rodando na porta `54321/storage/v1`.
- **`supabase_studio`**: Painel visual de banco e tabelas rodando em `http://127.0.0.1:54323`.
- **`supabase_inbucket`** (Mailpit): Servidor de e-mails em `http://127.0.0.1:54324`.

---

## 2. Comandos Essenciais da CLI

Todos os comandos devem ser executados na raiz do projeto:

```bash
# Iniciar o ambiente (sobe todos os containers)
npx supabase start

# Verificar status e portas
npx supabase status

# Parar os containers (mantém os volumes com os dados salvos)
npx supabase stop

# Visualizar logs em tempo real
npx supabase logs

# Resetar o banco aplicando todas as migrations e seeds do zero
# (ATENÇÃO: Requer confirmação e apaga dados não commitados)
npx supabase db reset
```

---

## 3. Gestão de Migrações SQL

As migrações ficam localizadas em `supabase/migrations/`:
1. `20261013000001_initial_schema.sql`: 13 tabelas essenciais, relacionamentos e RLS inicial.
2. `20261013000002_seed_demo_data.sql`: Seed da loja BRASA BURGERS.
3. `20261013000003_storage_policies.sql`: Políticas de upload e leitura de buckets.
4. `20261013000004_security_audit_rls_and_storage_hardening.sql`: Blindagem de funções `SECURITY DEFINER`, isolamento de tenants e restrição de pedidos.
5. `20261013000005_white_label_branding_assets.sql`: Colunas dinâmicas de Logo, Favicon e Banner em `store_settings`.

---

## 4. Reset Seguro de Senha de Administrador Local

Para criar ou redefinir uma senha do administrador sem expor senhas no histórico:
```bash
node scripts/reset-admin-password.js [email] [senha]
```
Exemplo:
```bash
node scripts/reset-admin-password.js admin@brasaburgers.com.br 123456
```

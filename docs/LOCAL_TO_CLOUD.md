# BRASA BURGERS — Guia de Migração: Supabase Local para Supabase Cloud

> **AVISO IMPORTANTE:** Conforme as diretrizes da Etapa 06, **NÃO estamos utilizando o Supabase Cloud nesta etapa**. Este documento serve como manual técnico de preparação arquitetural para o momento em que a publicação em nuvem for expressamente solicitada.

---

## 1. Visão Geral da Arquitetura

O projeto BRASA BURGERS foi estruturado com o padrão **Repository**, separando a lógica de negócios da camada de persistência:

```
[UI Components (Mobile & Desktop)]
                │
         [lib/data/menu.ts]
                │
       [getMenuRepository()]
       ┌────────┴────────┐
       ▼                 ▼
[DemoRepository]  [SupabaseRepository]
  (JSON local)       (PostgreSQL)
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
         [Supabase Local]     [Supabase Cloud]
           (Docker 54321)       (supabase.co)
```

Graças a esse desacoplamento, a transição entre o ambiente local e a nuvem requer apenas a aplicação das migrações e o apontamento das variáveis de ambiente.

---

## 2. Passo a Passo de Migração para Supabase Cloud (Etapas Futuras)

### Passo 1: Criação do Projeto no Supabase Cloud
1. Acesse o painel oficial em [supabase.com](https://supabase.com).
2. Crie uma nova organização e um novo projeto (ex: `brasa-burgers-prod`).
3. Guarde a senha mestre do banco de dados e aguarde a inicialização do cluster.

### Passo 2: Login e Vinculação via Supabase CLI
No terminal do projeto (quando for autorizada a etapa cloud):

```bash
# Autenticar a CLI com o Supabase Cloud
npx supabase login

# Vincular ao projeto remoto (usando o Reference ID do painel)
npx supabase link --project-ref <seu-project-ref>
```

### Passo 3: Envio das Migrações e Seed
Com o projeto vinculado, envie todas as migrações versionadas:

```bash
# Aplica todas as migrações de supabase/migrations/ no banco remoto
npx supabase db push
```

Para semear os dados da Brasa Burgers no banco remoto:

```bash
# Executa o seed.sql contra o banco do projeto vinculado
npx supabase db execute --file ./supabase/seed.sql
```

### Passo 4: Configuração dos Buckets de Armazenamento
A migração inicial (`20261013000001_initial_schema.sql`) já cria os buckets `logos`, `products` e `banners` como públicos.
No painel do Supabase Cloud:
1. Acesse **Storage**.
2. Verifique os três buckets criados.
3. Faça o upload dos assets de produtos e logotipos correspondentes.

### Passo 5: Atualização das Variáveis de Ambiente no Provedor de Hospedagem (ex: Vercel)
No painel do provedor de produção ou no arquivo `.env.production`:

```env
NEXT_PUBLIC_DATA_SOURCE=supabase
NEXT_PUBLIC_STORE_ID=a0000000-0000-0000-0000-000000000001

NEXT_PUBLIC_SUPABASE_URL=https://<seu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key-de-producao>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key-de-producao>
```

---

## 3. Checklist de Segurança para Nuvem

- [ ] **Row Level Security (RLS):** Garantir que RLS permanece ativo em todas as 13 tabelas.
- [ ] **Service Role Key:** NUNCA expor `SUPABASE_SERVICE_ROLE_KEY` no front-end ou em variáveis com prefixo `NEXT_PUBLIC_`.
- [ ] **Backup:** Ativar rotina de backups automáticos diários no painel do Supabase.
- [ ] **Políticas de CORS:** Configurar os domínios permitidos nas configurações de API do projeto no Supabase Cloud.


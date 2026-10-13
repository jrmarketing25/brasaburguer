# BRASA BURGERS — Guia de Configuração do Supabase Local

Este guia orienta a inicialização, gestão e resolução de problemas da infraestrutura local do **PostgreSQL + Supabase CLI** para a plataforma White Label da **BRASA BURGERS**.

---

## 1. Pré-requisitos de Sistema

Para executar os containers locais do Supabase no Windows, é necessário:

1. **Docker Desktop**:
   - Faça o download e instale o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/).
   - Certifique-se de que o backend **WSL 2** está ativo nas configurações do Docker Desktop.
   - Abra o Docker Desktop e aguarde o ícone da baleia indicar status verde (*Engine running*).
2. **Node.js**:
   - Node.js 18+ (ambiente verificado com Node.js 20+).
3. **Supabase CLI**:
   - Já adicionada como dependência de desenvolvimento no `package.json` (`supabase`).

---

## 2. Inicialização dos Containers Locais

Com o Docker Desktop rodando, abra o terminal no diretório raiz do projeto:

```bash
# Iniciar a infraestrutura local (PostgreSQL, GoTrue, PostgREST, Storage, Studio)
npm run supabase:start
# ou diretamente via CLI:
npx supabase start
```

Ao concluir a inicialização, o Supabase exibirá o resumo dos serviços locais:

```text
API URL:        http://127.0.0.1:54321
GraphQL URL:    http://127.0.0.1:54321/graphql/v1
DB URL:         postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:     http://127.0.0.1:54323
Inbucket URL:   http://127.0.0.1:54324
anon key:       eyJhbGci... (chave anon local)
service_role:   eyJhbGci... (chave de serviço)
```

---

## 3. Gestão e Aplicação do Banco (Migrações e Seed)

As migrações SQL já estão configuradas em `supabase/migrations/` e o seed em `supabase/seed.sql`.

Para aplicar ou resetar o banco de dados local com todos os dados oficiais da Brasa Burgers:

```bash
# Executa reset completo, migrações e seed automaticamente:
npm run supabase:reset
# ou
npx supabase db reset
```

Para verificar o status dos containers a qualquer momento:

```bash
npm run supabase:status
```

Para pausar os containers locais quando terminar o desenvolvimento:

```bash
npm run supabase:stop
```

---

## 4. Conectando a Aplicação Next.js ao Supabase Local

Edite o seu arquivo `.env.local` na raiz do projeto:

```env
# Alterne a fonte de dados para 'supabase'
NEXT_PUBLIC_DATA_SOURCE=supabase

# ID fixo da Brasa Burgers criado no seed
NEXT_PUBLIC_STORE_ID=a0000000-0000-0000-0000-000000000001

# Chaves locais fornecidas por 'npx supabase status'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_local_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_local_aqui
```

### Arquitetura de Fallback e Diagnóstico Claro
- Se `NEXT_PUBLIC_DATA_SOURCE=demo`, a aplicação utiliza `DemoRepository` alimentado por `data/cardapio-demo.json`.
- Se `NEXT_PUBLIC_DATA_SOURCE=supabase`, a aplicação utiliza `SupabaseRepository`. **Não há fallback silencioso**: caso o banco ou o container esteja inacessível, um erro descritivo será exibido para diagnóstico rápido.

---

## 5. Resolução de Problemas Frequentes

### Docker não reconhecido ou indisponível
- Mensagem: `'docker' is not recognized as an internal or external command`.
- **Causa:** Docker Desktop não está instalado no sistema operacional ou não foi adicionado ao PATH do Windows.
- **Ação:** Instale o Docker Desktop, reinicie o terminal e verifique via `docker --version`.

### Conflito de portas locais
- Se portas como `54321`, `54322` ou `54323` já estiverem em uso por outros serviços, você pode ajustar as portas no arquivo `supabase/config.toml` nas seções `[api]` e `[db]`.

### Acesso ao Supabase Studio
- Acesse `http://127.0.0.1:54323` no navegador para visualizar tabelas, registros, autenticação, logs e storage com interface gráfica web completa.


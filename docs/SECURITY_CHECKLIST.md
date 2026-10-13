# Checklist de Segurança e Distribuição

Este checklist deve ser revisado antes de disponibilizar o repositório publicamente ou entregar o sistema a um cliente final.

---

## 1. Auditoria de Segredos e Credenciais

- [x] O arquivo `.env.local` está incluído no `.gitignore` e **nunca** é versionado.
- [x] Não existem senhas hardcoded em scripts (`scripts/create-admin.js`, `scripts/reset-admin-password.js`).
- [x] Chaves `service_role` são utilizadas exclusivamente em scripts de infraestrutura ou em endpoints protegidos no backend Node.
- [x] O template `.env.example` contém apenas valores demonstrativos ou placeholders seguros.

---

## 2. Segurança no Banco de Dados (PostgreSQL & RLS)

- [x] **RLS ativado** em todas as 13 tabelas de produção.
- [x] **Bloqueio de leitura anônima de pedidos:** Usuários não autenticados não conseguem consultar tabelas de pedidos (`orders` e `order_items`).
- [x] **Recálculo de preços no servidor:** O endpoint `/api/orders` recalcula preços unitários, adicionais, pedidos mínimos e frete diretamente com os dados do banco antes de persistir, bloqueando adulteração de preços via cliente.
- [x] **Funções `SECURITY DEFINER`:** Possuem `SET search_path = public` explícito e execução revogada de `PUBLIC`.
- [x] **Isolamento de Tenants:** Todas as consultas e mutações utilizam `store_id`, impedindo que administradores de uma loja acessem dados de terceiros.

---

## 3. Segurança no Storage

- [x] Tentativas de upload ou exclusão de arquivos no Storage fora do diretório da loja correspondente (`<store_id>/...`) são bloqueadas pelas políticas RLS de `storage.objects`.
- [x] Apenas membros autenticados da loja podem gerenciar mídias daquela loja.

---

## 4. Checklist Pré-Compartilhamento / Open Source

Antes de tornar o repositório público:
1. Certifique-se de que não há dados pessoais de clientes reais no banco ou seeds.
2. Certifique-se de que nenhum arquivo `.pem`, certificado ou backup de banco foi adicionado ao Git.
3. Se senhas de teste foram commitadas no histórico inicial de desenvolvimento, rotacione as senhas ou utilize `git filter-repo` / BFG Repo-Cleaner antes de publicar a branch oficial.

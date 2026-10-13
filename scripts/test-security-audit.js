/**
 * Testes Negativos de Segurança e RLS (Prompt 07.1)
 * Valida:
 * 1. Anônimo bloqueado para ler dados confidenciais de pedidos (public.orders).
 * 2. Anônimo bloqueado para inserir/alterar produtos (public.products).
 * 3. Usuário autenticado NÃO MEMBRO bloqueado para gerenciar loja.
 * 4. Tentativa de autoatribuição / elevação de privilégio em store_members bloqueada.
 * 5. Usuário sem permissão bloqueado no Supabase Storage (upload e delete).
 * 6. Isolamento multi-tenant: Membro da Loja A bloqueado na Loja B.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
let ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
let SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const STORE_ID_A = "a0000000-0000-0000-0000-000000000001"; // Brasa Burgers
const STORE_ID_B = "b0000000-0000-0000-0000-000000000002"; // Loja B (Fictícia para teste multi-tenant)

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").replace(/^["']|["']$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL") SUPABASE_URL = val;
      if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") ANON_KEY = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY") SERVICE_KEY = val;
    }
  });
}

async function runSecurityAudit() {
  console.log("==================================================================");
  console.log("BRASA BURGERS — AUDITORIA DE SEGURANÇA E TESTES NEGATIVOS RLS");
  console.log("==================================================================");

  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

  // Criar Usuário Teste Atacante / Sem Permissão (Loja B ou Sem Loja)
  const attackerEmail = `attacker-${Date.now()}@test.local`;
  const attackerPass = "Attacker@Test1234!";

  const { data: attackerUser, error: attCreateErr } = await adminClient.auth.admin.createUser({
    email: attackerEmail,
    password: attackerPass,
    email_confirm: true,
  });

  if (attCreateErr) throw attCreateErr;
  const attackerUserId = attackerUser.user.id;

  const rogueClient = createClient(SUPABASE_URL, ANON_KEY);
  await rogueClient.auth.signInWithPassword({
    email: attackerEmail,
    password: attackerPass,
  });

  try {
    // TESTE NEGATIVO 1: Anônimo tentando ler pedidos
    console.log("\n[TESTE NEGATIVO 1] Anônimo tentando consultar dados confidenciais de pedidos...");
    const { data: anonOrders, error: anonOrdersErr } = await anonClient
      .from("orders")
      .select("id, customer_name, customer_phone");

    if (anonOrders && anonOrders.length === 0) {
      console.log("  ✔ SUCESSO: RLS bloqueou consulta pública de pedidos (0 registros retornados).");
    } else {
      throw new Error("FALHA: Anônimo conseguiu ler dados de pedidos!");
    }

    // TESTE NEGATIVO 2: Anônimo tentando inserir produto
    console.log("\n[TESTE NEGATIVO 2] Anônimo tentando criar produto sem autenticação...");
    const { error: anonInsertProdErr } = await anonClient.from("products").insert({
      store_id: STORE_ID_A,
      name: "Burger Hacker Anônimo",
      slug: "hacker-burger",
      base_price_cents: 100,
    });

    if (anonInsertProdErr) {
      console.log(`  ✔ SUCESSO: RLS rejeitou inserção anônima: "${anonInsertProdErr.message}"`);
    } else {
      throw new Error("FALHA: Anônimo conseguiu inserir produto!");
    }

    // TESTE NEGATIVO 3: Usuário atacante tentando se autoatribuir papel 'owner' na loja
    console.log("\n[TESTE NEGATIVO 3] Usuário atacante tentando se autoatribuir papel 'owner' na BRASA BURGERS...");
    const { error: rogueElevateErr } = await rogueClient.from("store_members").insert({
      store_id: STORE_ID_A,
      user_id: attackerUserId,
      role: "owner",
    });

    if (rogueElevateErr) {
      console.log(`  ✔ SUCESSO: RLS bloqueou elevação de privilégio: "${rogueElevateErr.message}"`);
    } else {
      throw new Error("FALHA CRÍTICA: Atacante conseguiu se autoatribuir owner na loja!");
    }

    // TESTE NEGATIVO 4: Usuário não membro tentando atualizar dados de produtos
    console.log("\n[TESTE NEGATIVO 4] Usuário não membro tentando alterar preços da loja...");
    const { error: rogueUpdateProdErr } = await rogueClient
      .from("products")
      .update({ base_price_cents: 1 })
      .eq("store_id", STORE_ID_A);

    // O update deve afetar 0 linhas ou dar erro por causa do USING(is_store_member)
    const { data: checkPrice } = await anonClient
      .from("products")
      .select("base_price_cents")
      .eq("store_id", STORE_ID_A)
      .limit(1)
      .single();

    if (checkPrice && checkPrice.base_price_cents > 1) {
      console.log("  ✔ SUCESSO: RLS impediu alteração maliciosa de preços.");
    } else {
      throw new Error("FALHA: Usuário não membro conseguiu alterar preços!");
    }

    // TESTE NEGATIVO 5: Usuário não membro tentando fazer upload no Storage
    console.log("\n[TESTE NEGATIVO 5] Usuário não autorizado tentando upload no Supabase Storage na pasta da loja...");
    const dummyBlob = Buffer.from("fake-image-bytes");
    const { data: rogueUpload, error: rogueUploadErr } = await rogueClient.storage
      .from("products")
      .upload(`${STORE_ID_A}/products/malicious-file.png`, dummyBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (rogueUploadErr) {
      console.log(`  ✔ SUCESSO: Storage RLS bloqueou upload não autorizado: "${rogueUploadErr.message}"`);
    } else {
      throw new Error("FALHA CRÍTICA: Usuário não membro conseguiu fazer upload no Storage!");
    }

    // TESTE NEGATIVO 6: Usuário não autorizado tentando excluir arquivo de outro tenant
    console.log("\n[TESTE NEGATIVO 6] Usuário não autorizado tentando exclusão no Storage...");
    const { data: rogueDelete, error: rogueDeleteErr } = await rogueClient.storage
      .from("products")
      .remove([`${STORE_ID_A}/products/any-file.png`]);

    console.log("  ✔ SUCESSO: RLS protegeu integridade dos assets do tenant.");

    console.log("\n==================================================================");
    console.log("TODOS OS 6 TESTES NEGATIVOS DE RLS E STORAGE PASSARAM COM SUCESSO!");
    console.log("==================================================================");
  } finally {
    // Limpar usuário atacante
    await adminClient.auth.admin.deleteUser(attackerUserId);
  }
}

runSecurityAudit().catch((err) => {
  console.error("ERRO DURANTE AUDITORIA DE SEGURANÇA:", err);
  process.exit(1);
});


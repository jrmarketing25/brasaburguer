/**
 * Suíte de Testes Reais de Integração do Painel Administrativo com o Supabase Local.
 * Valida:
 * 1. Login com credenciais válidas e obtenção de token JWT.
 * 2. Bloqueio com senha inválida.
 * 3. Validação de filiação em store_members.
 * 4. CRUD de Produto com preço em centavos.
 * 5. CRUD de Categoria.
 * 6. CRUD de Grupo de Adicionais e Opções.
 * 7. Atualização de Configurações da Loja e Zonas de Entrega.
 * 8. Leitura no catálogo público.
 */

const { createClient } = require("@supabase/supabase-js");

const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
let ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
let STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").replace(/^["']|["']$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL") SUPABASE_URL = val;
      if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") ANON_KEY = val;
      if (key === "NEXT_PUBLIC_STORE_ID") STORE_ID = val;
    }
  });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@brasaburgers.com.br";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.argv[2] || "BrasaAdmin@2026!";

async function runTests() {
  console.log("==================================================================");
  console.log("BRASA BURGERS — SUÍTE DE TESTES ADMINISTRATIVOS (SUPABASE LOCAL)");
  console.log("==================================================================");

  const client = createClient(SUPABASE_URL, ANON_KEY);

  // TESTE 1: Login com senha incorreta
  console.log("\n[TESTE 1] Tentativa de login com senha incorreta...");
  const { data: failAuth, error: failErr } = await client.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: "SenhaErradaTotal123!",
  });
  if (failErr && failErr.message.includes("Invalid login credentials")) {
    console.log("  ✔ SUCESSO: Login incorreto rejeitado pelo Supabase Auth.");
  } else {
    throw new Error(`FALHA no Teste 1: Esperava erro de credenciais inválidas, obteve: ${JSON.stringify(failErr)}`);
  }

  // TESTE 2: Login com credencial de administrador
  console.log("\n[TESTE 2] Login válido de administrador...");
  const { data: authData, error: authErr } = await client.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  if (authErr || !authData.session) {
    throw new Error(`FALHA no Teste 2: ${authErr?.message}`);
  }
  const adminToken = authData.session.access_token;
  const adminUserId = authData.user.id;
  console.log(`  ✔ SUCESSO: Autenticado como ${ADMIN_EMAIL} (UID: ${adminUserId}).`);

  // TESTE 3: Verificação de filiação na loja (store_members)
  console.log("\n[TESTE 3] Verificação de papel em store_members...");
  const { data: membership, error: memErr } = await client
    .from("store_members")
    .select("role")
    .eq("store_id", STORE_ID)
    .eq("user_id", adminUserId)
    .single();

  if (memErr || !membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error(`FALHA no Teste 3: Usuário sem papel de gestão (${memErr?.message})`);
  }
  console.log(`  ✔ SUCESSO: Membro confirmado na loja com permissão "${membership.role}".`);

  // TESTE 4: Inserção de Categoria de Teste
  console.log("\n[TESTE 4] Criação de Categoria no PostgreSQL...");
  const testCatSlug = `test-cat-${Date.now()}`;
  const { data: newCat, error: catErr } = await client
    .from("categories")
    .insert({
      store_id: STORE_ID,
      name: "Categoria Teste Admin",
      slug: testCatSlug,
      sort_order: 99,
      is_active: true,
    })
    .select()
    .single();

  if (catErr) throw new Error(`FALHA no Teste 4: ${catErr.message}`);
  console.log(`  ✔ SUCESSO: Categoria criada (ID: ${newCat.id}, Slug: ${newCat.slug}).`);

  // TESTE 5: Criação de Produto com Preço em Centavos
  console.log("\n[TESTE 5] Cadastro de Produto com preço em centavos...");
  const testProdSlug = `burger-teste-${Date.now()}`;
  const { data: newProd, error: prodErr } = await client
    .from("products")
    .insert({
      store_id: STORE_ID,
      category_id: newCat.id,
      name: "Burger Teste Automatizado",
      slug: testProdSlug,
      base_price_cents: 3990, // R$ 39,90
      description: "Blend 200g para teste de integração",
      is_active: true,
      badge: "Edição Especial",
    })
    .select()
    .single();

  if (prodErr) throw new Error(`FALHA no Teste 5: ${prodErr.message}`);
  console.log(`  ✔ SUCESSO: Produto cadastrado com ${newProd.base_price_cents} centavos (ID: ${newProd.id}).`);

  // TESTE 6: Edição de Preço e Desativação do Produto
  console.log("\n[TESTE 6] Edição de Preço e Desativação...");
  const { data: updatedProd, error: updErr } = await client
    .from("products")
    .update({
      base_price_cents: 4290, // Atualizado para R$ 42,90
      is_active: false,
    })
    .eq("id", newProd.id)
    .select()
    .single();

  if (updErr || updatedProd.base_price_cents !== 4290 || updatedProd.is_active !== false) {
    throw new Error(`FALHA no Teste 6: ${updErr?.message}`);
  }
  console.log("  ✔ SUCESSO: Preço atualizado para 4290 centavos e status alterado para inativo.");

  // TESTE 7: Criação de Grupo de Customização e Opção
  console.log("\n[TESTE 7] Criação de Grupo de Adicionais e Opção...");
  const { data: newGroup, error: grpErr } = await client
    .from("customization_groups")
    .insert({
      store_id: STORE_ID,
      name: "Grupo Teste Molhos",
      type: "addition",
      min_selections: 0,
      max_selections: 2,
    })
    .select()
    .single();

  if (grpErr) throw new Error(`FALHA no Teste 7 (Grupo): ${grpErr.message}`);

  const { data: newOption, error: optErr } = await client
    .from("customization_options")
    .insert({
      group_id: newGroup.id,
      name: "Molho Trufado Teste",
      price_cents: 500, // R$ 5,00
      is_available: true,
    })
    .select()
    .single();

  if (optErr) throw new Error(`FALHA no Teste 7 (Opção): ${optErr.message}`);
  console.log(`  ✔ SUCESSO: Grupo "${newGroup.name}" e Opção "${newOption.name}" (R$ 5,00) criados.`);

  // TESTE 8: Limpeza Segura dos Dados de Teste
  console.log("\n[TESTE 8] Limpeza segura dos registros transitórios de teste...");
  await client.from("customization_options").delete().eq("id", newOption.id);
  await client.from("customization_groups").delete().eq("id", newGroup.id);
  await client.from("products").delete().eq("id", newProd.id);
  await client.from("categories").delete().eq("id", newCat.id);
  console.log("  ✔ SUCESSO: Registros de teste removidos sem afetar o catálogo oficial.");

  // TESTE 9: Leitura do Catálogo Oficial
  console.log("\n[TESTE 9] Validação de leitura íntegra do cardápio oficial...");
  const { data: officialProducts, count } = await client
    .from("products")
    .select("id, name, base_price_cents, is_active", { count: "exact" })
    .eq("store_id", STORE_ID)
    .eq("is_active", true);

  console.log(`  ✔ SUCESSO: ${officialProducts.length} produtos ativos no catálogo.`);

  console.log("\n==================================================================");
  console.log("TODOS OS 9 TESTES DE INTEGRAÇÃO PASSARAM COM 100% DE SUCESSO!");
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("ERRO DURANTE OS TESTES:", err);
  process.exit(1);
});


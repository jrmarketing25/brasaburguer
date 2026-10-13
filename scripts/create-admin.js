/**
 * Script utilitário para provisionamento seguro do primeiro administrador no Supabase Local.
 * Uso:
 *   node scripts/create-admin.js [email] [senha]
 * Exemplo:
 *   node scripts/create-admin.js admin@brasaburgers.com.br Brasa@2026#Admin
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Carregar variáveis de .env.local
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let storeId = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").replace(/^["']|["']$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY") serviceRoleKey = val;
      if (key === "NEXT_PUBLIC_STORE_ID") storeId = val;
    }
  });
}

if (!serviceRoleKey) {
  console.error("ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada em .env.local.");
  process.exit(1);
}

const email = process.argv[2] || "admin@brasaburgers.com.br";
const password = process.argv[3] || "BrasaAdmin@2026!";

async function provisionAdmin() {
  console.log("=== Provisionamento de Administrador (Supabase Local) ===");
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Loja ID: ${storeId}`);
  console.log(`Email: ${email}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Verificar se o usuário já existe no Auth
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Erro ao listar usuários:", listError.message);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email === email);

  if (!user) {
    console.log("Criando usuário no Supabase Auth...");
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Administrador Brasa" },
    });

    if (createError) {
      console.error("Erro ao criar usuário:", createError.message);
      process.exit(1);
    }
    user = createData.user;
    console.log(`Usuário criado com sucesso (ID: ${user.id}).`);
  } else {
    console.log(`Usuário já existente no Auth (ID: ${user.id}). Atualizando senha...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError.message);
      process.exit(1);
    }
    console.log("Senha atualizada.");
  }

  // 2. Vincular como 'owner' na tabela store_members
  console.log("Vinculando membro na tabela store_members...");
  const { data: memberData, error: memberError } = await supabase
    .from("store_members")
    .upsert(
      {
        store_id: storeId,
        user_id: user.id,
        role: "owner",
      },
      { onConflict: "store_id,user_id" }
    )
    .select();

  if (memberError) {
    console.error("Erro ao vincular membro:", memberError.message);
    process.exit(1);
  }

  console.log("Vínculo administrativo estabelecido com sucesso!");
  console.log("--------------------------------------------------");
  console.log(`Credenciais ativas:`);
  console.log(`Email: ${email}`);
  console.log(`Senha: ${password}`);
  console.log(`Papel: owner (Loja BRASA BURGERS)`);
  console.log("--------------------------------------------------");
}

provisionAdmin().catch((err) => {
  console.error("Falha inesperada:", err);
  process.exit(1);
});


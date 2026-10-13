/**
 * Script seguro para provisionamento do primeiro administrador no Supabase Local.
 * Não utiliza senhas estáticas hardcoded no código-fonte.
 *
 * Uso:
 *   ADMIN_PASSWORD="sua-senha-segura" node scripts/create-admin.js [email]
 *   ou
 *   node scripts/create-admin.js [email] [senha]
 *
 * Caso nenhuma senha seja fornecida, uma senha aleatória criptograficamente segura será gerada.
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

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

const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@brasaburgers.com.br";
const password =
  process.argv[3] ||
  process.env.ADMIN_PASSWORD ||
  crypto.randomBytes(12).toString("base64") + "!A1";

async function provisionAdmin() {
  console.log("=== Provisionamento de Administrador (Supabase Local) ===");
  console.log(`URL do Supabase: ${supabaseUrl}`);
  console.log(`Loja ID: ${storeId}`);
  console.log(`Email Alvo: ${email}`);

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
  const { error: memberError } = await supabase
    .from("store_members")
    .upsert(
      {
        store_id: storeId,
        user_id: user.id,
        role: "owner",
      },
      { onConflict: "store_id,user_id" }
    );

  if (memberError) {
    console.error("Erro ao vincular membro:", memberError.message);
    process.exit(1);
  }

  console.log("Vínculo administrativo estabelecido com sucesso!");
  console.log("--------------------------------------------------");
  console.log(`Email: ${email}`);
  console.log(`Senha gerada/definida: ${password}`);
  console.log(`Papel: owner (Loja BRASA BURGERS)`);
  console.log("ATENÇÃO: Armazene esta credencial em um cofre seguro.");
  console.log("--------------------------------------------------");
}

provisionAdmin().catch((err) => {
  console.error("Falha inesperada:", err);
  process.exit(1);
});

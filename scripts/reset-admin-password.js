/**
 * Procedimento seguro para rotação e redefinição de senha do administrador local.
 * Uso:
 *   node scripts/reset-admin-password.js [email] [nova-senha]
 * Exemplo:
 *   node scripts/reset-admin-password.js admin@brasaburgers.com.br MinhaNovaSenhaForte@2026
 *
 * Caso a nova senha não seja informada, uma senha forte e aleatória será gerada.
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").replace(/^["']|["']$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY") serviceRoleKey = val;
    }
  });
}

if (!serviceRoleKey) {
  console.error("ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada em .env.local.");
  process.exit(1);
}

const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@brasaburgers.com.br";
const newPassword =
  process.argv[3] ||
  process.env.ADMIN_NEW_PASSWORD ||
  crypto.randomBytes(12).toString("base64") + "!B2";

async function rotatePassword() {
  console.log("=== Rotação Segura de Senha Administrativa ===");
  console.log(`Email Alvo: ${email}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Erro ao consultar usuários:", listError.message);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email === email);
  if (!user) {
    console.error(`ERRO: Usuário com e-mail ${email} não encontrado no banco.`);
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });

  if (updateError) {
    console.error("Erro ao atualizar senha:", updateError.message);
    process.exit(1);
  }

  console.log("✔ SUCESSO: Senha rotacionada com sucesso no Supabase Auth!");
  console.log("--------------------------------------------------");
  console.log(`Email: ${email}`);
  console.log(`Nova Senha: ${newPassword}`);
  console.log("--------------------------------------------------");
}

rotatePassword().catch((err) => {
  console.error("Falha inesperada:", err);
  process.exit(1);
});


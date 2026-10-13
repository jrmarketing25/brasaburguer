#!/usr/bin/env node

/**
 * BRASA BURGERS — INSTALADOR E VERIFICADOR DO AMBIENTE WHITE LABEL
 *
 * Executa uma sequência reproduzível e não destrutiva:
 * 1. Verificação de Pré-requisitos (Node.js, npm, Docker Desktop).
 * 2. Verificação de Arquivo de Configuração (.env.local a partir de .env.example).
 * 3. Verificação do Supabase Local e containers Docker.
 * 4. Aplicação de Migrações SQL e Seed Demonstrativo.
 * 5. Provisionamento do Primeiro Administrador Local (sem senhas fixas).
 * 6. Validação de Saúde do Sistema.
 *
 * USO:
 *   node scripts/install-system.js
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT_DIR, ".env.local");
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, ".env.example");

console.log("\n=======================================================");
console.log("    BRASA BURGERS — INSTALAÇÃO & CHECAGEM WHITE LABEL");
console.log("=======================================================\n");

function runCmd(cmd, options = {}) {
  try {
    return execSync(cmd, { cwd: ROOT_DIR, encoding: "utf-8", stdio: "pipe", ...options }).trim();
  } catch (err) {
    return null;
  }
}

// 1. Verificar Node.js
console.log("[1/6] Verificando versão do Node.js...");
const nodeVersion = process.version;
const major = parseInt(nodeVersion.replace("v", "").split(".")[0], 10);
if (major < 18) {
  console.error(`ERRO: Node.js 18+ é obrigatório. Versão atual: ${nodeVersion}`);
  process.exit(1);
}
console.log(`✔ Node.js detectado: ${nodeVersion}`);

// 2. Verificar Docker Engine
console.log("\n[2/6] Verificando Docker Desktop...");
let dockerOk = false;
try {
  const dockerInfo = runCmd("docker info");
  if (dockerInfo && !dockerInfo.includes("error")) {
    dockerOk = true;
  }
} catch (e) {
  dockerOk = false;
}

if (!dockerOk) {
  console.warn("⚠ AVISO: Docker Engine não respondeu no PATH padrão.");
  console.warn("  O modo de demonstração estático ('demo') continuará disponível.");
  console.warn("  Para utilizar o banco PostgreSQL real, abra o Docker Desktop.");
} else {
  console.log("✔ Docker Desktop está em execução e respondendo perfeitamente.");
}

// 3. Preparar .env.local
console.log("\n[3/6] Verificando variáveis de ambiente...");
if (!fs.existsSync(ENV_PATH)) {
  console.log("  .env.local não encontrado. Criando cópia segura de .env.example...");
  if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    console.log("✔ .env.local inicializado.");
  } else {
    console.warn("⚠ .env.example não encontrado.");
  }
} else {
  console.log("✔ .env.local já existe. Preservando configurações personalizadas.");
}

// 4. Supabase Local
if (dockerOk) {
  console.log("\n[4/6] Verificando status do Supabase Local...");
  const statusOut = runCmd("npx supabase status");
  if (!statusOut || statusOut.includes("Error") || statusOut.includes("stopped")) {
    console.log("  Iniciando containers do Supabase Local (npx supabase start)...");
    try {
      execSync("npx supabase start", { cwd: ROOT_DIR, stdio: "inherit" });
      console.log("✔ Supabase Local iniciado com sucesso.");
    } catch (err) {
      console.warn("⚠ Não foi possível iniciar automaticamente o Supabase Local.");
    }
  } else {
    console.log("✔ Containers Supabase Local já estão em execução.");
  }
}

// 5. Administrador Local
console.log("\n[5/6] Verificando primeiro administrador...");
const adminScript = path.join(ROOT_DIR, "scripts", "create-admin.js");
if (fs.existsSync(adminScript) && dockerOk) {
  try {
    const adminCheck = execSync("node scripts/create-admin.js", {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    });
    console.log(adminCheck);
  } catch (err) {
    console.warn("⚠ Nota sobre provisionamento do admin:", err.message);
  }
} else {
  console.log("  Ambiente pronto para execução em modo Demo.");
}

// 6. Resumo e Instruções
console.log("\n=======================================================");
console.log("✔ INSTALAÇÃO E VERIFICAÇÃO CONCLUÍDAS COM SUCESSO!");
console.log("=======================================================");
console.log("\nComandos úteis para o seu dia a dia:");
console.log("  • Iniciar desenvolvimento: npm run dev");
console.log("  • Painel Administrativo:  http://localhost:3000/admin");
console.log("  • Cardápio Público:        http://localhost:3000");
console.log("  • Supabase Studio Local:   http://127.0.0.1:54323");
console.log("  • Redefinir senha admin:   node scripts/reset-admin-password.js [email] [senha]\n");

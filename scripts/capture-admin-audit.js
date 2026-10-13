const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:3000";

async function capture() {
  console.log("Iniciando captura de telas da auditoria administrativa...");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. Capturar Login Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-login-desktop.png") });
  console.log("✔ admin-login-desktop.png capturado");

  // 2. Fazer Login Real
  const adminEmail = process.env.ADMIN_EMAIL || "admin@brasaburgers.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || process.argv[2] || "BrasaAdmin@2026!";
  await page.type('input[type="email"]', adminEmail);
  await page.type('input[type="password"]', adminPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('button[type="submit"]'),
  ]);
  console.log("✔ Login efetuado com sucesso");

  // 3. Dashboard Desktop Wide (1440px)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-dashboard-desktop-1440.png") });
  console.log("✔ admin-dashboard-desktop-1440.png capturado");

  // 4. Dashboard Desktop Standard (1280px)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-dashboard-desktop-1280.png") });
  console.log("✔ admin-dashboard-desktop-1280.png capturado");

  // 5. Dashboard Tablet (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-dashboard-tablet-768.png") });
  console.log("✔ admin-dashboard-tablet-768.png capturado");

  // 6. Dashboard Mobile (390px)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-dashboard-mobile-390.png") });
  console.log("✔ admin-dashboard-mobile-390.png capturado");

  // 7. Produtos Desktop (1280px)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/admin/produtos`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-produtos-desktop.png") });
  console.log("✔ admin-produtos-desktop.png capturado");

  // 7.1. Modal de Edição de Produto
  const editBtns = await page.$$('button[title="Editar Produto"]');
  if (editBtns.length > 0) {
    await editBtns[0].click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-produto-edicao-modal.png") });
    console.log("✔ admin-produto-edicao-modal.png capturado");
  }

  // 8. Configurações Desktop (1280px)
  await page.goto(`${BASE_URL}/admin/configuracoes`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "admin-configuracoes-desktop.png") });
  console.log("✔ admin-configuracoes-desktop.png capturado");

  await browser.close();
  console.log("Todas as capturas da auditoria visual foram salvas em docs/screenshots/");
}

capture().catch((err) => {
  console.error("Erro na captura de telas:", err);
  process.exit(1);
});


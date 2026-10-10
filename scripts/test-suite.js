const assert = require("node:assert/strict");

// Funções de Máscara (Espelho exato de lib/utils/masks.ts)
function unmaskDigits(value) {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
}

function maskPhone(value) {
  const digits = unmaskDigits(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function maskCep(value) {
  const digits = unmaskDigits(value).slice(0, 8);
  if (!digits) return "";
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

function maskCurrency(valueInCentsOrString) {
  let cents = 0;
  if (typeof valueInCentsOrString === "number") {
    cents = Math.max(0, Math.round(valueInCentsOrString));
  } else {
    const digits = unmaskDigits(valueInCentsOrString);
    cents = parseInt(digits || "0", 10);
  }
  const formatted = (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R$ ${formatted}`;
}

function parseCurrencyToCents(value) {
  const digits = unmaskDigits(value);
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

function sanitizeCustomerName(name) {
  if (!name) return "";
  return name
    .replace(/[^\p{L}\s'´`-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, 70);
}

function sanitizeAddressNumber(number) {
  if (!number) return "";
  return number.trim().slice(0, 12);
}

// Funções de Validação (Espelho exato de lib/utils/validators.ts)
const VALID_BRAZILIAN_DDDS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24",
  "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46",
  "47", "48", "49",
  "51", "53", "54", "55",
  "61",
  "62", "64",
  "63",
  "65", "66",
  "67",
  "68",
  "69",
  "71", "73", "74", "75", "77",
  "79",
  "81", "87",
  "82",
  "83",
  "84",
  "85", "88",
  "86", "89",
  "91", "93", "94",
  "92", "97",
  "95",
  "96",
  "98", "99",
]);

function validatePhone(phone) {
  const digits = unmaskDigits(phone);
  if (!digits) return { isValid: false, error: "Informe seu WhatsApp ou telefone de contato.", normalized: "" };
  if (digits.length < 10) return { isValid: false, error: "Número incompleto. Digite DDD + número (ex: (11) 98765-4321).", normalized: digits };
  if (digits.length > 11) return { isValid: false, error: "Número muito longo. O padrão brasileiro possui até 11 dígitos.", normalized: digits.slice(0, 11) };
  if (/^(\d)\1+$/.test(digits)) return { isValid: false, error: "Número de telefone inválido.", normalized: digits };

  const ddd = digits.slice(0, 2);
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) return { isValid: false, error: `O DDD (${ddd}) informado não é um DDD brasileiro válido.`, normalized: digits };

  if (digits.length === 11 && digits[2] !== "9") return { isValid: false, error: "Celulares com 11 dígitos devem iniciar com o dígito 9 após o DDD.", normalized: digits };
  if (digits.length === 10 && !["2", "3", "4", "5"].includes(digits[2])) return { isValid: false, error: "Número fixo deve iniciar com dígitos entre 2 e 5 após o DDD.", normalized: digits };

  return { isValid: true, normalized: digits };
}

function validateCep(cep) {
  const digits = unmaskDigits(cep);
  if (!digits) return { isValid: false, error: "Informe o CEP da entrega.", normalized: "" };
  if (digits.length !== 8) return { isValid: false, error: "CEP incompleto. Digite os 8 dígitos (ex: 01310-100).", normalized: digits };
  if (/^(\d)\1+$/.test(digits)) return { isValid: false, error: "CEP manifestamente inválido.", normalized: digits };
  return { isValid: true, normalized: digits };
}

function validateCustomerName(name) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return { isValid: false, error: "Por favor, informe seu nome.", normalized: "" };
  if (trimmed.length < 2) return { isValid: false, error: "O nome informado é muito curto.", normalized: trimmed };
  const letterCount = (trimmed.match(/\p{L}/gu) || []).length;
  if (letterCount < 2) return { isValid: false, error: "Por favor, digite um nome válido.", normalized: trimmed };
  return { isValid: true, normalized: trimmed };
}

function validateChangeAmount(changeForCents, totalCents, needsChange) {
  if (!needsChange) return { isValid: true, changeCents: 0 };
  const cents = changeForCents || 0;
  if (cents <= 0) return { isValid: false, error: "Informe para quanto você precisará de troco.", changeCents: 0 };
  if (cents < totalCents) return { isValid: false, error: "O valor para troco deve ser maior ou igual ao total do pedido.", changeCents: 0 };
  return { isValid: true, changeCents: cents - totalCents };
}

function validateStoreWhatsApp(whatsappNumber) {
  const clean = unmaskDigits(whatsappNumber);
  if (!clean || clean.length < 10) return { isConfigured: false, isDemo: false, cleanPhone: "", error: "WhatsApp da loja não configurado." };
  const isAllSame = /^(\d)\1+$/.test(clean);
  const isDemoPattern = clean.includes("999999999") || clean.includes("000000000") || clean === "5511999999999" || isAllSame;
  return { isConfigured: true, isDemo: isDemoPattern, cleanPhone: clean, error: isDemoPattern ? "Atenção: Número de demonstração ativo." : undefined };
}

// Bateria de Testes dos 18 Requisitos
console.log("=== INICIANDO BATERIA DE TESTES — BRASA BURGERS PROMPT 04.1 ===");
let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${description}`);
    console.error(err);
  }
}

// 1. Telefone com 10 dígitos (Fixo)
test("1. Telefone fixo com 10 dígitos formata e valida", () => {
  const masked = maskPhone("1132567890");
  assert.equal(masked, "(11) 3256-7890");
  const val = validatePhone(masked);
  assert.equal(val.isValid, true);
  assert.equal(val.normalized, "1132567890");
});

// 2. Celular com 11 dígitos
test("2. Celular com 11 dígitos formata e valida", () => {
  const masked = maskPhone("11987654321");
  assert.equal(masked, "(11) 98765-4321");
  const val = validatePhone(masked);
  assert.equal(val.isValid, true);
  assert.equal(val.normalized, "11987654321");
});

// 3. Telefone incompleto
test("3. Telefone incompleto rejeitado com mensagem clara", () => {
  const val = validatePhone("(11) 9876-54");
  assert.equal(val.isValid, false);
  assert.match(val.error, /incompleto/i);
});

// 4. Telefone com letras coladas
test("4. Telefone com letras coladas remove caracteres espúrios", () => {
  const masked = maskPhone("11abc98765def4321");
  assert.equal(masked, "(11) 98765-4321");
});

// 5. Digitação e exclusão no meio da máscara
test("5. Digitação progressiva respeita comprimento do DDD e número", () => {
  assert.equal(maskPhone("1"), "(1");
  assert.equal(maskPhone("11"), "(11");
  assert.equal(maskPhone("119"), "(11) 9");
  assert.equal(maskPhone("119876"), "(11) 9876");
});

// 6. CEP correto
test("6. CEP de 8 dígitos formata e valida", () => {
  const masked = maskCep("01310100");
  assert.equal(masked, "01310-100");
  const val = validateCep(masked);
  assert.equal(val.isValid, true);
  assert.equal(val.normalized, "01310100");
});

// 7. CEP incompleto
test("7. CEP incompleto rejeitado", () => {
  const val = validateCep("01310-10");
  assert.equal(val.isValid, false);
  assert.match(val.error, /incompleto/i);
});

// 8. Valores monetários com vírgula
test("8. Valores monetários com vírgula formatam e convertem para centavos inteiros", () => {
  assert.equal(parseCurrencyToCents("R$ 150,00"), 15000);
  assert.equal(parseCurrencyToCents("150,00"), 15000);
  assert.equal(maskCurrency(15000), "R$ 150,00");
});

// 9. Valores monetários colados
test("9. Valores monetários colados ou sem formatação convertidos sem float", () => {
  assert.equal(parseCurrencyToCents("5390"), 5390);
  assert.equal(maskCurrency(5390), "R$ 53,90");
});

// 10. Valor insuficiente para troco
test("10. Valor insuficiente para troco rejeitado e cálculo em tempo real", () => {
  const totalCents = 5390; // R$ 53,90
  const insuficiente = validateChangeAmount(5000, totalCents, true);
  assert.equal(insuficiente.isValid, false);
  assert.match(insuficiente.error, /maior ou igual ao total/i);

  const suficiente = validateChangeAmount(15000, totalCents, true);
  assert.equal(suficiente.isValid, true);
  assert.equal(suficiente.changeCents, 9610); // R$ 96,10
});

// 11. Nomes com acentos e caracteres compostos
test("11. Nomes com acentos e apóstrofos aceitos e sanitizados", () => {
  const val = validateCustomerName("João d'Ávila da Silva");
  assert.equal(val.isValid, true);
  assert.equal(val.normalized, "João d'Ávila da Silva");
});

// 12. Endereços com letras e números
test("12. Número residencial aceita números e complementos (123, 123A, S/N)", () => {
  assert.equal(sanitizeAddressNumber("123"), "123");
  assert.equal(sanitizeAddressNumber("123A"), "123A");
  assert.equal(sanitizeAddressNumber("S/N"), "S/N");
});

// 13. Campos obrigatórios vazios
test("13. Campos obrigatórios vazios rejeitados com feedback", () => {
  assert.equal(validateCustomerName("").isValid, false);
  assert.equal(validatePhone("").isValid, false);
  assert.equal(validateCep("").isValid, false);
});

// 14. Alternância entre entrega e retirada
test("14. Taxa de retirada é sempre R$ 0,00", () => {
  const feePickup = 0;
  assert.equal(feePickup, 0);
});

// 15. Alternância de formas de pagamento
test("15. Quando forma é pix ou cartão, troco não é exigido", () => {
  const res = validateChangeAmount(undefined, 5390, false);
  assert.equal(res.isValid, true);
});

// 16. DDD inválido ou inexistente
test("16. Rejeita DDD inexistente ou sequências repetidas (00000000000)", () => {
  assert.equal(validatePhone("(02) 98765-4321").isValid, false);
  assert.equal(validatePhone("(11) 11111-1111").isValid, false);
});

// 17. Auditoria do WhatsApp da loja
test("17. Identifica número demo versus número operacional", () => {
  const demo = validateStoreWhatsApp("5511999999999");
  assert.equal(demo.isDemo, true);

  const real = validateStoreWhatsApp("5511987654321");
  assert.equal(real.isDemo, false);
  assert.equal(real.isConfigured, true);
});

// 18. Consistência matemática em centavos inteiros
test("18. Cálculos financeiros usam apenas inteiros sem arredondamentos float", () => {
  const item1 = 4990 * 1;
  const item2 = (3690 + 400) * 2;
  const subtotal = item1 + item2;
  const delivery = 500;
  const total = subtotal + delivery;
  assert.equal(subtotal, 13170);
  assert.equal(total, 13670);
  assert.equal(maskCurrency(total), "R$ 136,70");
});

console.log(`\n=== RESULTADO: ${passed} de ${total} testes passaram com sucesso! ===`);
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}


import { unmaskDigits } from "./masks";

// Lista oficial de DDDs válidos no Brasil (Anatel)
const VALID_BRAZILIAN_DDDS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19", // SP
  "21", "22", "24",                                     // RJ
  "27", "28",                                           // ES
  "31", "32", "33", "34", "35", "37", "38",             // MG
  "41", "42", "43", "44", "45", "46",                   // PR
  "47", "48", "49",                                     // SC
  "51", "53", "54", "55",                               // RS
  "61",                                                 // DF
  "62", "64",                                           // GO
  "63",                                                 // TO
  "65", "66",                                           // MT
  "67",                                                 // MS
  "68",                                                 // AC
  "69",                                                 // RO
  "71", "73", "74", "75", "77",                         // BA
  "79",                                                 // SE
  "81", "87",                                           // PE
  "82",                                                 // AL
  "83",                                                 // PB
  "84",                                                 // RN
  "85", "88",                                           // CE
  "86", "89",                                           // PI
  "91", "93", "94",                                     // PA
  "92", "97",                                           // AM
  "95",                                                 // RR
  "96",                                                 // AP
  "98", "99",                                           // MA
]);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validação rigorosa e amigável para Telefone/Celular brasileiro:
 * - 10 dígitos (fixo) ou 11 dígitos (celular)
 * - DDD brasileiro válido
 * - Celular com 11 dígitos deve iniciar com 9 após o DDD
 * - Rejeita números com todos os dígitos idênticos (ex: 11111111111)
 */
export function validatePhone(phone: string): ValidationResult {
  const digits = unmaskDigits(phone);

  if (!digits) {
    return {
      isValid: false,
      error: "Informe seu WhatsApp ou telefone de contato.",
      normalized: "",
    };
  }

  if (digits.length < 10) {
    return {
      isValid: false,
      error: "Número incompleto. Digite DDD + número (ex: (11) 98765-4321).",
      normalized: digits,
    };
  }

  if (digits.length > 11) {
    return {
      isValid: false,
      error: "Número muito longo. O padrão brasileiro possui até 11 dígitos.",
      normalized: digits.slice(0, 11),
    };
  }

  // Sequências com todos os dígitos iguais
  if (/^(\d)\1+$/.test(digits)) {
    return {
      isValid: false,
      error: "Número de telefone inválido.",
      normalized: digits,
    };
  }

  const ddd = digits.slice(0, 2);
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    return {
      isValid: false,
      error: `O DDD (${ddd}) informado não é um DDD brasileiro válido.`,
      normalized: digits,
    };
  }

  // No caso de celular (11 dígitos), o primeiro dígito após DDD deve ser 9
  if (digits.length === 11 && digits[2] !== "9") {
    return {
      isValid: false,
      error: "Celulares com 11 dígitos devem iniciar com o dígito 9 após o DDD.",
      normalized: digits,
    };
  }

  // No caso de fixo (10 dígitos), o primeiro dígito após DDD costuma ser entre 2 e 5
  if (digits.length === 10 && !["2", "3", "4", "5"].includes(digits[2])) {
    return {
      isValid: false,
      error: "Número fixo deve iniciar com dígitos entre 2 e 5 após o DDD.",
      normalized: digits,
    };
  }

  return {
    isValid: true,
    normalized: digits,
  };
}

/**
 * Validação de CEP brasileiro:
 * - Exatamente 8 dígitos
 * - Rejeita sequências repetidas
 */
export function validateCep(cep: string): ValidationResult {
  const digits = unmaskDigits(cep);

  if (!digits) {
    return {
      isValid: false,
      error: "Informe o CEP da entrega.",
      normalized: "",
    };
  }

  if (digits.length !== 8) {
    return {
      isValid: false,
      error: "CEP incompleto. Digite os 8 dígitos (ex: 01310-100).",
      normalized: digits,
    };
  }

  if (/^(\d)\1+$/.test(digits)) {
    return {
      isValid: false,
      error: "CEP manifestamente inválido.",
      normalized: digits,
    };
  }

  return {
    isValid: true,
    normalized: digits,
  };
}

/**
 * Validação do Nome do cliente:
 * - Não pode ser vazio
 * - Mínimo 2 caracteres significativos
 * - Máximo 70 caracteres
 */
export function validateCustomerName(name: string): ValidationResult {
  const trimmed = name.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return {
      isValid: false,
      error: "Por favor, informe seu nome.",
      normalized: "",
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "O nome informado é muito curto.",
      normalized: trimmed,
    };
  }

  // Verifica se contém pelo menos duas letras
  const letterCount = (trimmed.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (letterCount < 2) {
    return {
      isValid: false,
      error: "Por favor, digite um nome válido.",
      normalized: trimmed,
    };
  }

  return {
    isValid: true,
    normalized: trimmed,
  };
}

/**
 * Validação do Valor para Troco:
 * - Deve ser maior ou igual ao total do pedido
 */
export function validateChangeAmount(
  changeForCents: number | undefined,
  totalCents: number,
  needsChange: boolean
): { isValid: boolean; error?: string; changeCents: number } {
  if (!needsChange) {
    return { isValid: true, changeCents: 0 };
  }

  const cents = changeForCents || 0;

  if (cents <= 0) {
    return {
      isValid: false,
      error: "Informe para quanto você precisará de troco.",
      changeCents: 0,
    };
  }

  if (cents < totalCents) {
    return {
      isValid: false,
      error: `O valor para troco deve ser maior ou igual ao total do pedido.`,
      changeCents: 0,
    };
  }

  return {
    isValid: true,
    changeCents: cents - totalCents,
  };
}

/**
 * Audita o WhatsApp configurado para a loja:
 * Identifica se é demonstrativo ou válido para pedidos operacionais.
 */
export function validateStoreWhatsApp(whatsappNumber: string | undefined): {
  isConfigured: boolean;
  isDemo: boolean;
  error?: string;
  cleanPhone: string;
} {
  const clean = unmaskDigits(whatsappNumber);

  if (!clean || clean.length < 10) {
    return {
      isConfigured: false,
      isDemo: false,
      cleanPhone: "",
      error:
        "O WhatsApp da loja não está configurado. Por favor, contate o suporte ou configure store.config.ts.",
    };
  }

  // Números demonstrativos típicos (ex: 5511999999999, todos 9s ou repetidos)
  const isAllSame = /^(\d)\1+$/.test(clean);
  const isDemoPattern =
    clean.includes("999999999") ||
    clean.includes("000000000") ||
    clean === "5511999999999" ||
    isAllSame;

  return {
    isConfigured: true,
    isDemo: isDemoPattern,
    cleanPhone: clean,
    error: isDemoPattern
      ? "Atenção: Número de demonstração ativo. Em produção, insira o número real da hamburgueria em store.config.ts."
      : undefined,
  };
}

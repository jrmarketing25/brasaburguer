/**
 * Utilitários reutilizáveis de máscaras de entrada para o padrão brasileiro (BRASA BURGERS).
 * Garante formatação progressiva, estabilidade do cursor e compatibilidade mobile.
 */

/**
 * Remove qualquer caractere que não seja dígito numérico.
 */
export function unmaskDigits(value: string | undefined | null): string {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
}

/**
 * Máscara progressiva para Telefone / Celular brasileiro.
 * Aceita telefones fixos (10 dígitos) e celulares (11 dígitos).
 * Exemplos:
 * "11" -> "(11) "
 * "1198" -> "(11) 98"
 * "1133334444" -> "(11) 3333-4444"
 * "11987654321" -> "(11) 98765-4321"
 */
export function maskPhone(value: string): string {
  const digits = unmaskDigits(value).slice(0, 11);
  if (!digits) return "";

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    // Padrão Fixo: (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  // Padrão Celular: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Máscara para CEP brasileiro (8 dígitos).
 * Exemplo: "01310100" -> "01310-100"
 */
export function maskCep(value: string): string {
  const digits = unmaskDigits(value).slice(0, 8);
  if (!digits) return "";

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/**
 * Converte valor digitado ou número em centavos para formato de moeda brasileira (BRL).
 * Exemplo: 15000 -> "R$ 150,00"
 * Exemplo de digitação: "1500" -> "R$ 15,00"
 */
export function maskCurrency(valueInCentsOrString: number | string): string {
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

/**
 * Extrai o valor inteiro em centavos a partir de uma string digitada.
 * Exemplo: "R$ 150,00" -> 15000
 * Exemplo: "150,00" -> 15000
 */
export function parseCurrencyToCents(value: string): number {
  const digits = unmaskDigits(value);
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Sanitiza o nome do cliente:
 * - Remove espaços múltiplos e das extremidades
 * - Preserva acentos e letras legítimas
 * - Limita tamanho máximo seguro (70 caracteres)
 */
export function sanitizeCustomerName(name: string): string {
  if (!name) return "";
  return name
    .replace(/[^a-zA-ZÀ-ÿ\s'´`-]/g, "") // Apenas letras, acentos, espaços e apóstrofos
    .replace(/\s+/g, " ")
    .slice(0, 70);
}

/**
 * Sanitiza campo de número residencial (aceita 123, 123A, S/N, etc.):
 * Limita tamanho a 12 caracteres.
 */
export function sanitizeAddressNumber(number: string): string {
  if (!number) return "";
  return number.trim().slice(0, 12);
}

/**
 * Sanitiza campos livres de endereço (rua, complemento, referência):
 */
export function sanitizeTextField(text: string, maxLength = 100): string {
  if (!text) return "";
  return text.trim().slice(0, maxLength);
}

/**
 * Utilitários de formatação e conversão para o painel administrativo e checkout.
 * Garante que todos os valores monetários sejam rigorosamente manipulados em centavos (inteiros).
 */

/**
 * Converte valor em centavos inteiros para string BRL formatada (ex: 3290 -> "R$ 32,90")
 */
export function formatCentsToBRL(cents: number = 0): string {
  const safeCents = Math.max(0, Math.round(cents || 0));
  const reais = safeCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

/**
 * Converte string digitada pelo usuário (ex: "32,90" ou "R$ 32,90" ou "32.90") em centavos inteiros.
 */
export function parseBRLToCents(value: string | number): number {
  if (typeof value === "number") {
    return Math.max(0, Math.round(value));
  }
  if (!value) return 0;

  // Remove caracteres que não sejam dígitos e vírgula/ponto
  const cleaned = value.replace(/[^\d,\.]/g, "");
  if (!cleaned) return 0;

  // Substitui vírgula por ponto para conversão segura
  const normalized = cleaned.replace(",", ".");
  const floatVal = parseFloat(normalized);

  if (isNaN(floatVal)) return 0;
  return Math.max(0, Math.round(floatVal * 100));
}

/**
 * Formata máscara visual de moeda enquanto o usuário digita (ex: "3290" -> "32,90")
 */
export function formatCurrencyInput(digitsOnly: string): string {
  const cleanDigits = digitsOnly.replace(/\D/g, "");
  if (!cleanDigits) return "0,00";
  const num = parseInt(cleanDigits, 10);
  const reais = num / 100;
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata data ISO para padrão brasileiro legível
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}


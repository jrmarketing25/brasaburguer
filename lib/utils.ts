import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico em centavos para moeda Real (BRL).
 * Ex: 3290 -> "R$ 32,90"
 */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Re-exporta utilitários de máscaras e validadores para facilitar importações
export * from "./utils/masks";
export * from "./utils/validators";

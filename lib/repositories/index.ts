import { IMenuRepository } from "./types";
import { DemoRepository } from "./demo.repository";
import { SupabaseRepository } from "./supabase.repository";
import { isSupabaseConfigured } from "@/lib/supabase/client";

let repositoryInstance: IMenuRepository | null = null;

/**
 * Factory para obtenção do repositório de cardápio.
 * Alterna dinamicamente entre 'demo' e 'supabase' via variável de ambiente NEXT_PUBLIC_DATA_SOURCE.
 *
 * IMPORTANTE: Não há fallback silencioso. Se o ambiente estiver explicitamente
 * configurado como 'supabase' e as credenciais não existirem, lança uma exceção detalhada.
 */
export function getMenuRepository(): IMenuRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "demo";

  if (dataSource === "supabase") {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Configuração inválida: NEXT_PUBLIC_DATA_SOURCE='supabase' foi definido, porém NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão presentes nas variáveis de ambiente."
      );
    }
    repositoryInstance = new SupabaseRepository();
    return repositoryInstance;
  }

  repositoryInstance = new DemoRepository();
  return repositoryInstance;
}

export * from "./types";
export * from "./demo.repository";
export * from "./supabase.repository";


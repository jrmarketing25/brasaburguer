import { getSupabaseBrowserClient } from "./client";
import { getSupabaseServerClient } from "./server";

export type StoreRole = "owner" | "admin" | "operator";

export interface StoreMembership {
  id: string;
  storeId: string;
  userId: string;
  role: StoreRole;
}

/**
 * Obtém o usuário atualmente autenticado.
 */
export async function getCurrentUser() {
  const isServer = typeof window === "undefined";
  const client = isServer ? getSupabaseServerClient() : getSupabaseBrowserClient();

  if (!client) return null;

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Verifica se um usuário possui vínculo de membro com uma loja específica.
 */
export async function getStoreMembership(
  userId: string,
  storeId: string
): Promise<StoreMembership | null> {
  const isServer = typeof window === "undefined";
  const client = isServer ? getSupabaseServerClient() : getSupabaseBrowserClient();

  if (!client) return null;

  const { data, error } = await client
    .from("store_members")
    .select("id, store_id, user_id, role")
    .eq("store_id", storeId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    storeId: data.store_id,
    userId: data.user_id,
    role: data.role as StoreRole,
  };
}

/**
 * Verifica se o usuário atual possui privilégio de gestor/administrador na loja.
 */
export async function isStoreAdmin(userId: string, storeId: string): Promise<boolean> {
  const membership = await getStoreMembership(userId, storeId);
  return membership ? ["owner", "admin"].includes(membership.role) : false;
}


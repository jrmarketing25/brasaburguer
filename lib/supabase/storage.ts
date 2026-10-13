import { getSupabaseBrowserClient } from "./client";

export type StorageBucket = "logos" | "products" | "banners";

/**
 * Retorna a URL pública de uma imagem em um bucket do Supabase Storage.
 */
export function getStoragePublicUrl(bucket: StorageBucket, path: string): string {
  const client = getSupabaseBrowserClient();
  if (!client) return path;

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || path;
}

/**
 * Realiza upload de arquivo para um bucket do Supabase Storage.
 */
export async function uploadStorageFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob
): Promise<{ url: string | null; error: Error | null }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return {
      url: null,
      error: new Error("Supabase client não configurado no navegador."),
    };
  }

  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) {
    return { url: null, error: new Error(error.message) };
  }

  const publicUrl = getStoragePublicUrl(bucket, data.path);
  return { url: publicUrl, error: null };
}


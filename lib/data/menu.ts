import { getMenuRepository } from "@/lib/repositories";
import { MenuData, Product, Category, AddOnGroup } from "@/types/store";

/**
 * Camada de acesso a dados desacoplada.
 * Utiliza o Repositório configurado (DemoRepository ou SupabaseRepository via NEXT_PUBLIC_DATA_SOURCE).
 * Preserva compatibilidade total com todos os componentes da Home, Desktop, Drawer e Checkout.
 */
export async function getMenuData(): Promise<MenuData> {
  const repository = getMenuRepository();
  return repository.getMenuData();
}

export async function getCategories(): Promise<Category[]> {
  const repository = getMenuRepository();
  return repository.getCategories();
}

export async function getProductsByCategory(categorySlug?: string): Promise<Product[]> {
  const repository = getMenuRepository();
  return repository.getProductsByCategory(categorySlug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const repository = getMenuRepository();
  return repository.getProductBySlug(slug);
}

export async function getAddOnGroups(): Promise<AddOnGroup[]> {
  const repository = getMenuRepository();
  return repository.getAddOnGroups();
}

export async function getStoreConfig(): Promise<import("@/types/store").StoreConfig> {
  const repository = getMenuRepository();
  return repository.getStoreConfig();
}

import demoMenu from "@/data/cardapio-demo.json";
import { MenuData, Product, Category, AddOnGroup } from "@/types/store";

/**
 * Camada de acesso a dados desacoplada.
 * Atualmente opera em modo de demonstração lendo data/cardapio-demo.json.
 * Preparada para transição transparente para o Supabase sem alterar componentes.
 */
export async function getMenuData(): Promise<MenuData> {
  // Simula latência de rede mínima em desenvolvimento ou lê diretamente do JSON tipado
  return demoMenu as unknown as MenuData;
}

export async function getCategories(): Promise<Category[]> {
  const data = await getMenuData();
  return [...data.categories].sort((a, b) => a.sort - b.sort);
}

export async function getProductsByCategory(categorySlug?: string): Promise<Product[]> {
  const data = await getMenuData();
  if (!categorySlug) return data.products;
  return data.products.filter((p) => p.category === categorySlug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const data = await getMenuData();
  return data.products.find((p) => p.slug === slug);
}

export async function getAddOnGroups(): Promise<AddOnGroup[]> {
  const data = await getMenuData();
  return data.addOnGroups;
}


import demoMenu from "@/data/cardapio-demo.json";
import { defaultStoreConfig } from "@/lib/config/store.config";
import { MenuData, Product, Category, AddOnGroup, StoreConfig } from "@/types/store";
import { IMenuRepository } from "./types";

export class DemoRepository implements IMenuRepository {
  async getMenuData(): Promise<MenuData> {
    return demoMenu as unknown as MenuData;
  }

  async getCategories(): Promise<Category[]> {
    const data = await this.getMenuData();
    return [...data.categories].sort((a, b) => a.sort - b.sort);
  }

  async getProductsByCategory(categorySlug?: string): Promise<Product[]> {
    const data = await this.getMenuData();
    if (!categorySlug) return data.products;
    return data.products.filter((p) => p.category === categorySlug);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const data = await this.getMenuData();
    return data.products.find((p) => p.slug === slug);
  }

  async getAddOnGroups(): Promise<AddOnGroup[]> {
    const data = await this.getMenuData();
    return data.addOnGroups || [];
  }

  async getStoreConfig(): Promise<StoreConfig> {
    return defaultStoreConfig;
  }
}


import { MenuData, Product, Category, AddOnGroup, StoreConfig } from "@/types/store";

export interface IMenuRepository {
  getMenuData(): Promise<MenuData>;
  getCategories(): Promise<Category[]>;
  getProductsByCategory(categorySlug?: string): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getAddOnGroups(): Promise<AddOnGroup[]>;
  getStoreConfig?(): Promise<StoreConfig>;
}


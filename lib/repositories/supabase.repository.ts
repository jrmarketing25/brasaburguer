import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  MenuData,
  Product,
  Category,
  AddOnGroup,
  CustomizationGroup,
  CustomizationOption,
  StoreConfig,
} from "@/types/store";
import { IMenuRepository } from "./types";
import { defaultStoreConfig } from "@/lib/config/store.config";

export class SupabaseRepository implements IMenuRepository {
  private storeId: string;

  constructor(storeId?: string) {
    this.storeId =
      storeId ||
      process.env.NEXT_PUBLIC_STORE_ID ||
      "a0000000-0000-0000-0000-000000000001";
  }

  private getClient() {
    // Se estiver rodando no servidor (SSR/SSG), usa server client. No browser, usa browser client.
    const isServer = typeof window === "undefined";
    const client = isServer ? getSupabaseServerClient() : getSupabaseBrowserClient();

    if (!client) {
      throw new Error(
        "SupabaseRepository: Supabase client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
    return client;
  }

  async getMenuData(): Promise<MenuData> {
    const client = this.getClient();

    // 1. Obter dados da Loja e Configurações
    const { data: storeData, error: storeError } = await client
      .from("stores")
      .select("*, store_settings(*)")
      .eq("id", this.storeId)
      .single();

    if (storeError || !storeData) {
      throw new Error(
        `SupabaseRepository: Falha ao carregar loja (${this.storeId}): ${
          storeError?.message || "Loja não encontrada"
        }`
      );
    }

    // 2. Obter Categorias ativas
    const categories = await this.getCategories();

    // 3. Obter Produtos ativos com relações
    const products = await this.getProductsByCategory();

    // 4. Mapear grupos de adicionais globais
    const addOnGroups = await this.getAddOnGroups();

    const settings = Array.isArray(storeData.store_settings)
      ? storeData.store_settings[0]
      : storeData.store_settings;

    return {
      store: {
        name: storeData.name,
        slogan: settings?.slogan || "Sabor que une pessoas.",
        currency: settings?.currency || "BRL",
        locale: settings?.locale || "pt-BR",
        whatsapp: storeData.whatsapp,
        deliveryFeeCents: settings?.delivery_fee_cents ?? 690,
        minimumOrderCents: settings?.min_order_cents ?? 0,
        isOpen: storeData.is_active ?? true,
        logoUrl: settings?.logo_url || defaultStoreConfig.logoUrl,
        faviconUrl: settings?.favicon_url || defaultStoreConfig.faviconUrl,
        bannerUrl: settings?.banner_url || "/images/banner/hero-churrasqueira.webp",
      },
      categories,
      products,
      addOnGroups,
    };
  }

  async getCategories(): Promise<Category[]> {
    const client = this.getClient();

    const { data, error } = await client
      .from("categories")
      .select("slug, name, sort_order, description")
      .eq("store_id", this.storeId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`SupabaseRepository: Erro ao listar categorias: ${error.message}`);
    }

    return (data || []).map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      sort: cat.sort_order,
      description: cat.description || undefined,
    }));
  }

  async getProductsByCategory(categorySlug?: string): Promise<Product[]> {
    const client = this.getClient();

    let query = client
      .from("products")
      .select(
        `
        id,
        slug,
        name,
        description,
        base_price_cents,
        promo_price_cents,
        image_url,
        badge,
        is_active,
        sort_order,
        categories (slug),
        product_ingredients (name, sort_order),
        product_customization_groups (
          sort_order,
          customization_groups (
            id,
            name,
            description,
            type,
            min_selections,
            max_selections,
            is_required,
            sort_order,
            customization_options (
              id,
              name,
              description,
              price_cents,
              is_default,
              is_available,
              sort_order
            )
          )
        )
      `
      )
      .eq("store_id", this.storeId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`SupabaseRepository: Erro ao listar produtos: ${error.message}`);
    }

    const mappedProducts: Product[] = (data || []).map((p: any) => {
      const categorySlugFromRel = p.categories?.slug || "";

      // Ingredientes ordenados
      const ingredients = (p.product_ingredients || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((ing: any) => ing.name);

      // Grupos de customização mapeados
      const customizationGroups: CustomizationGroup[] = (p.product_customization_groups || [])
        .map((rel: any) => rel.customization_groups)
        .filter(Boolean)
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((group: any) => {
          const options: CustomizationOption[] = (group.customization_options || [])
            .filter((opt: any) => opt.is_available)
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((opt: any) => ({
              id: opt.id,
              name: opt.name,
              priceCents: opt.price_cents,
              description: opt.description || undefined,
            }));

          return {
            id: group.id,
            name: group.name,
            description: group.description || undefined,
            min: group.min_selections,
            max: group.max_selections,
            required: group.is_required,
            type: group.type as "addition" | "removal" | "choice",
            options,
          };
        });

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: categorySlugFromRel,
        priceCents: p.promo_price_cents ?? p.base_price_cents,
        image: p.image_url || "/images/products/brasa-classico.webp",
        description: p.description || "",
        badge: p.badge || undefined,
        ingredients,
        customizationGroups,
        available: p.is_active,
      };
    });

    if (categorySlug) {
      return mappedProducts.filter((p) => p.category === categorySlug);
    }

    return mappedProducts;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const products = await this.getProductsByCategory();
    return products.find((p) => p.slug === slug);
  }

  async getAddOnGroups(): Promise<AddOnGroup[]> {
    const client = this.getClient();

    const { data, error } = await client
      .from("customization_groups")
      .select(
        `
        id,
        name,
        min_selections,
        max_selections,
        customization_options (
          id,
          name,
          price_cents,
          is_available
        )
      `
      )
      .eq("store_id", this.storeId)
      .eq("type", "addition");

    if (error) {
      throw new Error(`SupabaseRepository: Erro ao carregar grupos adicionais: ${error.message}`);
    }

    return (data || []).map((group: any) => ({
      id: group.id,
      name: group.name,
      min: group.min_selections,
      max: group.max_selections,
      items: (group.customization_options || [])
        .filter((opt: any) => opt.is_available)
        .map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          priceCents: opt.price_cents,
        })),
    }));
  }

  async getStoreConfig(): Promise<StoreConfig> {
    const client = this.getClient();

    const { data, error } = await client
      .from("stores")
      .select("*, store_settings(*), delivery_zones(*)")
      .eq("id", this.storeId)
      .single();

    if (error || !data) {
      throw new Error(`SupabaseRepository: Erro ao carregar StoreConfig: ${error?.message}`);
    }

    const settings = Array.isArray(data.store_settings)
      ? data.store_settings[0]
      : data.store_settings;

    const zones = data.delivery_zones || [];

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      slogan: settings?.slogan || defaultStoreConfig.slogan,
      description: settings?.description || defaultStoreConfig.description,
      logoUrl: settings?.logo_url || defaultStoreConfig.logoUrl,
      faviconUrl: settings?.favicon_url || defaultStoreConfig.faviconUrl,
      currency: settings?.currency || "BRL",
      locale: settings?.locale || "pt-BR",
      whatsappNumber: data.whatsapp,
      address: {
        street: settings?.address_street || defaultStoreConfig.address.street,
        number: settings?.address_number || defaultStoreConfig.address.number,
        neighborhood: settings?.address_neighborhood || defaultStoreConfig.address.neighborhood,
        city: settings?.address_city || defaultStoreConfig.address.city,
        state: settings?.address_state || defaultStoreConfig.address.state,
        zipCode: settings?.address_zip || defaultStoreConfig.address.zipCode,
      },
      social: settings?.social_links || defaultStoreConfig.social,
      operatingHours: settings?.opening_hours || defaultStoreConfig.operatingHours,
      delivery: {
        feeCents: settings?.delivery_fee_cents ?? defaultStoreConfig.delivery.feeCents,
        minimumOrderCents: settings?.min_order_cents ?? defaultStoreConfig.delivery.minimumOrderCents,
        estimatedTimeMin: settings?.estimated_delivery_time_min ?? 35,
        estimatedTimeMax: settings?.estimated_delivery_time_max ?? 50,
        freeDeliveryThresholdCents: settings?.free_delivery_threshold_cents ?? undefined,
        allowDelivery: settings?.allow_delivery ?? true,
        allowPickup: settings?.allow_pickup ?? true,
        neighborhoodFees: zones.map((z: any) => ({
          name: z.name,
          feeCents: z.fee_cents,
        })),
      },
      acceptedPaymentMethods: settings?.accepted_payment_methods || defaultStoreConfig.acceptedPaymentMethods,
      allowAdvanceOrders: settings?.allow_advance_orders ?? false,
      colors: settings?.brand_colors || defaultStoreConfig.colors,
      isOpen: data.is_active ?? true,
    };
  }
}


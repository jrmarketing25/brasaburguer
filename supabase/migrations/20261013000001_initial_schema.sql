-- ==============================================================================
-- BRASA BURGERS — MIGRATION 001: INITIAL SCHEMA & WHITE LABEL MULTI-TENANCY
-- PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. EXTENSÕES E FUNÇÕES AUXILIARES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função utilitária para atualização automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABELAS CENTRAIS DA LOJA (WHITE LABEL)
-- ==============================================================================

-- Tabela: stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cnpj TEXT,
    phone TEXT,
    whatsapp TEXT NOT NULL,
    email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_stores
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: store_settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
    slogan TEXT,
    description TEXT,
    currency TEXT NOT NULL DEFAULT 'BRL',
    locale TEXT NOT NULL DEFAULT 'pt-BR',
    opening_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
    delivery_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee_cents >= 0),
    min_order_cents INTEGER NOT NULL DEFAULT 0 CHECK (min_order_cents >= 0),
    free_delivery_threshold_cents INTEGER CHECK (free_delivery_threshold_cents >= 0),
    estimated_delivery_time_min INTEGER NOT NULL DEFAULT 30,
    estimated_delivery_time_max INTEGER NOT NULL DEFAULT 50,
    allow_delivery BOOLEAN NOT NULL DEFAULT true,
    allow_pickup BOOLEAN NOT NULL DEFAULT true,
    allow_advance_orders BOOLEAN NOT NULL DEFAULT false,
    address_street TEXT,
    address_number TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    brand_colors JSONB NOT NULL DEFAULT '{
        "background": "#080808",
        "surface": "#1C1C1C",
        "primary": "#FF6A00",
        "secondary": "#E6391F",
        "cream": "#F3E3C7"
    }'::jsonb,
    accepted_payment_methods TEXT[] NOT NULL DEFAULT ARRAY['pix', 'dinheiro', 'cartao_entrega'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_store_settings
    BEFORE UPDATE ON public.store_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: store_members (gestão de permissões de equipe/painel)
CREATE TABLE IF NOT EXISTS public.store_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'operator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_store_member UNIQUE (store_id, user_id)
);

CREATE TRIGGER set_timestamp_store_members
    BEFORE UPDATE ON public.store_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. CATÁLOGO GASTRONÔMICO
-- ==============================================================================

-- Tabela: categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_category_store_slug UNIQUE (store_id, slug)
);

CREATE TRIGGER set_timestamp_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    promo_price_cents INTEGER CHECK (promo_price_cents >= 0),
    image_url TEXT,
    badge TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    prep_time_min INTEGER,
    calories INTEGER,
    serves INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_store_slug UNIQUE (store_id, slug)
);

CREATE TRIGGER set_timestamp_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: product_ingredients (ingredientes que podem ser removidos)
CREATE TABLE IF NOT EXISTS public.product_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_removable BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_product_ingredients
    BEFORE UPDATE ON public.product_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: customization_groups (grupos de adicionais, remoções ou escolhas)
CREATE TABLE IF NOT EXISTS public.customization_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'addition' CHECK (type IN ('addition', 'removal', 'choice')),
    min_selections INTEGER NOT NULL DEFAULT 0 CHECK (min_selections >= 0),
    max_selections INTEGER NOT NULL DEFAULT 1 CHECK (max_selections >= min_selections),
    is_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_customization_groups
    BEFORE UPDATE ON public.customization_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: customization_options (itens de adicionais ou variações)
CREATE TABLE IF NOT EXISTS public.customization_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.customization_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    max_quantity INTEGER NOT NULL DEFAULT 1 CHECK (max_quantity >= 1),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_customization_options
    BEFORE UPDATE ON public.customization_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela associativa: product_customization_groups
CREATE TABLE IF NOT EXISTS public.product_customization_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.customization_groups(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_group UNIQUE (product_id, group_id)
);

CREATE TRIGGER set_timestamp_product_customization_groups
    BEFORE UPDATE ON public.product_customization_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: combo_items (itens e escolhas inclusas em combos)
CREATE TABLE IF NOT EXISTS public.combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL, -- Ex: 'Bebida', 'Acompanhamento'
    included_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    default_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_combo_items
    BEFORE UPDATE ON public.combo_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. LOGÍSTICA & ENTREGAS
-- ==============================================================================

-- Tabela: delivery_zones
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    min_distance_km NUMERIC(5, 2),
    max_distance_km NUMERIC(5, 2),
    fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
    estimated_minutes INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_delivery_zones
    BEFORE UPDATE ON public.delivery_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. PEDIDOS & ITENS DO PEDIDO
-- ==============================================================================

-- Tabela: orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup', 'dine_in')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
    delivery_address JSONB,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'dinheiro', 'cartao_entrega', 'credit_card', 'debit_card')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    change_for_cents INTEGER CHECK (change_for_cents >= 0),
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    delivery_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee_cents >= 0),
    discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    notes TEXT,
    whatsapp_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    customizations JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_order_items
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON public.categories(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product ON public.product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_customization_groups_store ON public.customization_groups(store_id);
CREATE INDEX IF NOT EXISTS idx_customization_options_group ON public.customization_options(group_id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_store ON public.delivery_zones(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

-- Função auxiliar para verificar permissão administrativa do usuário na loja
CREATE OR REPLACE FUNCTION public.is_store_member(lookup_store_id UUID, lookup_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.store_members
        WHERE store_id = lookup_store_id AND user_id = lookup_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilita RLS em todas as tabelas
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: stores
CREATE POLICY "Public read active stores" ON public.stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store members manage their store" ON public.stores
    FOR ALL USING (public.is_store_member(id));

-- POLÍTICAS: store_settings
CREATE POLICY "Public read store settings" ON public.store_settings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_settings.store_id AND stores.is_active = true)
    );

CREATE POLICY "Store members manage settings" ON public.store_settings
    FOR ALL USING (public.is_store_member(store_id));

-- POLÍTICAS: store_members
CREATE POLICY "Store members view team" ON public.store_members
    FOR SELECT USING (public.is_store_member(store_id));

CREATE POLICY "Store owners manage team" ON public.store_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.store_members sm
            WHERE sm.store_id = store_members.store_id
              AND sm.user_id = auth.uid()
              AND sm.role = 'owner'
        )
    );

-- POLÍTICAS: categories
CREATE POLICY "Public read active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store members manage categories" ON public.categories
    FOR ALL USING (public.is_store_member(store_id));

-- POLÍTICAS: products
CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store members manage products" ON public.products
    FOR ALL USING (public.is_store_member(store_id));

-- POLÍTICAS: product_ingredients
CREATE POLICY "Public read ingredients" ON public.product_ingredients
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_ingredients.product_id AND p.is_active = true)
    );

CREATE POLICY "Store members manage ingredients" ON public.product_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_ingredients.product_id AND public.is_store_member(p.store_id)
        )
    );

-- POLÍTICAS: customization_groups
CREATE POLICY "Public read customization groups" ON public.customization_groups
    FOR SELECT USING (true);

CREATE POLICY "Store members manage customization groups" ON public.customization_groups
    FOR ALL USING (public.is_store_member(store_id));

-- POLÍTICAS: customization_options
CREATE POLICY "Public read customization options" ON public.customization_options
    FOR SELECT USING (is_available = true);

CREATE POLICY "Store members manage customization options" ON public.customization_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customization_groups g
            WHERE g.id = customization_options.group_id AND public.is_store_member(g.store_id)
        )
    );

-- POLÍTICAS: product_customization_groups
CREATE POLICY "Public read product customization links" ON public.product_customization_groups
    FOR SELECT USING (true);

CREATE POLICY "Store members manage product customization links" ON public.product_customization_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_customization_groups.product_id AND public.is_store_member(p.store_id)
        )
    );

-- POLÍTICAS: combo_items
CREATE POLICY "Public read combo items" ON public.combo_items
    FOR SELECT USING (true);

CREATE POLICY "Store members manage combo items" ON public.combo_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = combo_items.combo_product_id AND public.is_store_member(p.store_id)
        )
    );

-- POLÍTICAS: delivery_zones
CREATE POLICY "Public read active delivery zones" ON public.delivery_zones
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store members manage delivery zones" ON public.delivery_zones
    FOR ALL USING (public.is_store_member(store_id));

-- POLÍTICAS: orders
CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Store members manage orders" ON public.orders
    FOR ALL USING (public.is_store_member(store_id));

-- POLÍTICAS: order_items
CREATE POLICY "Public can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Store members manage order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id AND public.is_store_member(o.store_id)
        )
    );

-- ==============================================================================
-- 8. STORAGE BUCKETS (CONFIGURAÇÃO IDEMPOTENTE)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES 
            ('logos', 'logos', true),
            ('products', 'products', true),
            ('banners', 'banners', true)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;


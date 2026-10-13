-- ==============================================================================
-- BRASA BURGERS — MIGRATION 005: WHITE LABEL ASSETS & BRANDING FIELDS
-- ==============================================================================

-- 1. Adicionar colunas de identidade visual em store_settings
ALTER TABLE public.store_settings
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS favicon_url TEXT,
    ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Garantir valores padrão para a loja BRASA BURGERS
UPDATE public.store_settings
SET
    logo_url = COALESCE(logo_url, '/images/brand/logo-brasa-vetorial.svg'),
    favicon_url = COALESCE(favicon_url, '/images/brand/favicon.svg'),
    banner_url = COALESCE(banner_url, '/images/banner/hero-churrasqueira.webp')
WHERE store_id = 'a0000000-0000-0000-0000-000000000001';

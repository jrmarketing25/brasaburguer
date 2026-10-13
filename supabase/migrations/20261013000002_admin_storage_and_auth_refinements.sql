-- ==============================================================================
-- BRASA BURGERS — MIGRATION 002: STORAGE POLICIES & AUTH MEMBERSHIP REFINEMENTS
-- ==============================================================================

-- 1. Políticas de Storage para upload de imagens (logos, products, banners)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        -- Leitura pública dos buckets do catálogo
        DROP POLICY IF EXISTS "Public read catalog assets" ON storage.objects;
        CREATE POLICY "Public read catalog assets" ON storage.objects
            FOR SELECT USING (bucket_id IN ('logos', 'products', 'banners'));

        -- Upload por usuários autenticados
        DROP POLICY IF EXISTS "Authenticated users upload catalog assets" ON storage.objects;
        CREATE POLICY "Authenticated users upload catalog assets" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id IN ('logos', 'products', 'banners')
                AND auth.role() = 'authenticated'
            );

        -- Atualização por usuários autenticados
        DROP POLICY IF EXISTS "Authenticated users update catalog assets" ON storage.objects;
        CREATE POLICY "Authenticated users update catalog assets" ON storage.objects
            FOR UPDATE USING (
                bucket_id IN ('logos', 'products', 'banners')
                AND auth.role() = 'authenticated'
            );

        -- Exclusão por usuários autenticados
        DROP POLICY IF EXISTS "Authenticated users delete catalog assets" ON storage.objects;
        CREATE POLICY "Authenticated users delete catalog assets" ON storage.objects
            FOR DELETE USING (
                bucket_id IN ('logos', 'products', 'banners')
                AND auth.role() = 'authenticated'
            );
    END IF;
END $$;

-- 2. Garantir que o usuário autenticado consiga consultar seu próprio registro de equipe
DROP POLICY IF EXISTS "Users view own membership" ON public.store_members;
CREATE POLICY "Users view own membership" ON public.store_members
    FOR SELECT USING (user_id = auth.uid());

